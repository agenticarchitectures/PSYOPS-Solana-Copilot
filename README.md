# PSYOPS - Solana Trading Copilot

PSYOPS is an LLM-powered autonomous trading agent built for Solana. It observes markets, generates trade proposals, and records every decision on-chain.

## What It Does

The system uses OpenAI gpt-4o-mini for reasoning, Jupiter Quote API v1 for price data, a custom breakout-signal engine, and a multi-layer risk framework (cooldowns, notional caps, slippage checks, daily loss guards).

Every trade is committed on-chain using the Solana Memo program via solana-agent-kit, giving PSYOPS a verifiable agent identity and on-chain audit trail. A React dashboard provides real-time state updates (2-second polling), manual overrides, and full transparency into LLM decisions.

## Agent Skill API

PSYOPS includes a lightweight SDK via a JSON-based Agent Skill API with 5 reusable actions. Any LLM agent or external service can interact with PSYOPS by calling these skill endpoints, enabling seamless agent-to-agent interoperability.

**5 interoperable actions:**

| Action | Description |
|--------|-------------|
| `get_market` | Fetch current market price and slippage from Jupiter Quote API |
| `get_signal` | Run breakout signal detection on rolling price window |
| `propose_trade` | Generate an LLM-powered trade proposal with confidence score |
| `execute_trade` | Execute a paper trade with risk checks and on-chain memo receipt |
| `get_receipt` | Retrieve a trade receipt by ID |

### Skill Endpoints

```
GET  /api/skill/manifest     # Skill manifest with action definitions
POST /api/skill/invoke        # Invoke any action: { "action": "get_market", "args": { "pair": "SOL-USDC" } }
```

## Architecture

- **Frontend**: React + Vite + TailwindCSS + Shadcn UI
- **Backend**: Express server with trading engine
- **AI**: OpenAI gpt-4o-mini via Replit AI Integrations
- **Blockchain**: Solana devnet via solana-agent-kit (wallet management + memo transactions)
- **Market Data**: Jupiter Quote API v1

## Trading Engine

```
Market Data (Jupiter) → Breakout Signal Detection → Risk Checks → LLM Decision → Paper Execution → On-Chain Memo
```

### Risk Framework

- **Cooldown**: Minimum seconds between trades
- **Max Notional**: Cap on trade size in USDC
- **Max Daily Loss**: Daily loss limit guard
- **Slippage Check**: Maximum allowed slippage in basis points

## Dashboard

The React dashboard provides:

- Real-time market price with rolling high/low
- Signal detection status and LLM confidence meter
- Risk check indicators (4 independent checks)
- Paper portfolio tracking (position, USDC balance, PnL)
- Manual buy/sell controls
- Paper mode toggle
- Trade receipt history with Solana Explorer links
- Dark/light theme toggle

## UI API Endpoints

```
GET  /api/ui/state        # Current trading state (polled every 2s)
POST /api/ui/start        # Start autonomous trading loop
POST /api/ui/stop         # Stop autonomous trading loop
GET  /api/ui/config       # Trading configuration
POST /api/ui/execute-now  # Manual trade execution
POST /api/ui/paper-mode   # Toggle paper mode
GET  /api/ui/receipts     # All trade receipts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | Devnet |
| `SOLANA_KEYPAIR_JSON` | Wallet keypair (auto-generated if not set) | Ephemeral |
| `DEFAULT_PAIR` | Trading pair | SOL-USDC |
| `MAX_NOTIONAL` | Max trade size in USDC | 20 |
| `MAX_SLIPPAGE_BPS` | Max slippage in basis points | 100 |
| `COOLDOWN_SEC` | Seconds between trades | 30 |
| `MAX_DAILY_LOSS` | Daily loss limit in USDC | 50 |
| `BREAKOUT_THRESHOLD_BPS` | Signal detection threshold | 50 |

## On-Chain Identity

Every trade generates a memo transaction on Solana devnet containing:
- Trade pair, side, and notional value
- LLM confidence score
- Receipt ID for audit trail lookup

This creates a verifiable, immutable record of every agent decision on-chain.

## Getting Started

```bash
npm install
npm run dev
```

The dashboard runs on port 5000. Start the autonomous loop from the dashboard or use the API endpoints directly.

## Built For

Colosseum Agent Hackathon 2026
