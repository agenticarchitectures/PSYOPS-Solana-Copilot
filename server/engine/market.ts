const JUPITER_QUOTE_URL = "https://api.jup.ag/swap/v1/quote";

const MINT_MAP: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

export interface MarketData {
  impliedPrice: number;
  slippageBps: number;
  impact: number;
  routeSummary: string;
}

export async function getImpliedPrice(pair: string, notional: number): Promise<MarketData> {
  // Use mock implementation if USE_MOCKS is enabled
  if (process.env.USE_MOCKS === "true") {
    const { getImpliedPriceMock } = await import("./market.mock");
    return getImpliedPriceMock(pair, notional);
  }

  const [base, quote] = pair.split("-");
  const inputMint = MINT_MAP[quote] || MINT_MAP["USDC"];
  const outputMint = MINT_MAP[base] || MINT_MAP["SOL"];

  const amount = Math.round(notional * 1_000_000);

  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: "50",
    });

    const headers: Record<string, string> = {};
    if (process.env.JUPITER_API_KEY) {
      headers["x-api-key"] = process.env.JUPITER_API_KEY;
    }

    const resp = await fetch(`${JUPITER_QUOTE_URL}?${params}`, { headers });
    if (!resp.ok) {
      throw new Error(`Jupiter API returned ${resp.status}`);
    }

    const data = await resp.json();
    const inAmountNum = parseInt(data.inAmount) / 1_000_000;
    const outAmountNum = parseInt(data.outAmount) / 1_000_000_000;

    const impliedPrice = inAmountNum / outAmountNum;
    const slippageBps = data.slippageBps ?? 0;
    const impact = data.priceImpactPct ? parseFloat(data.priceImpactPct) : 0;

    const routeInfo = data.routePlan
      ? data.routePlan.map((r: any) => r.swapInfo?.label || "unknown").join(" -> ")
      : "direct";

    return {
      impliedPrice,
      slippageBps: typeof slippageBps === "number" ? slippageBps : parseInt(slippageBps) || 0,
      impact,
      routeSummary: routeInfo,
    };
  } catch (err: any) {
    console.error("[market] Jupiter quote error:", err.message);
    return {
      impliedPrice: 0,
      slippageBps: 0,
      impact: 0,
      routeSummary: "error",
    };
  }
}
