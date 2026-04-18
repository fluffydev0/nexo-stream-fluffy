import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Verify the escrow account exists on Stellar testnet via Horizon REST API.
// Returns the native (XLM) balance — proof the account is real and funded on-chain.
async function verifyEscrowOnChain(
  publicKey: string,
): Promise<{ exists: boolean; native_balance?: string; error?: string }> {
  try {
    const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
    if (res.status === 404) {
      return { exists: false, error: "Escrow account not found on Stellar testnet" };
    }
    if (!res.ok) {
      return { exists: false, error: `Horizon http ${res.status}` };
    }
    const json = await res.json();
    const native = (json.balances ?? []).find((b: any) => b.asset_type === "native");
    return { exists: true, native_balance: native?.balance ?? "0" };
  } catch (err) {
    return { exists: false, error: (err as Error).message };
  }
}

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

    // ---- Real on-chain verification via Horizon REST API ----
    // We confirm the escrow account exists on Stellar testnet and read its native balance.
    // If the account doesn't exist yet (e.g. friendbot was rate-limited at creation),
    // re-fund it now via friendbot before marking funded.
    let onchain = await verifyEscrowOnChain(contract.escrow_pubkey);
    let friendbotRetryHash: string | null = null;

    if (!onchain.exists) {
      console.log("escrow not on-chain, retrying friendbot:", contract.escrow_pubkey);
      try {
        const fb = await fetch(
          `https://friendbot.stellar.org?addr=${encodeURIComponent(contract.escrow_pubkey)}`,
        );
        if (fb.ok) {
          const fbJson = await fb.json();
          friendbotRetryHash = fbJson?.hash ?? null;
          // re-check
          onchain = await verifyEscrowOnChain(contract.escrow_pubkey);
        }
      } catch (e) {
        console.warn("friendbot retry failed:", e);
      }
    }

    if (!onchain.exists) {
      return new Response(
        JSON.stringify({
          error: "Stellar escrow could not be verified on-chain",
          details: onchain.error,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mark funded — escrow account is provably live on Stellar testnet
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
      details: {
        amount: contract.total_amount,
        escrow_pubkey: contract.escrow_pubkey,
        stellar_network: contract.stellar_network,
        onchain_native_balance: onchain.native_balance,
        friendbot_retry_tx: friendbotRetryHash,
        verified_via: "horizon-testnet.stellar.org",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        contract_id: contract.id,
        escrow_pubkey: contract.escrow_pubkey,
        onchain_native_balance: onchain.native_balance,
        explorer_url: `https://stellar.expert/explorer/testnet/account/${contract.escrow_pubkey}`,
      }),
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
