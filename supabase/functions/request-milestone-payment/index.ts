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

    const { milestone_id, deliverable_url, deliverable_note } = await req.json();
    if (!milestone_id) {
      return new Response(JSON.stringify({ error: "milestone_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: ms } = await admin
      .from("contract_milestones")
      .select("*, contracts!inner(freelancer_id, status, dispute_method)")
      .eq("id", milestone_id)
      .maybeSingle();

    if (!ms) {
      return new Response(JSON.stringify({ error: "Milestone not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // @ts-ignore
    if (ms.contracts.freelancer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not the freelancer" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // @ts-ignore
    if (ms.contracts.status !== "active") {
      return new Response(JSON.stringify({ error: "Contract not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (ms.status !== "in_progress") {
      return new Response(
        JSON.stringify({ error: "Milestone not in progress" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const autoRelease = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { error } = await admin
      .from("contract_milestones")
      .update({
        status: "pending_approval",
        payment_requested_at: new Date().toISOString(),
        auto_release_at: autoRelease,
        deliverable_url: deliverable_url ?? null,
        deliverable_note: deliverable_note ?? null,
      })
      .eq("id", milestone_id);
    if (error) throw error;

    await admin.from("contract_events").insert({
      contract_id: ms.contract_id,
      milestone_id,
      actor_id: user.id,
      actor_role: "freelancer",
      event_type: "milestone_payment_requested",
      details: { auto_release_at: autoRelease },
    });

    return new Response(
      JSON.stringify({ success: true, auto_release_at: autoRelease }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("request-milestone-payment error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
