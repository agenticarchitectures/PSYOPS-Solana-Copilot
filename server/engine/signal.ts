import { sharedState } from "./state";

const WINDOW_SIZE = 30;

export interface SignalResult {
  signal: "BUY" | "SELL" | "HOLD";
  strength: number;
  rollingHigh: number;
  rollingLow: number;
}

export function updateRollingPrices(price: number): void {
  sharedState.rollingPrices.push(price);
  if (sharedState.rollingPrices.length > WINDOW_SIZE) {
    sharedState.rollingPrices.shift();
  }
}

export function computeSignal(breakoutThresholdBps: number): SignalResult {
  const prices = sharedState.rollingPrices;

  if (prices.length < 3) {
    return { signal: "HOLD", strength: 0, rollingHigh: 0, rollingLow: 0 };
  }

  const currentPrice = prices[prices.length - 1];
  const priorPrices = prices.slice(0, -1);
  const rollingHigh = Math.max(...priorPrices);
  const rollingLow = Math.min(...priorPrices);
  const range = rollingHigh - rollingLow;

  if (range === 0) {
    return { signal: "HOLD", strength: 0, rollingHigh, rollingLow };
  }

  const highBreakoutBps = ((currentPrice - rollingHigh) / rollingHigh) * 10000;
  const lowBreakoutBps = ((rollingLow - currentPrice) / rollingLow) * 10000;

  if (highBreakoutBps >= breakoutThresholdBps) {
    const strength = Math.min(1, highBreakoutBps / (breakoutThresholdBps * 3));
    return { signal: "BUY", strength, rollingHigh, rollingLow };
  }

  if (lowBreakoutBps >= breakoutThresholdBps) {
    const strength = Math.min(1, lowBreakoutBps / (breakoutThresholdBps * 3));
    return { signal: "SELL", strength, rollingHigh, rollingLow };
  }

  const position = (currentPrice - rollingLow) / range;
  if (position > 0.8) {
    return { signal: "BUY", strength: (position - 0.8) * 5 * 0.3, rollingHigh, rollingLow };
  }
  if (position < 0.2) {
    return { signal: "SELL", strength: (0.2 - position) * 5 * 0.3, rollingHigh, rollingLow };
  }

  return { signal: "HOLD", strength: 0, rollingHigh, rollingLow };
}
