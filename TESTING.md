# Testing PSYOPS Without API Costs

This guide explains how to test the trading copilot without spending money on OpenAI or Jupiter APIs.

## Quick Start

### 1. Enable Mock Mode

The `.env` file is already configured for mock mode:

```bash
USE_MOCKS=true
```

This enables:
- ✅ **Mock LLM** - Simulates OpenAI trading decisions without API calls
- ✅ **Mock Market Data** - Simulates realistic SOL price movements without Jupiter API
- ✅ **Free Solana Devnet** - On-chain memos work on devnet (free testnet)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

## What You'll See

### Mock Price Simulation
- SOL price starts around **$175** and moves realistically
- Random walk with mean reversion (stays between $150-$200)
- Slippage varies based on trade size (10-40 bps)
- Updates every time you poll the market

### Mock Trading Decisions
The mock LLM follows simple but realistic rules:

**BUY when:**
- Breakout signal detects upward movement
- Risk checks pass (cooldown, limits, slippage)
- Confidence: 60-90% based on signal strength

**SELL when:**
- Breakout signal detects downward movement
- Risk checks pass
- Confidence: 60-90% based on signal strength

**HOLD when:**
- No clear breakout signal
- Risk checks fail
- Confidence: 30-50%

### Dashboard Features (All Working in Mock Mode)

1. **Real-time Price** - Simulated SOL/USDC price updates
2. **Signal Detection** - Breakout signals based on mock price movements
3. **Risk Checks** - All 4 risk layers work normally
4. **Paper Trading** - Buy/sell executions are simulated
5. **On-Chain Memos** - Real transactions on Solana devnet (free)
6. **Trade History** - Receipt tracking with Solana Explorer links

## Testing Different Scenarios

### Test Autonomous Trading Loop

1. Click **Start** button in the dashboard
2. Watch the agent make decisions every ~10 seconds
3. Observe risk checks and LLM confidence scores
4. See paper portfolio update with PnL

### Test Manual Trades

1. Click **Buy** or **Sell** buttons
2. Check if risk checks block invalid trades
3. View trade receipts with on-chain memo links

### Test Risk Framework

Try triggering each risk check:

- **Cooldown**: Make multiple trades quickly
- **Max Notional**: Increase MAX_NOTIONAL in `.env` to a large value
- **Daily Loss**: Keep trading until you hit the loss limit
- **Slippage**: Watch for high slippage warnings

## Switching to Real APIs

When you're ready to use real APIs:

### 1. Get API Keys

| Service | URL | Purpose |
|---------|-----|---------|
| OpenAI | [platform.openai.com](https://platform.openai.com) | LLM trading decisions |
| Jupiter | [portal.jup.ag](https://portal.jup.ag) | Real-time SOL prices |

### 2. Update `.env`

```bash
# Disable mock mode
USE_MOCKS=false

# Add your API keys
OPENAI_API_KEY=sk-...
JUPITER_API_KEY=your-jupiter-key
```

### 3. Restart

```bash
npm run dev
```

Now the system uses real OpenAI and Jupiter APIs.

## Cost Estimates (Real APIs)

When using real APIs:

**OpenAI gpt-4o-mini:**
- ~$0.00015 per trading decision
- ~50 decisions/hour in autonomous mode
- **~$0.0075/hour** or **$0.18/day**

**Jupiter API:**
- Free tier: 600 requests/minute
- Should be sufficient for testing

**Solana Devnet:**
- Always free (testnet)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  USE_MOCKS=true                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Market Data          LLM Decisions                │
│  ┌──────────┐         ┌──────────┐                 │
│  │ Jupiter  │         │  OpenAI  │                 │
│  │   API    │         │   API    │                 │
│  └────┬─────┘         └────┬─────┘                 │
│       │                    │                        │
│       ↓                    ↓                        │
│  ┌──────────┐         ┌──────────┐                 │
│  │  Mock    │         │   Mock   │                 │
│  │ Market   │         │   LLM    │                 │
│  └──────────┘         └──────────┘                 │
│                                                     │
│       Trading Engine (unchanged)                   │
│       Risk Checks (unchanged)                      │
│       Dashboard (unchanged)                        │
│                                                     │
│  ┌─────────────────────────────────┐               │
│  │   Solana Devnet (always free)   │               │
│  └─────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

## Mock Implementation Details

### Mock LLM ([llmPlanner.mock.ts](server/engine/llmPlanner.mock.ts))

- Simulates 100-300ms API latency
- Respects all risk checks
- Returns realistic confidence scores
- Provides 2-4 reasoning bullets

### Mock Market ([market.mock.ts](server/engine/market.mock.ts))

- Price simulation: Random walk with mean reversion
- Volatility: ~$0.50 per second
- Target price: $175 (with range $150-$200)
- Slippage: 10-25 bps base + size impact

## Troubleshooting

**Q: No price updates?**
A: Check console logs for `[market.mock]` messages

**Q: Trades not executing?**
A: Risk checks might be blocking. Check the 4 risk indicators in dashboard

**Q: Want faster price changes?**
A: Edit `volatility` value in [market.mock.ts](server/engine/market.mock.ts:20)

**Q: Solana memo transactions failing?**
A: Devnet airdrop might be slow. Check console for `[agentKit]` messages

## Next Steps

1. ✅ Test all features in mock mode
2. ✅ Verify UI updates and risk checks work
3. ✅ Check on-chain memos on Solana Explorer
4. 🔄 Switch to real APIs when ready to trade
5. 🚀 Deploy to production with real wallet

---

**Built for Colosseum Agent Hackathon 2026**
