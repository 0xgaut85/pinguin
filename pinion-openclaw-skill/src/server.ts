import 'dotenv/config';
import express from 'express';
import { paymentMiddleware } from 'x402-express';
import { balanceRoute } from './routes/balance';
import { txRoute } from './routes/tx';
import { priceRoute } from './routes/price';
import { walletRoute } from './routes/wallet';
import { catalogRoute } from './routes/catalog';

const app = express();
const PORT = process.env.PORT || 4020;

// ─── Config ──────────────────────────────────────────
const payTo = process.env.ADDRESS || '0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf';
const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
const network = process.env.NETWORK || 'base';

// ─── x402 Payment Middleware ─────────────────────────
// Follows the EXACT pattern from https://docs.payai.network/x402/servers/typescript/express
// Only the routes listed here require payment. Others (like /catalog) pass through.
app.use(
    paymentMiddleware(
        payTo,
        {
            'GET /balance/[address]': {
                price: '$0.01',
                network: network,
                config: {
                    description: 'Get ETH and USDC balances for any Base address',
                },
            },
            'GET /tx/[hash]': {
                price: '$0.01',
                network: network,
                config: {
                    description: 'Get decoded transaction details for any Base transaction',
                },
            },
            'GET /price/[token]': {
                price: '$0.01',
                network: network,
                config: {
                    description: 'Get current price for ETH or other Base tokens',
                },
            },
            'GET /wallet/generate': {
                price: '$0.01',
                network: network,
                config: {
                    description: 'Generate a fresh Ethereum keypair for Base',
                },
            },
        },
        { url: facilitatorUrl },
    ),
);

// ─── Routes ──────────────────────────────────────────
app.get('/catalog', catalogRoute(payTo, network));
app.get('/balance/:address', balanceRoute);
app.get('/tx/:hash', txRoute);
app.get('/price/:token', priceRoute);
app.get('/wallet/generate', walletRoute);

// ─── Start ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`pinion x402 skill server running on port ${PORT}`);
    console.log(`  catalog:  http://localhost:${PORT}/catalog`);
    console.log(`  payTo:    ${payTo}`);
    console.log(`  network:  ${network}`);
});
