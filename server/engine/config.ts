export interface TradingConfig {
  pair: string;
  maxNotional: number;
  maxSlippageBps: number;
  cooldownSec: number;
  maxDailyLoss: number;
  breakoutThresholdBps: number;
}

export function getConfig(): TradingConfig {
  return {
    pair: process.env.DEFAULT_PAIR || "SOL-USDC",
    maxNotional: parseInt(process.env.MAX_NOTIONAL || "20"),
    maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS || "50"),
    cooldownSec: parseInt(process.env.COOLDOWN_SEC || "60"),
    maxDailyLoss: parseInt(process.env.MAX_DAILY_LOSS || "10"),
    breakoutThresholdBps: parseInt(process.env.BREAKOUT_THRESHOLD_BPS || "30"),
  };
}
