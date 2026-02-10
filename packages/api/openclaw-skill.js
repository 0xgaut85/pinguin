require('dotenv').config();

const express = require('express');
const { paymentMiddleware } = require('x402-express');

const router = express.Router();

// ─── CORS for x402 (X-PAYMENT header needs preflight) ─
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-PAYMENT, Accept');
    res.header('Access-Control-Expose-Headers', 'X-PAYMENT-RESPONSE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// ─── Config ──────────────────────────────────────────
const payTo = process.env.ADDRESS || '0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf';
const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
const network = process.env.NETWORK || 'base';
const BASE_RPC = 'https://mainnet.base.org';

// ─── x402 Payment Middleware ─────────────────────────
// Follows the EXACT pattern from https://docs.payai.network/x402/servers/typescript/express
// Only the routes listed here require payment. Others (like /catalog) pass through.
const paywallRoutes = {
    'GET /balance/:address': {
        price: '$0.001',
        network: network,
        config: {
            description: 'Get ETH and USDC balances for any Base address',
        },
    },
    'GET /tx/:hash': {
        price: '$0.001',
        network: network,
        config: {
            description: 'Get decoded transaction details for any Base transaction',
        },
    },
    'GET /price/:token': {
        price: '$0.001',
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
};

router.use(
    paymentMiddleware(payTo, paywallRoutes, { url: facilitatorUrl })
);

// ─── Helper: call Base RPC ───────────────────────────
async function baseRpc(method, params = []) {
    const res = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
}

// ─── Free Endpoint: Skill Catalog ────────────────────
router.get('/catalog', (req, res) => {
    const skills = [
        {
            endpoint: '/skill/balance/:address',
            method: 'GET',
            price: '$0.001',
            currency: 'USDC',
            network: network,
            description: 'Get ETH and USDC balances for any Base address',
            example: '/skill/balance/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf',
        },
        {
            endpoint: '/skill/tx/:hash',
            method: 'GET',
            price: '$0.001',
            currency: 'USDC',
            network: network,
            description: 'Get decoded transaction details for any Base transaction hash',
            example: '/skill/tx/0x...',
        },
        {
            endpoint: '/skill/price/:token',
            method: 'GET',
            price: '$0.001',
            currency: 'USDC',
            network: network,
            description: 'Get current USD price for ETH or other tokens',
            example: '/skill/price/ETH',
        },
        {
            endpoint: '/skill/wallet/generate',
            method: 'GET',
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Generate a fresh Base wallet keypair for your OpenClaw agent',
            example: '/skill/wallet/generate',
        },
    ];
    res.json({ skills, payTo, network });
});

// ─── Paid Endpoint: Balance Lookup ───────────────────
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;

        // Validate address format
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        // ETH balance
        const ethBalanceHex = await baseRpc('eth_getBalance', [address, 'latest']);
        const ethBalance = parseInt(ethBalanceHex, 16) / 1e18;

        // USDC balance (balanceOf call)
        const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
        const balanceOfSelector = '0x70a08231';
        const paddedAddress = address.substring(2).toLowerCase().padStart(64, '0');
        const usdcBalanceHex = await baseRpc('eth_call', [
            { to: USDC_CONTRACT, data: `${balanceOfSelector}${paddedAddress}` },
            'latest',
        ]);
        const usdcBalance = parseInt(usdcBalanceHex, 16) / 1e6; // USDC has 6 decimals

        res.json({
            address,
            network: 'base',
            balances: {
                ETH: ethBalance.toFixed(6),
                USDC: usdcBalance.toFixed(2),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Balance lookup error:', err.message);
        res.status(500).json({ error: 'Failed to fetch balance', details: err.message });
    }
});

// ─── Paid Endpoint: Transaction Lookup ───────────────
router.get('/tx/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
            return res.status(400).json({ error: 'Invalid transaction hash' });
        }

        const tx = await baseRpc('eth_getTransactionByHash', [hash]);
        if (!tx) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const receipt = await baseRpc('eth_getTransactionReceipt', [hash]);

        res.json({
            hash: tx.hash,
            network: 'base',
            from: tx.from,
            to: tx.to,
            value: (parseInt(tx.value, 16) / 1e18).toFixed(6) + ' ETH',
            gasUsed: receipt ? parseInt(receipt.gasUsed, 16).toString() : 'pending',
            status: receipt ? (receipt.status === '0x1' ? 'success' : 'reverted') : 'pending',
            blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Tx lookup error:', err.message);
        res.status(500).json({ error: 'Failed to fetch transaction', details: err.message });
    }
});

// ─── Paid Endpoint: Price Lookup ─────────────────────
router.get('/price/:token', async (req, res) => {
    try {
        const token = req.params.token.toUpperCase();

        // Use CoinGecko free API for prices
        const tokenMap = {
            ETH: 'ethereum',
            USDC: 'usd-coin',
            WETH: 'weth',
            CBETH: 'coinbase-wrapped-staked-eth',
            DAI: 'dai',
            USDT: 'tether',
        };

        const geckoId = tokenMap[token];
        if (!geckoId) {
            return res.status(400).json({
                error: `Unsupported token: ${token}`,
                supported: Object.keys(tokenMap),
            });
        }

        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`
        );
        const priceData = await priceRes.json();

        if (!priceData[geckoId]) {
            return res.status(502).json({ error: 'Price data unavailable' });
        }

        res.json({
            token,
            network: 'base',
            priceUSD: priceData[geckoId].usd,
            change24h: priceData[geckoId].usd_24h_change
                ? priceData[geckoId].usd_24h_change.toFixed(2) + '%'
                : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Price lookup error:', err.message);
        res.status(500).json({ error: 'Failed to fetch price', details: err.message });
    }
});

// ─── Paid Endpoint: Wallet Generation ───────────────
router.get('/wallet/generate', async (req, res) => {
    try {
        const crypto = require('crypto');
        const { keccak_256 } = require('@noble/hashes/sha3');

        // Generate a cryptographically secure private key
        const privKey = crypto.randomBytes(32);

        // Derive public key using secp256k1
        const ecdh = crypto.createECDH('secp256k1');
        ecdh.setPrivateKey(privKey);
        const pubKeyUncompressed = Buffer.from(
            ecdh.getPublicKey('hex', 'uncompressed').slice(2), // remove 04 prefix
            'hex'
        );

        // Keccak-256 hash, take last 20 bytes as address
        const hash = keccak_256(pubKeyUncompressed);
        const address = '0x' + Buffer.from(hash).slice(-20).toString('hex');

        res.json({
            address,
            privateKey: '0x' + privKey.toString('hex'),
            network: 'base',
            chainId: 8453,
            note: 'Fund this wallet with ETH for gas and USDC for x402 payments. Keep the private key safe.',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Wallet generation error:', err.message);
        res.status(500).json({ error: 'Failed to generate wallet', details: err.message });
    }
});

module.exports = router;
