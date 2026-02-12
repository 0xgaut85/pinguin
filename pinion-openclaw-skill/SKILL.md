# Pinion Chain Intel -- OpenClaw x402 Skill

On-chain intelligence endpoints for Base, paywalled via x402 USDC micropayments.

## What It Does

This skill exposes three paywalled API endpoints that provide real-time on-chain data from Base:

| Endpoint | Price | Description |
|---|---|---|
| `GET /balance/:address` | $0.001 USDC | ETH and USDC balances for any Base address |
| `GET /tx/:hash` | $0.001 USDC | Decoded transaction details for any Base tx hash |
| `GET /price/:token` | $0.001 USDC | Current USD price for ETH, USDC, WETH, DAI, USDT, CBETH |

A free catalog endpoint is also available at `GET /catalog`.

## How x402 Works

1. Client calls a paywalled endpoint (e.g. `GET /balance/0x...`)
2. Server responds with HTTP 402 and payment requirements (amount, token, network, recipient)
3. Client signs a USDC `TransferWithAuthorization` (EIP-3009) using their wallet
4. Client retries the request with the `X-PAYMENT` header containing the signed payment
5. Server verifies the payment via the x402 facilitator, returns the data, and settles the USDC transfer

Every invocation = 1 real USDC transaction on Base.

## Quick Start

```bash
git clone https://github.com/chu2bard/pinion-os.git
cd pinion-os
npm install
cp .env.example .env
# Edit .env with your wallet address
npm run dev
```

## Configuration

Copy `.env.example` to `.env` and set:

- `ADDRESS` -- Your wallet address to receive USDC payments
- `FACILITATOR_URL` -- x402 facilitator (default: `https://facilitator.payai.network`)
- `NETWORK` -- `base` for mainnet, `base-sepolia` for testnet
- `PORT` -- Server port (default: 4020)

## Adding Your Own Endpoints

1. Create a new route file in `src/routes/`
2. Add the route to the `paymentMiddleware` config in `src/server.ts`
3. Register the route handler with `app.get()`
4. Update `openclaw.plugin.json` with the new skill

## Tech Stack

- Express.js with `x402-express` paymentMiddleware (official Coinbase x402 package)
- Base mainnet RPC for on-chain data
- CoinGecko API for token prices
- TypeScript

## License

MIT
