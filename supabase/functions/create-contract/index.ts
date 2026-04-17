import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as ed from "https://esm.sh/@noble/ed25519@2.1.0";
import { sha512 } from "https://esm.sh/@noble/hashes@1.4.0/sha512";

// @ts-ignore - configure ed25519 sync hash
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

// Stellar StrKey encoding (ed25519 public key → "G..." address, secret → "S..." seed)
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(data: Uint8Array): string {
  let bits = 0, value = 0, output = "";
  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}
function crc16(data: Uint8Array): Uint8Array {
  let crc = 0x0000;
  for (const b of data) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return new Uint8Array([crc & 0xff, (crc >> 8) & 0xff]);
}
function encodeStrKey(versionByte: number, payload: Uint8Array): string {
  const data = new Uint8Array(1 + payload.length);
  data[0] = versionByte;
  data.set(payload, 1);
  const checksum = crc16(data);
  const full = new Uint8Array(data.length + 2);
  full.set(data);
  full.set(checksum, data.length);
  return base32Encode(full);
}
function generateStellarKeypair(): { publicKey: string; secret: string } {
  const seed = ed.utils.randomPrivateKey();
  const pub = ed.getPublicKey(seed);
  return {
    publicKey: encodeStrKey(6 << 3, pub),  // 'G' = 0x30
    secret: encodeStrKey(18 << 3, seed),   // 'S' = 0x90
  };
}

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
