import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Keypair } from "https://esm.sh/@stellar/stellar-sdk@12.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MilestoneInput {
  title: string;
  description?: string;
  amount: number;
  due_date: string;
}

interface CreateContractInput {
  title: string;
  description?: string;
  client_email: string;
  total_amount: number;
  deadline: string;
  dispute_method: "auto_release_72h" | "nexolpay_arbitration";
  milestones: MilestoneInput[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const body: CreateContractInput = await req.json();

    // Validation
    if (!body.title || !body.client_email || !body.total_amount || !body.deadline) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.milestones || body.milestones.length < 1 || body.milestones.length > 6) {
      return new Response(JSON.stringify({ error: "Need 1-6 milestones" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sum = body.milestones.reduce((a, m) => a + Number(m.amount), 0);
    if (Math.abs(sum - body.total_amount) > 0.01) {
      return new Response(
        JSON.stringify({ error: "Milestone amounts must equal total" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Generate Stellar testnet escrow keypair
    const escrow = Keypair.random();

    // Generate contract code
    const { data: codeData, error: codeErr } = await admin.rpc(
      "generate_contract_code",
    );
    if (codeErr) throw codeErr;

    // Insert contract
    const { data: contract, error: contractErr } = await admin
      .from("contracts")
      .insert({
        contract_code: codeData,
        freelancer_id: user.id,
        freelancer_email: user.email!,
        client_email: body.client_email.toLowerCase().trim(),
        title: body.title,
        description: body.description ?? null,
        total_amount: body.total_amount,
        deadline: body.deadline,
        dispute_method: body.dispute_method,
        escrow_pubkey: escrow.publicKey(),
        escrow_secret: escrow.secret(),
        stellar_network: "testnet",
        status: "awaiting_funding",
      })
      .select()
      .single();

    if (contractErr) throw contractErr;

    // Insert milestones
    const milestoneRows = body.milestones.map((m, i) => ({
      contract_id: contract.id,
      position: i + 1,
      title: m.title,
      description: m.description ?? null,
      amount: m.amount,
      percentage: (Number(m.amount) / body.total_amount) * 100,
      due_date: m.due_date,
      status: "locked" as const,
    }));

    const { error: msErr } = await admin
      .from("contract_milestones")
      .insert(milestoneRows);
    if (msErr) throw msErr;

    // Log event
    await admin.from("contract_events").insert({
      contract_id: contract.id,
      actor_id: user.id,
      actor_role: "freelancer",
      event_type: "contract_created",
      details: { milestones: body.milestones.length, total: body.total_amount },
    });

    return new Response(
      JSON.stringify({
        success: true,
        contract_id: contract.id,
        contract_code: contract.contract_code,
        public_share_code: contract.public_share_code,
        escrow_pubkey: contract.escrow_pubkey,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-contract error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
