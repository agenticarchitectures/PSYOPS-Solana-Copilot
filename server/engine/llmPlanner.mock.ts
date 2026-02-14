import { LLMContext, LLMDecision } from "./llmPlanner";

/**
 * Mock LLM planner for testing without OpenAI API costs
 *
 * This simulates trading decisions based on simple rules:
 * - BUY when breakout signal is BUY and risk checks pass
 * - SELL when breakout signal is SELL and risk checks pass
 * - HOLD otherwise
 */
export async function decideActionMock(context: LLMContext): Promise<LLMDecision> {
  // Simulate a small delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  const reasons: string[] = [];
  let action: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 0.5;

  // Check if risk is allowed
  if (!context.risk.allowed) {
    action = "HOLD";
    confidence = 0.1;
    reasons.push("Risk checks failed, cannot execute trade");

    if (!context.risk.checks.cooldownOK) reasons.push("Cooldown period active");
    if (!context.risk.checks.maxNotionalOK) reasons.push("Max notional limit reached");
    if (!context.risk.checks.maxDailyLossOK) reasons.push("Daily loss limit reached");
    if (!context.risk.checks.slippageOK) reasons.push("Slippage too high");

    return { action, confidence, reasons };
  }

  // Follow the breakout signal if risk allows
  if (context.breakoutSignal === "BUY") {
    action = "BUY";
    confidence = 0.6 + (context.breakoutStrength * 0.3);
    reasons.push(`Strong BUY signal detected (strength: ${context.breakoutStrength.toFixed(2)})`);
    reasons.push(`Price ${context.impliedPrice.toFixed(2)} near recent low ${context.rollingLow.toFixed(2)}`);

    if (context.slippageBps > 30) {
      confidence -= 0.15;
      reasons.push(`Moderate slippage (${context.slippageBps} bps) reduces confidence`);
    }
  } else if (context.breakoutSignal === "SELL") {
    action = "SELL";
    confidence = 0.6 + (context.breakoutStrength * 0.3);
    reasons.push(`Strong SELL signal detected (strength: ${context.breakoutStrength.toFixed(2)})`);
    reasons.push(`Price ${context.impliedPrice.toFixed(2)} near recent high ${context.rollingHigh.toFixed(2)}`);

    if (context.slippageBps > 30) {
      confidence -= 0.1;
      reasons.push(`Moderate slippage (${context.slippageBps} bps) noted`);
    }
  } else {
    action = "HOLD";
    confidence = 0.3 + Math.random() * 0.2;
    reasons.push("No clear breakout signal detected");
    reasons.push(`Price ${context.impliedPrice.toFixed(2)} within range [${context.rollingLow.toFixed(2)}, ${context.rollingHigh.toFixed(2)}]`);
  }

  // Add context about recent actions
  if (context.lastActions.length > 0) {
    const lastAction = context.lastActions[0];
    reasons.push(`Last trade: ${lastAction.side} at ${lastAction.price.toFixed(2)}`);
  }

  // Clamp confidence to [0, 1]
  confidence = Math.max(0, Math.min(1, confidence));

  console.log(`[llmPlanner.mock] Decision: ${action} with confidence ${confidence.toFixed(2)}`);

  return { action, confidence, reasons: reasons.slice(0, 4) };
}
