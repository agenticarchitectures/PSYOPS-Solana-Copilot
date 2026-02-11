import { getMarket, getSignal, executeTrade, getReceiptById, getReceipts } from "../engine/tradingEngine";
import { getConfig } from "../engine/config";
import { checkRisk } from "../engine/risk";

export function manifest() {
  return {
    name: "solana-trading-skill",
    version: "0.1.0",
    description: "LLM-driven trading intelligence + on-chain receipts (paper mode)",
    actions: {
      get_market: { pair: "string" },
      get_signal: { pair: "string" },
      propose_trade: { pair: "string", side: "string", notional: "number" },
      execute_trade: { pair: "string", side: "string", notional: "number" },
      get_receipt: { id: "string" },
    },
  };
}

export async function invoke(action: string, args: Record<string, any>): Promise<any> {
  switch (action) {
    case "get_market": {
      const pair = args.pair || getConfig().pair;
      return getMarket(pair);
    }
    case "get_signal": {
      const pair = args.pair || getConfig().pair;
      return getSignal(pair);
    }
    case "propose_trade": {
      const pair = args.pair || getConfig().pair;
      const side = args.side as "BUY" | "SELL";
      const notional = args.notional || getConfig().maxNotional;
      const market = await getMarket(pair);
      const cfg = getConfig();
      const risk = checkRisk(notional, market.slippageBps, cfg);
      return { market, risk };
    }
    case "execute_trade": {
      const pair = args.pair || getConfig().pair;
      const side = args.side as "BUY" | "SELL";
      const notional = args.notional || getConfig().maxNotional;
      return executeTrade(pair, side, notional, 0.5, ["manual skill invoke"], "skill");
    }
    case "get_receipt": {
      if (args.id) return getReceiptById(args.id);
      return getReceipts();
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
