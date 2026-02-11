import { sharedState } from "./state";

export interface RiskResult {
  allowed: boolean;
  checks: {
    cooldownOK: boolean;
    maxNotionalOK: boolean;
    maxDailyLossOK: boolean;
    slippageOK: boolean;
  };
}

export function checkRisk(
  notional: number,
  slippageBps: number,
  config: {
    maxNotional: number;
    maxSlippageBps: number;
    cooldownSec: number;
    maxDailyLoss: number;
  }
): RiskResult {
  const now = Date.now();

  if (now - sharedState.dailyLossResetTs > 86400000) {
    sharedState.dailyLoss = 0;
    sharedState.dailyLossResetTs = now;
  }

  const cooldownOK = now - sharedState.lastTradeTs >= config.cooldownSec * 1000;
  const maxNotionalOK = notional <= config.maxNotional;
  const maxDailyLossOK = sharedState.dailyLoss < config.maxDailyLoss;
  const slippageOK = slippageBps <= config.maxSlippageBps;

  const allowed = cooldownOK && maxNotionalOK && maxDailyLossOK && slippageOK;

  return {
    allowed,
    checks: { cooldownOK, maxNotionalOK, maxDailyLossOK, slippageOK },
  };
}
