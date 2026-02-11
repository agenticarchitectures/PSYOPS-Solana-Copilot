# Solana Trading Copilot Agent

## Overview
LLM-driven autonomous paper trading agent for Solana with on-chain memo receipts on devnet. Features a React dashboard with real-time state polling, manual trade controls, and a reusable Agent Skill API.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + Shadcn UI components
- **Backend**: Express server with trading engine
- **AI**: OpenAI via Replit AI Integrations (gpt-4o-mini for trading decisions)
- **Blockchain**: Solana devnet via solana-agent-kit (SolanaAgentKit for wallet + memo transactions)
- **Storage**: File-based receipts.json for trade receipts

## Key Files
- `client/src/pages/dashboard.tsx` - Main trading dashboard UI
- `client/src/App.tsx` - App layout with theme toggle
- `server/routes.ts` - All API routes (/api/ui/* and /api/skill/*)
- `server/engine/` - Trading engine modules:
  - `agentKit.ts` - SolanaAgentKit initialization, sendMemo(), getPublicKey()
  - `executor.ts` - Executor interface (PaperExecutor + JupiterExecutor stub for Phase 2)
  - `state.ts` - Shared trading state (delegates wallet to agentKit)
  - `market.ts` - Jupiter Quote API for implied prices
  - `signal.ts` - Breakout signal detection
  - `risk.ts` - Risk management checks
  - `llmPlanner.ts` - LLM-based trading decisions
  - `tradingEngine.ts` - Paper trade execution + receipts
  - `loop.ts` - Autonomous trading loop
  - `memo.ts` - On-chain memo transactions
  - `config.ts` - Configuration from env vars
- `server/skills/tradingSkill.ts` - Agent Skill API

## API Endpoints
### UI API
- `GET /api/ui/state` - Current trading state (polled every 2s)
- `POST /api/ui/start` - Start autonomous loop
- `POST /api/ui/stop` - Stop autonomous loop
- `GET /api/ui/config` - Trading configuration
- `POST /api/ui/execute-now` - Manual trade execution
- `GET /api/ui/receipts` - All trade receipts

### Skill API
- `GET /api/skill/manifest` - Skill manifest
- `POST /api/skill/invoke` - Invoke skill actions (get_market, get_signal, propose_trade, execute_trade, get_receipt)

## Environment Variables
- `SOLANA_RPC_URL` - Devnet RPC URL
- `SOLANA_KEYPAIR_JSON` - Solana keypair (auto-generated if not set)
- `DEFAULT_PAIR` - Trading pair (SOL-USDC)
- `MAX_NOTIONAL` - Max trade size in USDC
- `MAX_SLIPPAGE_BPS` - Max slippage in basis points
- `COOLDOWN_SEC` - Seconds between trades
- `MAX_DAILY_LOSS` - Max daily loss limit
- `BREAKOUT_THRESHOLD_BPS` - Signal breakout threshold
