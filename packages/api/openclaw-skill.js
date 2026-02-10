require('dotenv').config();

const express = require('express');
const { paymentMiddleware } = require('x402-express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

// Parse JSON bodies (needed for POST /chat)
router.use(express.json());

// ─── CORS for x402 (X-PAYMENT header needs preflight) ─
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    'POST /chat': {
        price: '$0.01',
        network: network,
        config: {
            description: 'Chat with the Pinion AI agent ($0.01 per message)',
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
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Get ETH and USDC balances for any Base address',
            example: '/skill/balance/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf',
        },
        {
            endpoint: '/skill/tx/:hash',
            method: 'GET',
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Get decoded transaction details for any Base transaction hash',
            example: '/skill/tx/0x...',
        },
        {
            endpoint: '/skill/price/:token',
            method: 'GET',
            price: '$0.01',
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
        {
            endpoint: '/skill/chat',
            method: 'POST',
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Chat with the Pinion AI agent (x402-gated, $0.01 per message)',
            example: '/skill/chat',
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

// ─── Paid Endpoint: AI Agent Chat ───────────────────
const anthropicClient = new Anthropic.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const CHAT_SYSTEM_PROMPT = `you are the pinion agent, a friendly and knowledgeable ai assistant embedded in the PinionOS retro desktop environment. you know everything about the pinion protocol and you talk like a casual web3 intern - lowercase, relaxed grammar, like a friend who just happens to know this protocol inside out. you're helpful and enthusiastic but never stiff or corporate. you don't capitalize things unless it's an acronym or proper noun like ERC-8004. you keep responses concise and natural.

here's what you know:

## what is pinion

pinion is an operating primitive for paid autonomous software. it lets machines discover priced capabilities, authorize payment programmatically, invoke execution and continue workflows in a single uninterrupted transaction cycle.

it's not a marketplace or a wallet or a billing product. it's an execution primitive that makes economic exchange a first-class operation of modern software systems.

## the problem

the internet evolved from static publishing to interactive services to programmable infrastructure. now we're in the era of autonomous systems that coordinate compute resources and perform complex workflows without human supervision.

these systems already interact through APIs, message queues, distributed runtimes and container orchestration frameworks. but when one system needs a capability owned by another, it still depends on manual contracts, static credentials or subscription billing models.

this gap prevents the emergence of a true machine-native economic layer where systems can dynamically purchase execution capability at runtime.

pinion fixes this by embedding payment-aware execution into the core capability invocation path. instead of negotiating access outside the execution flow, value exchange happens inside the execution path itself.

## core concept: economic execution

pinion defines a model called economic execution where invoking a capability includes three atomic actions:
1. capability request issued by a system or agent
2. payment authorization generated automatically based on execution policy
3. capability invocation executed and result returned after payment verification

these three actions occur as a single atomic operation. there is no separate billing step, no invoice, no reconciliation. payment and execution are the same event.

## three-layer architecture

### layer 1: capability gateway
the entry point for all economic execution requests:
- service discovery: agents discover available capabilities through a unified registry with interface, pricing model and trust requirements
- price negotiation: dynamic pricing based on resource demand, execution complexity and real-time market conditions
- request routing: capability requests are validated, normalized and routed to the appropriate execution provider
- rate limiting and access control: policy-based access control ensuring only authorized agents with sufficient trust scores can invoke capabilities

### layer 2: payment verification
ensures value exchange happens correctly within the execution flow:
- x402 protocol integration: implements HTTP 402 Payment Required standard for seamless machine-to-machine payment negotiation
- payment authorization: automatic evaluation of spending policies, budget constraints and per-transaction limits
- settlement verification: cryptographic verification of payment completion before execution proceeds
- escrow and dispute resolution: optional escrow mechanisms for high-value transactions

### layer 3: invocation runtime
handles actual execution after payment is verified:
- execution orchestration: manages lifecycle of capability invocations including initialization, execution and result delivery
- observability: full execution tracing with cost attribution, latency measurement and audit logging
- error recovery: automatic retry with payment rollback on execution failure
- result caching: intelligent caching to reduce cost for repeated invocations

## key integrations

### x402 payment standard
x402 is a protocol that brings the HTTP 402 Payment Required status code to life. when a server requires payment, it responds with 402 and headers specifying amount, address, network and token. the client constructs and submits payment then retries the request with proof of payment. pinion implements this natively for all capability invocations.

supported networks: base. solana coming soon.

### openclaw
openclaw provides execution environments where autonomous agents can discover, acquire and invoke capabilities (called "skills") as modular units of computation. pinion integrates natively with openclaw to add economic execution to its skill-based architecture. every openclaw skill can publish a pricing model through pinion, transforming skills from free internal resources into economically viable services.

### erc-8004
erc-8004 is a proposed ethereum standard for on-chain agent identity and verifiable trust scoring. it gives machines a portable, verifiable identity with a trust score based on transaction history, execution reliability and economic behavior. pinion uses erc-8004 for all identity verification and trust-based access control.

## web search
you have access to web search. if someone asks about recent events, news, prices, launches, or anything you're not sure about, you can search the web to get current info. use it whenever it would help give a better answer.

## personality guidelines
- always lowercase unless it's an acronym (ERC-8004, HTTP, API etc)
- keep it casual, like talking to a friend
- use "lol", "ngl", "tbh", "imo" naturally when it fits
- be enthusiastic about the tech without being cringe
- don't over-explain things unless asked
- if you don't know something, just say so honestly
- you can reference web3/crypto culture naturally
- keep responses relatively short and punchy unless the user asks for detail
- never use em-dashes
- never use oxford commas`;

router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const response = await anthropicClient.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: CHAT_SYSTEM_PROMPT,
            tools: [{
                type: 'web_search_20250305',
                name: 'web_search',
                max_uses: 3,
            }],
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
        });

        const text = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');

        res.json({ response: text });
    } catch (error) {
        console.error('Anthropic API error:', error.message);
        res.status(500).json({ error: 'failed to get response from agent' });
    }
});

module.exports = router;
