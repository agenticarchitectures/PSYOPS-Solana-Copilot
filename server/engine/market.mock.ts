import { MarketData } from "./market";

/**
 * Mock market data provider for testing without Jupiter API costs
 *
 * Simulates realistic SOL/USDC price movements with:
 * - Base price around $150-200 with random walk
 * - Realistic slippage based on trade size
 * - Simulated price volatility
 */

// Persistent state for price simulation
let basePrice = 175.0; // Starting SOL price in USDC
let priceVelocity = 0;
let lastUpdateTime = Date.now();

function updatePrice() {
  const now = Date.now();
  const timeDelta = (now - lastUpdateTime) / 1000; // seconds
  lastUpdateTime = now;

  // Random walk with mean reversion
  const volatility = 0.5; // Price change per second
  const meanReversionStrength = 0.05;
  const targetPrice = 175.0;

  // Add random movement
  const randomChange = (Math.random() - 0.5) * volatility * timeDelta;

  // Mean reversion force
  const meanReversion = (targetPrice - basePrice) * meanReversionStrength * timeDelta;

  // Update velocity with damping
  priceVelocity = priceVelocity * 0.95 + randomChange + meanReversion;

  // Update price
  basePrice += priceVelocity;

  // Keep price in reasonable range
  basePrice = Math.max(150, Math.min(200, basePrice));
}

/**
 * Get simulated market data for a trading pair
 */
export async function getImpliedPriceMock(pair: string, notional: number): Promise<MarketData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

  // Update simulated price
  updatePrice();

  // Calculate slippage based on trade size
  // Larger trades have more slippage
  const baseSlippageBps = 10 + Math.random() * 15; // 10-25 bps base
  const sizeImpactBps = (notional / 100) * 5; // 5 bps per $100
  const totalSlippageBps = Math.round(baseSlippageBps + sizeImpactBps);

  // Calculate price impact
  const impact = (totalSlippageBps / 10000) * 100; // Convert bps to percentage

  // Add small random variation to price
  const priceVariation = (Math.random() - 0.5) * 0.5;
  const impliedPrice = basePrice + priceVariation;

  console.log(`[market.mock] ${pair} price: $${impliedPrice.toFixed(2)}, slippage: ${totalSlippageBps} bps`);

  return {
    impliedPrice,
    slippageBps: totalSlippageBps,
    impact,
    routeSummary: "mock-route",
  };
}

/**
 * Reset the mock price to a specific value (useful for testing)
 */
export function resetMockPrice(price: number = 175.0) {
  basePrice = price;
  priceVelocity = 0;
  lastUpdateTime = Date.now();
  console.log(`[market.mock] Price reset to $${price}`);
}

/**
 * Set price volatility manually (useful for testing different market conditions)
 */
export function setMockVolatility(high: boolean) {
  if (high) {
    // Simulate high volatility by adding momentum
    priceVelocity += (Math.random() - 0.5) * 10;
  } else {
    priceVelocity *= 0.5;
  }
}
