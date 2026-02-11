import type { Receipt } from "./tradingEngine";

export interface Executor {
  name: string;
  execute(params: {
    pair: string;
    side: "BUY" | "SELL";
    notional: number;
    fillPrice: number;
  }): Promise<{ txid: string }>;
}

export class PaperExecutor implements Executor {
  name = "paper";

  async execute(params: {
    pair: string;
    side: "BUY" | "SELL";
    notional: number;
    fillPrice: number;
  }): Promise<{ txid: string }> {
    return { txid: "paper-mode" };
  }
}

export class JupiterExecutor implements Executor {
  name = "jupiter";

  async execute(_params: {
    pair: string;
    side: "BUY" | "SELL";
    notional: number;
    fillPrice: number;
  }): Promise<{ txid: string }> {
    throw new Error(
      "[JupiterExecutor] Phase 2 - not implemented. Wire Agent Kit's trade() here for real Jupiter swaps."
    );
  }
}
