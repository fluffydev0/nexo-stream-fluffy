import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Auth required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { share_code } = await req.json();
    if (!share_code) {
      return new Response(JSON.stringify({ error: "Missing share_code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: contract, error: getErr } = await admin
      .from("contracts")
      .select("*")
      .eq("public_share_code", share_code)
      .maybeSingle();

    if (getErr) throw getErr;
    if (!contract) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify client identity
    if (contract.client_email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "This contract is for a different email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (contract.status !== "awaiting_funding") {
      return new Response(
        JSON.stringify({ error: "Contract already funded or closed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mark funded (testnet simulation — real flow would verify on-chain payment)
    const { error: updErr } = await admin
      .from("contracts")
      .update({
        status: "active",
        client_id: user.id,
        funded_at: new Date().toISOString(),
      })
      .eq("id", contract.id);
    if (updErr) throw updErr;

    // Unlock first milestone
    await admin
      .from("contract_milestones")
      .update({ status: "in_progress" })
      .eq("contract_id", contract.id)
      .eq("position", 1);

    await admin.from("contract_events").insert({
      contract_id: contract.id,
      actor_id: user.id,
      actor_role: "client",
      event_type: "contract_funded",
      details: { amount: contract.total_amount, escrow: contract.escrow_pubkey },
    });

    return new Response(
      JSON.stringify({ success: true, contract_id: contract.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("fund-contract error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
