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
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { milestone_id, auto } = await req.json();
    if (!milestone_id) {
      return new Response(JSON.stringify({ error: "milestone_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: ms } = await admin
      .from("contract_milestones")
      .select("*, contracts!inner(client_id, freelancer_id, status)")
      .eq("id", milestone_id)
      .maybeSingle();
    if (!ms) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // @ts-ignore
    const isClient = ms.contracts.client_id === user.id;
    // @ts-ignore
    const isFreelancer = ms.contracts.freelancer_id === user.id;
    if (!isClient && !isFreelancer && !auto) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (ms.status !== "pending_approval") {
      return new Response(
        JSON.stringify({ error: "Milestone not pending" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Simulate Stellar release tx
    const fakeTxHash = `simulated_${crypto.randomUUID().replace(/-/g, "")}`;
    const now = new Date().toISOString();

    await admin
      .from("contract_milestones")
      .update({
        status: "paid",
        approved_at: now,
        paid_at: now,
        stellar_tx_hash: fakeTxHash,
      })
      .eq("id", milestone_id);

    // Unlock next milestone
    const { data: next } = await admin
      .from("contract_milestones")
      .select("id, position")
      .eq("contract_id", ms.contract_id)
      .eq("position", ms.position + 1)
      .maybeSingle();

    if (next) {
      await admin
        .from("contract_milestones")
        .update({ status: "in_progress" })
        .eq("id", next.id);
    } else {
      // All milestones complete
      await admin
        .from("contracts")
        .update({ status: "completed", completed_at: now })
        .eq("id", ms.contract_id);
    }

    await admin.from("contract_events").insert({
      contract_id: ms.contract_id,
      milestone_id,
      actor_id: user.id,
      actor_role: auto ? "system" : (isClient ? "client" : "freelancer"),
      event_type: auto ? "milestone_auto_released" : "milestone_approved",
      details: { tx_hash: fakeTxHash, amount: ms.amount },
    });

    return new Response(
      JSON.stringify({ success: true, tx_hash: fakeTxHash }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("approve-milestone error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
