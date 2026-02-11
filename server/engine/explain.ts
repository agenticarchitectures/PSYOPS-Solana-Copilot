import type { MarketData } from "./market";
import type { SignalResult } from "./signal";
import type { RiskResult } from "./risk";

export function buildExplanation(
  market: MarketData,
  signal: SignalResult,
  risk: RiskResult
): string[] {
  const reasons: string[] = [];

  reasons.push(
    `Implied price $${market.impliedPrice.toFixed(2)} via ${market.routeSummary}`
  );

  if (signal.signal !== "HOLD") {
    reasons.push(
      `${signal.signal} signal detected with strength ${signal.strength.toFixed(2)} (range $${signal.rollingLow.toFixed(2)}-$${signal.rollingHigh.toFixed(2)})`
    );
  } else {
    reasons.push("No strong breakout signal detected, holding position");
  }

  if (!risk.allowed) {
    const blocked: string[] = [];
    if (!risk.checks.cooldownOK) blocked.push("cooldown active");
    if (!risk.checks.maxNotionalOK) blocked.push("max notional exceeded");
    if (!risk.checks.maxDailyLossOK) blocked.push("daily loss limit hit");
    if (!risk.checks.slippageOK) blocked.push("slippage too high");
    reasons.push(`Risk blocked: ${blocked.join(", ")}`);
  } else {
    reasons.push("All risk checks passed");
  }

  if (market.slippageBps > 0) {
    reasons.push(`Slippage: ${market.slippageBps}bps, impact: ${(market.impact * 100).toFixed(3)}%`);
  }

  return reasons;
}
