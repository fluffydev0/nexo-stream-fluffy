import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as ed from "https://esm.sh/@noble/ed25519@2.1.0";
import { sha512 } from "https://esm.sh/@noble/hashes@1.4.0/sha512";

// @ts-ignore - configure ed25519 sync hash
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

// Stellar StrKey encoding (ed25519 public key → "G..." address)
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
    publicKey: encodeStrKey(6 << 3, pub),
    secret: encodeStrKey(18 << 3, seed),
  };
}

async function fundTestnetAccount(publicKey: string): Promise<{ funded: boolean; tx_hash?: string; error?: string }> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    const json = await res.json();
    if (!res.ok) {
      return { funded: false, error: json?.detail ?? json?.title ?? `friendbot http ${res.status}` };
    }
    return { funded: true, tx_hash: json?.hash };
  } catch (err) {
    return { funded: false, error: (err as Error).message };
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `SCH-${year}-${rand}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      wallet_address,
      type,
      total_amount,
      weekly_amount,
      num_weeks,
      start_date,
    } = body ?? {};

    // Basic validation
    if (!wallet_address || typeof wallet_address !== "string") {
      return new Response(JSON.stringify({ error: "wallet_address required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (type !== "7day" && type !== "monthly") {
      return new Response(JSON.stringify({ error: "type must be '7day' or 'monthly'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const total = Number(total_amount);
    const weekly = Number(weekly_amount);
    const weeks = Number(num_weeks);
    if (!Number.isFinite(total) || total <= 0) {
      return new Response(JSON.stringify({ error: "total_amount must be > 0" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Number.isFinite(weekly) || weekly <= 0) {
      return new Response(JSON.stringify({ error: "weekly_amount must be > 0" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
      return new Response(JSON.stringify({ error: "num_weeks must be 1-52" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startMs = start_date ? new Date(start_date).getTime() : Date.now();
    if (!Number.isFinite(startMs)) {
      return new Response(JSON.stringify({ error: "invalid start_date" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate Stellar testnet escrow account
    const keypair = generateStellarKeypair();
    const fundResult = await fundTestnetAccount(keypair.publicKey);

    const reference = generateReference();

    // Insert position
    const { data: position, error: posErr } = await supabase
      .from("scheduler_positions")
      .insert({
        user_id: user.id,
        type,
        total_amount: total,
        weekly_amount: weekly,
        num_weeks: weeks,
        start_date: new Date(startMs).toISOString(),
        status: "active",
        reference_number: reference,
        escrow_pubkey: keypair.publicKey,
        escrow_secret: keypair.secret,
        stellar_network: "testnet",
      })
      .select()
      .single();

    if (posErr || !position) {
      return new Response(JSON.stringify({ error: posErr?.message ?? "Failed to create position" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build weekly transactions
    const txRows = [];
    for (let i = 1; i <= weeks; i++) {
      const unlock = Math.floor((startMs + i * 7 * 24 * 60 * 60 * 1000) / 1000);
      txRows.push({
        position_id: position.id,
        user_id: user.id,
        week_number: i,
        amount: weekly,
        unlock_timestamp: unlock,
        submitted: false,
      });
    }

    const { error: txErr } = await supabase
      .from("scheduler_transactions")
      .insert(txRows);

    if (txErr) {
      // rollback position
      await supabase.from("scheduler_positions").delete().eq("id", position.id);
      return new Response(JSON.stringify({ error: txErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        position_id: position.id,
        reference_number: reference,
        escrow_pubkey: keypair.publicKey,
        escrow_funded: fundResult.funded,
        escrow_funding_tx: fundResult.tx_hash ?? null,
        escrow_funding_error: fundResult.error ?? null,
        weeks_scheduled: weeks,
        explorer_url: `https://stellar.expert/explorer/testnet/account/${keypair.publicKey}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-stellar-schedule error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
