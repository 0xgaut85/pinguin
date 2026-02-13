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

// ─── Token Constants ─────────────────────────────────
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const WETH_CONTRACT = '0x4200000000000000000000000000000000000006';
const ONEINCH_ROUTER = '0x111111125421ca6dc452d289314280a0f8842a65';
const ONEINCH_BASE_URL = 'https://api.1inch.com/swap/v6.1/8453';
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY || '';

// well-known Base token addresses for the trade endpoint
const TOKEN_ADDRESSES = {
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // native ETH sentinel
    USDC: USDC_CONTRACT,
    WETH: WETH_CONTRACT,
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    CBETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
};

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
    'POST /send': {
        price: '$0.01',
        network: network,
        config: {
            description: 'Construct an unsigned ETH or USDC transfer transaction on Base',
        },
    },
    'POST /trade': {
        price: '$0.01',
        network: network,
        config: {
            description: 'Get an unsigned swap transaction via 1inch aggregator on Base',
        },
    },
    'GET /fund/[address]': {
        price: '$0.01',
        network: network,
        config: {
            description: 'Get wallet balance and funding instructions for Base',
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
        {
            endpoint: '/skill/send',
            method: 'POST',
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Construct an unsigned ETH or USDC transfer transaction. Client signs and broadcasts.',
            example: 'POST /skill/send { "to": "0x...", "amount": "0.1", "token": "ETH" }',
        },
        {
            endpoint: '/skill/trade',
            method: 'POST',
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Get an unsigned swap transaction via 1inch aggregator. Client signs and broadcasts.',
            example: 'POST /skill/trade { "src": "USDC", "dst": "ETH", "amount": "10", "from": "0x..." }',
        },
        {
            endpoint: '/skill/fund/:address',
            method: 'GET',
            price: '$0.01',
            currency: 'USDC',
            network: network,
            description: 'Get wallet balances and funding instructions for a Base address',
            example: '/skill/fund/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf',
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

// ─── Paid Endpoint: Send (Unsigned Tx Construction) ──
// Accepts { to, amount, token } and returns an unsigned transaction object.
// The client signs with their private key and broadcasts to Base.
router.post('/send', async (req, res) => {
    try {
        const { to, amount, token } = req.body;

        if (!to || !amount || !token) {
            return res.status(400).json({ error: 'to, amount, and token are required' });
        }
        if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
            return res.status(400).json({ error: 'Invalid recipient address' });
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'amount must be a positive number' });
        }

        const upperToken = token.toUpperCase();

        if (upperToken === 'ETH') {
            // native ETH transfer
            const weiValue = BigInt(Math.floor(parsedAmount * 1e18));
            res.json({
                tx: {
                    to,
                    value: '0x' + weiValue.toString(16),
                    data: '0x',
                    chainId: 8453,
                },
                token: 'ETH',
                amount: parsedAmount.toString(),
                network: 'base',
                note: 'Sign this transaction with your private key and broadcast to Base.',
                timestamp: new Date().toISOString(),
            });
        } else if (upperToken === 'USDC') {
            // ERC-20 transfer(address,uint256)
            const atomicAmount = BigInt(Math.floor(parsedAmount * 1e6));
            const transferSelector = '0xa9059cbb';
            const paddedTo = to.substring(2).toLowerCase().padStart(64, '0');
            const paddedAmount = atomicAmount.toString(16).padStart(64, '0');
            const calldata = transferSelector + paddedTo + paddedAmount;

            res.json({
                tx: {
                    to: USDC_CONTRACT,
                    value: '0x0',
                    data: calldata,
                    chainId: 8453,
                },
                token: 'USDC',
                amount: parsedAmount.toString(),
                network: 'base',
                note: 'Sign this transaction with your private key and broadcast to Base.',
                timestamp: new Date().toISOString(),
            });
        } else {
            return res.status(400).json({
                error: `Unsupported token: ${token}. Use ETH or USDC.`,
            });
        }
    } catch (err) {
        console.error('Send construction error:', err.message);
        res.status(500).json({ error: 'Failed to construct send transaction', details: err.message });
    }
});

// ─── Paid Endpoint: Trade (1inch Swap via x402) ──────
// Accepts { src, dst, amount, from, slippage? } and returns unsigned swap tx
// from the 1inch aggregator. Also checks token allowance and returns
// an approve tx if the router doesn't have sufficient approval.
router.post('/trade', async (req, res) => {
    try {
        const { src, dst, amount, from, slippage } = req.body;

        if (!src || !dst || !amount || !from) {
            return res.status(400).json({ error: 'src, dst, amount, and from are required' });
        }
        if (!/^0x[0-9a-fA-F]{40}$/.test(from)) {
            return res.status(400).json({ error: 'Invalid from address' });
        }
        if (!ONEINCH_API_KEY) {
            return res.status(503).json({ error: 'Trade service is not configured (missing API key)' });
        }

        const srcUpper = src.toUpperCase();
        const dstUpper = dst.toUpperCase();
        const srcAddress = TOKEN_ADDRESSES[srcUpper];
        const dstAddress = TOKEN_ADDRESSES[dstUpper];

        if (!srcAddress) {
            return res.status(400).json({
                error: `Unsupported source token: ${src}`,
                supported: Object.keys(TOKEN_ADDRESSES),
            });
        }
        if (!dstAddress) {
            return res.status(400).json({
                error: `Unsupported destination token: ${dst}`,
                supported: Object.keys(TOKEN_ADDRESSES),
            });
        }

        // convert human-readable amount to atomic units
        const decimals = srcUpper === 'USDC' ? 6 : 18;
        const atomicAmount = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)));

        const headers = {
            Accept: 'application/json',
            Authorization: `Bearer ${ONEINCH_API_KEY}`,
        };

        // check allowance if source is an ERC-20 (not native ETH)
        let approveTx = null;
        if (srcUpper !== 'ETH') {
            const allowanceUrl = `${ONEINCH_BASE_URL}/approve/allowance?` +
                `tokenAddress=${srcAddress}&walletAddress=${from}`;
            const allowanceRes = await fetch(allowanceUrl, { headers });
            if (!allowanceRes.ok) {
                const body = await allowanceRes.text();
                return res.status(502).json({ error: '1inch allowance check failed', details: body });
            }
            const allowanceData = await allowanceRes.json();
            const currentAllowance = BigInt(allowanceData.allowance || '0');

            if (currentAllowance < atomicAmount) {
                // need approval -- get approve tx from 1inch
                const approveUrl = `${ONEINCH_BASE_URL}/approve/transaction?` +
                    `tokenAddress=${srcAddress}&amount=${atomicAmount.toString()}`;
                const approveRes = await fetch(approveUrl, { headers });
                if (!approveRes.ok) {
                    const body = await approveRes.text();
                    return res.status(502).json({ error: '1inch approve call failed', details: body });
                }
                const approveData = await approveRes.json();
                approveTx = {
                    to: approveData.to,
                    data: approveData.data,
                    value: '0x0',
                    chainId: 8453,
                };
            }
        }

        // get swap tx from 1inch
        const swapParams = new URLSearchParams({
            src: srcAddress,
            dst: dstAddress,
            amount: atomicAmount.toString(),
            from: from.toLowerCase(),
            slippage: (slippage || 1).toString(),
            disableEstimate: 'true',
        });
        const swapUrl = `${ONEINCH_BASE_URL}/swap?${swapParams.toString()}`;
        const swapRes = await fetch(swapUrl, { headers });

        if (!swapRes.ok) {
            const body = await swapRes.text();
            return res.status(502).json({ error: '1inch swap call failed', details: body });
        }

        const swapData = await swapRes.json();
        const swapTx = {
            to: swapData.tx.to,
            data: swapData.tx.data,
            value: '0x' + BigInt(swapData.tx.value || '0').toString(16),
            chainId: 8453,
        };

        const result = {
            swap: swapTx,
            srcToken: srcUpper,
            dstToken: dstUpper,
            amount: amount,
            network: 'base',
            router: ONEINCH_ROUTER,
            timestamp: new Date().toISOString(),
        };

        if (approveTx) {
            result.approve = approveTx;
            result.note = 'Sign and broadcast the approve tx first, wait for confirmation, then sign and broadcast the swap tx.';
        } else {
            result.note = 'Sign this swap transaction with your private key and broadcast to Base.';
        }

        res.json(result);
    } catch (err) {
        console.error('Trade error:', err.message);
        res.status(500).json({ error: 'Failed to construct trade transaction', details: err.message });
    }
});

// ─── Paid Endpoint: Fund (Balance + Deposit Info) ────
router.get('/fund/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' });
        }

        // ETH balance
        const ethBalanceHex = await baseRpc('eth_getBalance', [address, 'latest']);
        const ethBalance = parseInt(ethBalanceHex, 16) / 1e18;

        // USDC balance
        const balanceOfSelector = '0x70a08231';
        const paddedAddress = address.substring(2).toLowerCase().padStart(64, '0');
        const usdcBalanceHex = await baseRpc('eth_call', [
            { to: USDC_CONTRACT, data: `${balanceOfSelector}${paddedAddress}` },
            'latest',
        ]);
        const usdcBalance = parseInt(usdcBalanceHex, 16) / 1e6;

        res.json({
            address,
            network: 'base',
            chainId: 8453,
            balances: {
                ETH: ethBalance.toFixed(6),
                USDC: usdcBalance.toFixed(2),
            },
            depositAddress: address,
            funding: {
                steps: [
                    'Buy ETH on any exchange (Coinbase, Binance, etc.)',
                    'Withdraw ETH to the address above on the Base network',
                    'Swap some ETH to USDC using the /trade skill or any DEX',
                    'ETH is needed for gas, USDC is needed for x402 payments',
                ],
                minimumRecommended: {
                    ETH: '0.001 ETH (for gas fees)',
                    USDC: '1.00 USDC (for ~100 skill calls at $0.01 each)',
                },
                bridgeUrl: 'https://bridge.base.org',
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Fund info error:', err.message);
        res.status(500).json({ error: 'Failed to fetch fund info', details: err.message });
    }
});

module.exports = router;
