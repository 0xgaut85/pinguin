if (!globalThis.crypto) globalThis.crypto = require('crypto').webcrypto;

require('dotenv').config();

const express = require('express');
const path = require('path');
const apiRouter = require('./packages/api/server.js');
const skillRouter = require('./packages/api/openclaw-skill.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Mount API routes at /api
app.use('/api', apiRouter);

// Mount x402-paywalled OpenClaw skill at /skill
app.use('/skill', skillRouter);

// Serve inner-site at /os/
app.use('/os', express.static(path.join(__dirname, 'packages/inner-site/build'), {
    index: 'index.html',
}));

// SPA fallback for inner-site (React Router)
app.get('/os/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'packages/inner-site/build', 'index.html'));
});

// ─── x402 Discovery Document ────────────────────────
// https://github.com/Merit-Systems/x402scan/blob/main/docs/DISCOVERY.md
app.get('/.well-known/x402', (req, res) => {
    res.json({
        version: 1,
        resources: [
            'https://pinionos.com/skill/balance/0x0000000000000000000000000000000000000001',
            'https://pinionos.com/skill/tx/0x0000000000000000000000000000000000000000000000000000000000000001',
            'https://pinionos.com/skill/price/ETH',
            'https://pinionos.com/skill/wallet/generate',
            'https://pinionos.com/skill/chat',
            'https://pinionos.com/skill/send',
            'https://pinionos.com/skill/trade',
            'https://pinionos.com/skill/fund/0x0000000000000000000000000000000000000001',
            'https://pinionos.com/skill/broadcast',
        ],
        ownershipProofs: [
            '0x981d16b1a52bd1099e58e0348fa9e48242ac8190b6dc1c3ebe6352b3db677b806ddad970547768609f40a9c9f81d7ba3e0c2b4fbbfbef77f8af280c072548dd31b',
        ],
        instructions:
            '# Pinion OpenClaw Skills\n\n' +
            'On-chain intelligence, transactions and wallet tools on Base, paywalled via x402 USDC micropayments ($0.01 each).\n\n' +
            '## Endpoints\n' +
            '- **Balance Lookup** - ETH + USDC balances for any Base address\n' +
            '- **Transaction Details** - Decoded tx info for any Base tx hash\n' +
            '- **Token Price** - Current USD price for ETH and other tokens\n' +
            '- **Wallet Generation** - Generate a fresh Base keypair\n' +
            '- **AI Chat** - Chat with the Pinion Agent ($0.01/message)\n' +
            '- **Send** - Construct unsigned ETH or USDC transfer tx\n' +
            '- **Trade** - Unsigned swap tx via 1inch aggregator\n' +
            '- **Fund** - Wallet balance and funding instructions\n' +
            '- **Broadcast** - Sign and broadcast a transaction on Base\n\n' +
            '## SDK\n' +
            'npm install pinion-os -- TypeScript SDK with x402 payment signing built in.\n' +
            'Claude Code plugin: /plugin marketplace add chu2bard/pinion-os\n\n' +
            '## Catalog\n' +
            'Free catalog at https://pinionos.com/skill/catalog\n\n' +
            '## More Info\n' +
            'https://pinionos.com',
    });
});

// Serve 3d-site at / (main entry)
app.use(express.static(path.join(__dirname, 'packages/3d-site/public'), {
    index: 'index.html',
}));

// SPA fallback for 3d-site
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'packages/3d-site/public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`pinion unified server running on port ${PORT}`);
    console.log(`  3d-site:    http://localhost:${PORT}/`);
    console.log(`  inner-site: http://localhost:${PORT}/os/`);
    console.log(`  api:        http://localhost:${PORT}/api/`);
    console.log(`  skill:      http://localhost:${PORT}/skill/catalog`);
});
