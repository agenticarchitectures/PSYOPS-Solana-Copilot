import { sharedState } from "./state";
import { getConfig } from "./config";
import { getMarket, getSignal, executeTrade } from "./tradingEngine";
import { updateRollingPrices } from "./signal";
import { checkRisk } from "./risk";
import { decideAction, type LLMContext } from "./llmPlanner";

let loopTimer: ReturnType<typeof setTimeout> | null = null;

export function startLoop(): void {
  if (sharedState.running) return;
  sharedState.running = true;
  console.log("[loop] Autonomous trading loop started");
  scheduleNext();
}

export function stopLoop(): void {
  sharedState.running = false;
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }
  console.log("[loop] Autonomous trading loop stopped");
}

function scheduleNext(): void {
  if (!sharedState.running) return;
  const cfg = getConfig();
  loopTimer = setTimeout(async () => {
    await tick();
    scheduleNext();
  }, cfg.cooldownSec * 1000);
}

async function tick(): Promise<void> {
  if (!sharedState.running) return;

  const cfg = getConfig();
  const pair = cfg.pair;

  try {
    const market = await getMarket(pair);
    if (market.impliedPrice <= 0) {
      console.log("[loop] Invalid market price, skipping cycle");
      return;
    }

    sharedState.lastImpliedPrice = market.impliedPrice;
    updateRollingPrices(market.impliedPrice);

    const signal = getSignal(pair);
    sharedState.lastSignal = signal.signal;
    sharedState.lastStrength = signal.strength;

    const risk = checkRisk(cfg.maxNotional, market.slippageBps, cfg);
    sharedState.lastRiskAllowed = risk.allowed;
    sharedState.lastRiskChecks = risk.checks;

    const lastActions = sharedState.tradeHistory.slice(-5).map((a) => ({
      ts: a.ts,
      side: a.side,
      price: a.price,
    }));

    const context: LLMContext = {
      pair,
      impliedPrice: market.impliedPrice,
      rollingHigh: signal.rollingHigh,
      rollingLow: signal.rollingLow,
      breakoutSignal: signal.signal,
      breakoutStrength: signal.strength,
      slippageBps: market.slippageBps,
      risk: { allowed: risk.allowed, checks: risk.checks },
      lastActions,
    };

    const decision = await decideAction(context);
    sharedState.lastConfidence = decision.confidence;
    sharedState.lastReasons = decision.reasons;

    console.log(`[loop] Decision: ${decision.action} (conf=${decision.confidence.toFixed(2)})`);

    if (
      (decision.action === "BUY" || decision.action === "SELL") &&
      risk.allowed &&
      decision.confidence > 0.3
    ) {
      const receipt = await executeTrade(
        pair,
        decision.action,
        cfg.maxNotional,
        decision.confidence,
        decision.reasons,
        "auto"
      );
      console.log(`[loop] Executed ${decision.action} → receipt ${receipt.id}, memo: ${receipt.memoTxid}`);
    }
  } catch (err: any) {
    console.error("[loop] Tick error:", err.message);
  }
}
