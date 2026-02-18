"""
Code generator for pinion-os repo.
Client SDK + Claude MCP plugin + skill server framework.
15 stages covering the full TypeScript monorepo.
"""

import shutil, os

from code_gen.base import mit_license, typescript_gitignore


BANNER_SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets", "banner.png",
)


def _copy_banner(repo_dir):
    """Copy generated banner into repo assets/."""
    dst = os.path.join(repo_dir, "assets", "banner.png")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(BANNER_SRC, dst)


def pinion_os_stages():
    return [
        # ── Stage 0: Scaffold ─────────────────────────────────────────────
        {
            ".gitignore": typescript_gitignore() + "*.tsbuildinfo\n.env.local\n",
            "LICENSE": mit_license(),
            "tsconfig.json": """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "examples"]
}
""",
            "package.json": """{
  "name": "pinion-os",
  "version": "0.1.0",
  "description": "Client SDK, Claude plugin and skill framework for the Pinion protocol. x402 micropayments on Base.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "pinion-os": "dist/plugin/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./server": {
      "types": "./dist/server/index.d.ts",
      "import": "./dist/server/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "node --test tests/",
    "lint": "tsc --noEmit"
  },
  "keywords": [
    "x402",
    "openclaw",
    "mcp",
    "claude",
    "agents",
    "payments",
    "base",
    "usdc",
    "pinion"
  ],
  "license": "MIT",
  "author": "chu2bard",
  "repository": {
    "type": "git",
    "url": "https://github.com/chu2bard/pinion-os"
  },
  "dependencies": {
    "ethers": "^6.11.0",
    "express": "^4.21.0",
    "x402-express": "^1.1.0",
    "dotenv": "^16.4.0",
    "@modelcontextprotocol/sdk": "^1.5.0",
    "@noble/hashes": "^1.4.0",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/express": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
""",
            "README.md": """# pinion-os

Client SDK, Claude plugin and skill framework for the Pinion protocol.

Work in progress.

## License

MIT
""",
            "src/index.ts": """// pinion-os public API
// SDK exports
export { PinionClient } from "./client/index.js";
export type { PinionConfig, SkillResponse } from "./client/types.js";
""",
        },

        # ── Stage 1: Shared constants + RPC + errors ─────────────────────
        {
            "src/shared/constants.ts": """// network and contract constants for Base mainnet

export const BASE_RPC_URL = "https://mainnet.base.org";
export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// USDC on Base mainnet
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const USDC_DECIMALS = 6;
export const USDC_NAME = "USD Coin";
export const USDC_VERSION = "2";

// default Pinion service URL
export const PINION_API_URL = "https://pinionos.com/skill";

// facilitator
export const FACILITATOR_URL = "https://facilitator.payai.network";

// default price per skill call
export const DEFAULT_SKILL_PRICE = "$0.01";

export function getChainId(network: string): number {
    if (network === "base-sepolia") return BASE_SEPOLIA_CHAIN_ID;
    return BASE_CHAIN_ID;
}

export function getRpcUrl(network: string): string {
    if (network === "base-sepolia") return BASE_SEPOLIA_RPC_URL;
    return BASE_RPC_URL;
}
""",
            "src/shared/rpc.ts": """// base JSON-RPC helper

import { getRpcUrl } from "./constants.js";

export interface RpcResponse {
    jsonrpc: string;
    id: number;
    result?: any;
    error?: { code: number; message: string };
}

export async function baseRpc(
    method: string,
    params: any[] = [],
    network = "base",
): Promise<any> {
    const url = getRpcUrl(network);
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });

    const json: RpcResponse = await res.json();
    if (json.error) {
        throw new RpcError(json.error.message, json.error.code);
    }
    return json.result;
}

export class RpcError extends Error {
    code: number;
    constructor(message: string, code: number) {
        super(message);
        this.name = "RpcError";
        this.code = code;
    }
}
""",
            "src/shared/errors.ts": """// error types for pinion-os

export class PinionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PinionError";
    }
}

export class PaymentError extends PinionError {
    status: number;
    constructor(message: string, status = 402) {
        super(message);
        this.name = "PaymentError";
        this.status = status;
    }
}

export class SkillError extends PinionError {
    skill: string;
    constructor(skill: string, message: string) {
        super(`${skill}: ${message}`);
        this.name = "SkillError";
        this.skill = skill;
    }
}

export class ConfigError extends PinionError {
    constructor(message: string) {
        super(message);
        this.name = "ConfigError";
    }
}
""",
        },

        # ── Stage 2: x402 signing ────────────────────────────────────────
        {
            "src/client/types.ts": """// client types

export interface PinionConfig {
    /** hex-encoded private key for signing x402 payments */
    privateKey: string;
    /** base URL for the pinion skill server (default: pinionos.com) */
    apiUrl?: string;
    /** network: "base" or "base-sepolia" */
    network?: string;
}

export interface PaymentRequirements {
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: { name?: string; version?: string };
}

export interface PaymentPayload {
    x402Version: number;
    scheme: string;
    network: string;
    payload: {
        signature: string;
        authorization: {
            from: string;
            to: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    };
}

export interface SkillResponse<T = any> {
    status: number;
    data: T;
    paidAmount: string;
    responseTimeMs: number;
}

export interface BalanceResult {
    address: string;
    network: string;
    balances: { ETH: string; USDC: string };
    timestamp: string;
}

export interface TxResult {
    hash: string;
    network: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    status: string;
    blockNumber: number | null;
    timestamp: string;
}

export interface PriceResult {
    token: string;
    network: string;
    priceUSD: number;
    change24h: string | null;
    timestamp: string;
}

export interface WalletResult {
    address: string;
    privateKey: string;
    network: string;
    chainId: number;
    note: string;
    timestamp: string;
}

export interface ChatResult {
    response: string;
}
""",
            "src/client/x402.ts": """// x402 payment signing for Node.js
// EIP-3009 TransferWithAuthorization via EIP-712 typed data
// adapted from ethers.js wallet signing (not browser-based)

import { ethers } from "ethers";
import {
    USDC_ADDRESS,
    USDC_NAME,
    USDC_VERSION,
    getChainId,
} from "../shared/constants.js";
import type { PaymentRequirements, PaymentPayload } from "./types.js";

function generateNonce(): string {
    const bytes = ethers.randomBytes(32);
    return ethers.hexlify(bytes);
}

/**
 * Sign an x402 payment using ethers Wallet.
 * Returns base64-encoded payment payload for the X-PAYMENT header.
 */
export async function signX402Payment(
    wallet: ethers.Wallet,
    requirements: PaymentRequirements,
    x402Version: number,
): Promise<string> {
    const nonce = generateNonce();
    const nowSec = Math.floor(Date.now() / 1000);
    const validAfter = (nowSec - 600).toString();
    const validBefore = (
        nowSec + (requirements.maxTimeoutSeconds || 900)
    ).toString();

    const chainId = getChainId(requirements.network);

    // EIP-712 domain matching USDC on Base
    const domain: ethers.TypedDataDomain = {
        name: requirements.extra?.name || USDC_NAME,
        version: requirements.extra?.version || USDC_VERSION,
        chainId,
        verifyingContract: requirements.asset || USDC_ADDRESS,
    };

    // EIP-712 types for TransferWithAuthorization (EIP-3009)
    const types = {
        TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
        ],
    };

    const value = {
        from: wallet.address,
        to: requirements.payTo,
        value: requirements.maxAmountRequired,
        validAfter,
        validBefore,
        nonce,
    };

    const signature = await wallet.signTypedData(domain, types, value);

    const payload: PaymentPayload = {
        x402Version,
        scheme: requirements.scheme,
        network: requirements.network,
        payload: {
            signature,
            authorization: {
                from: wallet.address,
                to: requirements.payTo,
                value: requirements.maxAmountRequired,
                validAfter,
                validBefore,
                nonce,
            },
        },
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Parse 402 response body to extract payment requirements.
 */
export function parsePaymentRequirements(body: any): {
    requirements: PaymentRequirements;
    x402Version: number;
} {
    if (body.accepts && body.accepts.length > 0) {
        return {
            requirements: body.accepts[0],
            x402Version: body.x402Version || 1,
        };
    }
    throw new Error("could not parse payment requirements from 402 response");
}
""",
        },

        # ── Stage 3: Client core ─────────────────────────────────────────
        {
            "src/client/index.ts": """// PinionClient -- main entry point for calling pinion skills

import { ethers } from "ethers";
import { PINION_API_URL } from "../shared/constants.js";
import { PaymentError, ConfigError } from "../shared/errors.js";
import { signX402Payment, parsePaymentRequirements } from "./x402.js";
import { SkillMethods } from "./skills.js";
import type { PinionConfig, SkillResponse } from "./types.js";

export class PinionClient {
    private wallet: ethers.Wallet;
    private apiUrl: string;
    private network: string;
    readonly skills: SkillMethods;

    constructor(config: PinionConfig) {
        if (!config.privateKey) {
            throw new ConfigError("privateKey is required");
        }

        this.wallet = new ethers.Wallet(config.privateKey);
        this.apiUrl = (config.apiUrl || PINION_API_URL).replace(/\\/$/, "");
        this.network = config.network || "base";
        this.skills = new SkillMethods(this);
    }

    get address(): string {
        return this.wallet.address;
    }

    /**
     * Make an x402-paid request to a pinion endpoint.
     * Handles the 402 -> sign -> retry flow automatically.
     */
    async request<T = any>(
        method: string,
        path: string,
        body?: any,
    ): Promise<SkillResponse<T>> {
        const url = `${this.apiUrl}${path}`;
        const start = Date.now();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        const opts: RequestInit = { method, headers };
        if (body && method === "POST") {
            opts.body = JSON.stringify(body);
        }

        // first request -- expect 402
        const initial = await fetch(url, opts);

        if (initial.status !== 402) {
            const data = await initial.json().catch(() => ({
                error: "non-json response",
            }));
            return {
                status: initial.status,
                data,
                paidAmount: "0",
                responseTimeMs: Date.now() - start,
            };
        }

        // parse payment requirements
        const reqBody = await initial.json();
        const { requirements, x402Version } =
            parsePaymentRequirements(reqBody);

        // sign payment
        const paymentHeader = await signX402Payment(
            this.wallet,
            requirements,
            x402Version,
        );

        // retry with payment
        const paidHeaders: Record<string, string> = {
            ...headers,
            "X-PAYMENT": paymentHeader,
        };

        const paidOpts: RequestInit = { method, headers: paidHeaders };
        if (body && method === "POST") {
            paidOpts.body = JSON.stringify(body);
        }

        const paid = await fetch(url, paidOpts);
        const data = await paid.json().catch(() => ({
            error: "non-json response",
        }));

        return {
            status: paid.status,
            data,
            paidAmount: requirements.maxAmountRequired,
            responseTimeMs: Date.now() - start,
        };
    }
}
""",
        },

        # ── Stage 4: Client skills ───────────────────────────────────────
        {
            "src/client/skills.ts": """// typed wrappers for each pinion skill

import type { PinionClient } from "./index.js";
import { SkillError } from "../shared/errors.js";
import type {
    BalanceResult,
    TxResult,
    PriceResult,
    WalletResult,
    ChatResult,
    SkillResponse,
} from "./types.js";

export class SkillMethods {
    private client: PinionClient;

    constructor(client: PinionClient) {
        this.client = client;
    }

    /** Get ETH and USDC balances for an address on Base. */
    async balance(address: string): Promise<SkillResponse<BalanceResult>> {
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            throw new SkillError("balance", "invalid ethereum address");
        }
        return this.client.request<BalanceResult>(
            "GET",
            `/balance/${address}`,
        );
    }

    /** Get decoded transaction details for a Base tx hash. */
    async tx(hash: string): Promise<SkillResponse<TxResult>> {
        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
            throw new SkillError("tx", "invalid transaction hash");
        }
        return this.client.request<TxResult>("GET", `/tx/${hash}`);
    }

    /** Get current USD price for a token (ETH, USDC, WETH, etc). */
    async price(token: string): Promise<SkillResponse<PriceResult>> {
        return this.client.request<PriceResult>(
            "GET",
            `/price/${token.toUpperCase()}`,
        );
    }

    /** Generate a fresh Base wallet keypair. */
    async wallet(): Promise<SkillResponse<WalletResult>> {
        return this.client.request<WalletResult>("GET", "/wallet/generate");
    }

    /** Chat with the Pinion AI agent. */
    async chat(
        message: string,
        history: Array<{ role: string; content: string }> = [],
    ): Promise<SkillResponse<ChatResult>> {
        const messages = [
            ...history,
            { role: "user", content: message },
        ];
        return this.client.request<ChatResult>("POST", "/chat", { messages });
    }
}
""",
        },

        # ── Stage 5: Skills -- balance + tx ──────────────────────────────
        {
            "src/skills/balance.ts": """// balance skill -- ETH and USDC balance lookup on Base

import type { Request, Response } from "express";
import { baseRpc } from "../shared/rpc.js";
import { USDC_ADDRESS } from "../shared/constants.js";

export async function balanceHandler(req: Request, res: Response) {
    try {
        const { address } = req.params;

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            res.status(400).json({ error: "invalid ethereum address" });
            return;
        }

        const ethHex = await baseRpc("eth_getBalance", [address, "latest"]);
        const ethBalance = parseInt(ethHex, 16) / 1e18;

        // USDC balanceOf(address)
        const selector = "0x70a08231";
        const padded = address.substring(2).toLowerCase().padStart(64, "0");
        const usdcHex = await baseRpc("eth_call", [
            { to: USDC_ADDRESS, data: `${selector}${padded}` },
            "latest",
        ]);
        const usdcBalance = parseInt(usdcHex, 16) / 1e6;

        res.json({
            address,
            network: "base",
            balances: {
                ETH: ethBalance.toFixed(6),
                USDC: usdcBalance.toFixed(2),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("balance lookup error:", err.message);
        res.status(500).json({
            error: "failed to fetch balance",
            details: err.message,
        });
    }
}
""",
            "src/skills/tx.ts": """// tx skill -- transaction lookup and decoder on Base

import type { Request, Response } from "express";
import { baseRpc } from "../shared/rpc.js";

export async function txHandler(req: Request, res: Response) {
    try {
        const { hash } = req.params;

        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
            res.status(400).json({ error: "invalid transaction hash" });
            return;
        }

        const tx = await baseRpc("eth_getTransactionByHash", [hash]);
        if (!tx) {
            res.status(404).json({ error: "transaction not found" });
            return;
        }

        const receipt = await baseRpc("eth_getTransactionReceipt", [hash]);

        res.json({
            hash: tx.hash,
            network: "base",
            from: tx.from,
            to: tx.to,
            value: (parseInt(tx.value, 16) / 1e18).toFixed(6) + " ETH",
            gasUsed: receipt
                ? parseInt(receipt.gasUsed, 16).toString()
                : "pending",
            status: receipt
                ? receipt.status === "0x1"
                    ? "success"
                    : "reverted"
                : "pending",
            blockNumber: tx.blockNumber
                ? parseInt(tx.blockNumber, 16)
                : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("tx lookup error:", err.message);
        res.status(500).json({
            error: "failed to fetch transaction",
            details: err.message,
        });
    }
}
""",
        },

        # ── Stage 6: Skills -- price + wallet + catalog ──────────────────
        {
            "src/skills/price.ts": """// price skill -- token price lookup via coingecko

import type { Request, Response } from "express";

const TOKEN_MAP: Record<string, string> = {
    ETH: "ethereum",
    USDC: "usd-coin",
    WETH: "weth",
    CBETH: "coinbase-wrapped-staked-eth",
    DAI: "dai",
    USDT: "tether",
};

export async function priceHandler(req: Request, res: Response) {
    try {
        const token = req.params.token.toUpperCase();
        const geckoId = TOKEN_MAP[token];

        if (!geckoId) {
            res.status(400).json({
                error: `unsupported token: ${token}`,
                supported: Object.keys(TOKEN_MAP),
            });
            return;
        }

        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`,
        );
        const data = await priceRes.json();

        if (!data[geckoId]) {
            res.status(502).json({ error: "price data unavailable" });
            return;
        }

        res.json({
            token,
            network: "base",
            priceUSD: data[geckoId].usd,
            change24h: data[geckoId].usd_24h_change
                ? data[geckoId].usd_24h_change.toFixed(2) + "%"
                : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("price lookup error:", err.message);
        res.status(500).json({
            error: "failed to fetch price",
            details: err.message,
        });
    }
}
""",
            "src/skills/wallet.ts": """// wallet skill -- generate fresh Base keypair

import type { Request, Response } from "express";
import { randomBytes, createECDH } from "crypto";
import { keccak_256 } from "@noble/hashes/sha3";

export async function walletHandler(_req: Request, res: Response) {
    try {
        const privKey = randomBytes(32);

        const ecdh = createECDH("secp256k1");
        ecdh.setPrivateKey(privKey);
        const pubKeyUncompressed = Buffer.from(
            ecdh.getPublicKey("hex", "uncompressed").slice(2),
            "hex",
        );

        const hash = keccak_256(pubKeyUncompressed);
        const address =
            "0x" + Buffer.from(hash).slice(-20).toString("hex");

        res.json({
            address,
            privateKey: "0x" + privKey.toString("hex"),
            network: "base",
            chainId: 8453,
            note: "Fund this wallet with ETH for gas and USDC for x402 payments. Keep the private key safe.",
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("wallet generation error:", err.message);
        res.status(500).json({
            error: "failed to generate wallet",
            details: err.message,
        });
    }
}
""",
            "src/skills/catalog.ts": """// catalog skill -- free endpoint listing available skills

import type { Request, Response } from "express";

export interface CatalogEntry {
    endpoint: string;
    method: string;
    price: string;
    currency: string;
    network: string;
    description: string;
    example: string;
}

export function catalogHandler(payTo: string, network: string) {
    return (_req: Request, res: Response) => {
        const skills: CatalogEntry[] = [
            {
                endpoint: "/balance/:address",
                method: "GET",
                price: "$0.01",
                currency: "USDC",
                network,
                description:
                    "Get ETH and USDC balances for any Base address",
                example: "/balance/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
            },
            {
                endpoint: "/tx/:hash",
                method: "GET",
                price: "$0.01",
                currency: "USDC",
                network,
                description:
                    "Get decoded transaction details for any Base tx",
                example: "/tx/0x...",
            },
            {
                endpoint: "/price/:token",
                method: "GET",
                price: "$0.01",
                currency: "USDC",
                network,
                description:
                    "Get current USD price for ETH or other tokens",
                example: "/price/ETH",
            },
            {
                endpoint: "/wallet/generate",
                method: "GET",
                price: "$0.01",
                currency: "USDC",
                network,
                description:
                    "Generate a fresh Base wallet keypair",
                example: "/wallet/generate",
            },
            {
                endpoint: "/chat",
                method: "POST",
                price: "$0.01",
                currency: "USDC",
                network,
                description:
                    "Chat with the Pinion AI agent",
                example: "POST /chat { messages: [...] }",
            },
        ];
        res.json({ skills, payTo, network });
    };
}
""",
            "src/skills/chat.ts": """// chat skill -- AI agent powered by Claude

import type { Request, Response } from "express";

const SYSTEM_PROMPT = `you are the pinion agent, a knowledgeable ai assistant for the pinion protocol. you talk casually, keep it short and helpful. you know about x402 payments, openclaw skills, base network and agent-native economics.`;

export function createChatHandler(anthropicApiKey: string) {
    let Anthropic: any;
    try {
        Anthropic = require("@anthropic-ai/sdk");
    } catch {
        return async (_req: Request, res: Response) => {
            res.status(501).json({
                error: "chat skill requires @anthropic-ai/sdk",
            });
        };
    }

    const client = new Anthropic.default({ apiKey: anthropicApiKey });

    return async (req: Request, res: Response) => {
        try {
            const { messages } = req.body;
            if (!messages || !Array.isArray(messages)) {
                res.status(400).json({
                    error: "messages array is required",
                });
                return;
            }

            const response = await client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 2048,
                system: SYSTEM_PROMPT,
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            });

            const text = response.content
                .filter((b: any) => b.type === "text")
                .map((b: any) => b.text)
                .join("");

            res.json({ response: text });
        } catch (err: any) {
            console.error("chat error:", err.message);
            res.status(500).json({ error: "agent request failed" });
        }
    };
}
""",
        },

        # ── Stage 7: Server framework ────────────────────────────────────
        {
            "src/server/types.ts": """// server framework types

import type { Request, Response } from "express";

export interface SkillDefinition {
    name: string;
    description: string;
    endpoint: string;
    method: "GET" | "POST";
    price: string;
    handler: (req: Request, res: Response) => Promise<void> | void;
}

export interface SkillServerConfig {
    /** wallet address to receive payments */
    payTo: string;
    /** "base" or "base-sepolia" */
    network?: string;
    /** facilitator URL for payment verification */
    facilitatorUrl?: string;
    /** port to listen on */
    port?: number;
    /** enable CORS headers for x402 */
    cors?: boolean;
}
""",
            "src/server/middleware.ts": """// x402 middleware wrapper for express

import type { Express } from "express";
import type { SkillDefinition } from "./types.js";
import { FACILITATOR_URL } from "../shared/constants.js";

/**
 * Apply x402 payment middleware to an express app.
 * Maps skill definitions to the route config format expected by x402-express.
 */
export function applyPaymentMiddleware(
    app: Express,
    skills: SkillDefinition[],
    payTo: string,
    network: string,
    facilitatorUrl?: string,
) {
    // dynamic import since x402-express might not be installed
    let paymentMiddleware: any;
    try {
        paymentMiddleware = require("x402-express").paymentMiddleware;
    } catch {
        console.warn(
            "x402-express not installed, skills will be free (no payment required)",
        );
        return;
    }

    const routes: Record<string, any> = {};

    for (const skill of skills) {
        // x402-express route format: "GET /balance/[address]"
        // convert express params (:param) to bracket notation ([param])
        const routeKey =
            `${skill.method} ` +
            skill.endpoint.replace(/:([^/]+)/g, "[$1]");

        routes[routeKey] = {
            price: skill.price,
            network,
            config: { description: skill.description },
        };
    }

    app.use(
        paymentMiddleware(payTo, routes, {
            url: facilitatorUrl || FACILITATOR_URL,
        }),
    );
}
""",
            "src/server/index.ts": """// skill server factory

import express from "express";
import type { SkillDefinition, SkillServerConfig } from "./types.js";
import { applyPaymentMiddleware } from "./middleware.js";
import { catalogHandler } from "../skills/catalog.js";
import { FACILITATOR_URL } from "../shared/constants.js";

export { skill } from "./skill.js";
export type { SkillDefinition, SkillServerConfig } from "./types.js";

export function createSkillServer(config: SkillServerConfig) {
    const app = express();
    const network = config.network || "base";
    const port = config.port || 4020;
    const facilitatorUrl = config.facilitatorUrl || FACILITATOR_URL;
    const skills: SkillDefinition[] = [];

    // parse JSON
    app.use(express.json());

    // CORS for x402 preflight
    if (config.cors !== false) {
        app.use((_req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Methods",
                "GET, POST, OPTIONS",
            );
            res.header(
                "Access-Control-Allow-Headers",
                "Content-Type, X-PAYMENT, Accept",
            );
            res.header(
                "Access-Control-Expose-Headers",
                "X-PAYMENT-RESPONSE",
            );
            if (_req.method === "OPTIONS") {
                res.sendStatus(204);
                return;
            }
            next();
        });
    }

    return {
        /** Register a skill with the server. */
        add(skillDef: SkillDefinition) {
            skills.push(skillDef);
        },

        /** Start listening. Call after all skills are added. */
        listen(customPort?: number) {
            const listenPort = customPort || port;

            // apply x402 middleware for all registered skills
            applyPaymentMiddleware(
                app,
                skills,
                config.payTo,
                network,
                facilitatorUrl,
            );

            // free catalog endpoint
            app.get("/catalog", catalogHandler(config.payTo, network));

            // register skill routes
            for (const s of skills) {
                const method = s.method.toLowerCase() as "get" | "post";
                app[method](s.endpoint, s.handler);
            }

            app.listen(listenPort, () => {
                console.log(
                    `pinion skill server on port ${listenPort}`,
                );
                console.log(`  skills:  ${skills.length}`);
                console.log(`  payTo:   ${config.payTo}`);
                console.log(`  network: ${network}`);
            });
        },
    };
}
""",
            "src/server/skill.ts": """// skill() helper for defining skills

import type { Request, Response } from "express";
import type { SkillDefinition } from "./types.js";
import { DEFAULT_SKILL_PRICE } from "../shared/constants.js";

interface SkillOptions {
    description?: string;
    endpoint?: string;
    method?: "GET" | "POST";
    price?: string;
    handler: (req: Request, res: Response) => Promise<void> | void;
}

/**
 * Create a skill definition.
 *
 * @example
 * skill("analyze", {
 *     price: "$0.01",
 *     handler: async (req, res) => {
 *         res.json({ result: "done" });
 *     },
 * })
 */
export function skill(name: string, opts: SkillOptions): SkillDefinition {
    return {
        name,
        description: opts.description || name,
        endpoint: opts.endpoint || `/${name}`,
        method: opts.method || "GET",
        price: opts.price || DEFAULT_SKILL_PRICE,
        handler: opts.handler,
    };
}
""",
        },

        # ── Stage 8: OpenClaw manifest ───────────────────────────────────
        {
            "src/server/manifest.ts": """// OpenClaw manifest generator

import type { SkillDefinition } from "./types.js";

export interface OpenClawManifest {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    skills: OpenClawSkill[];
    x402: {
        facilitator: string;
        network: string;
        paymentToken: string;
    };
}

interface OpenClawSkill {
    name: string;
    description: string;
    endpoint: string;
    method: string;
    price: string;
    currency: string;
    network: string;
    inputSchema: Record<string, any>;
}

/**
 * Generate an openclaw.plugin.json manifest from registered skills.
 */
export function generateManifest(
    name: string,
    description: string,
    skills: SkillDefinition[],
    network: string,
    facilitatorUrl: string,
): OpenClawManifest {
    return {
        name,
        version: "1.0.0",
        description,
        author: "Pinion Protocol",
        license: "MIT",
        skills: skills.map((s) => ({
            name: s.name,
            description: s.description,
            endpoint: s.endpoint,
            method: s.method,
            price: s.price,
            currency: "USDC",
            network,
            inputSchema: inferSchema(s),
        })),
        x402: {
            facilitator: facilitatorUrl,
            network,
            paymentToken: "USDC",
        },
    };
}

function inferSchema(skill: SkillDefinition): Record<string, any> {
    // extract route params from endpoint pattern
    const params: string[] = [];
    const paramRegex = /:([^/]+)/g;
    let match;
    while ((match = paramRegex.exec(skill.endpoint)) !== null) {
        params.push(match[1]);
    }

    if (params.length === 0 && skill.method === "GET") {
        return { type: "object", properties: {}, required: [] };
    }

    const properties: Record<string, any> = {};
    for (const p of params) {
        properties[p] = { type: "string", description: p };
    }

    return {
        type: "object",
        properties,
        required: params,
    };
}
""",
            "openclaw.plugin.json": """{
    "name": "pinion-chain-intel",
    "version": "1.0.0",
    "description": "On-chain intelligence for Base -- wallet balances, transaction lookups, and token prices. Paywalled via x402 USDC micropayments.",
    "author": "Pinion Protocol",
    "license": "MIT",
    "homepage": "https://github.com/chu2bard/pinion-os",
    "skills": [
        {
            "name": "balance",
            "description": "Get ETH and USDC balances for any Base address",
            "endpoint": "/balance/:address",
            "method": "GET",
            "price": "$0.01",
            "currency": "USDC",
            "network": "base",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "address": {
                        "type": "string",
                        "description": "Ethereum address (0x...)",
                        "pattern": "^0x[0-9a-fA-F]{40}$"
                    }
                },
                "required": ["address"]
            }
        },
        {
            "name": "tx",
            "description": "Get decoded transaction details for any Base transaction",
            "endpoint": "/tx/:hash",
            "method": "GET",
            "price": "$0.01",
            "currency": "USDC",
            "network": "base",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "hash": {
                        "type": "string",
                        "description": "Transaction hash (0x...)",
                        "pattern": "^0x[0-9a-fA-F]{64}$"
                    }
                },
                "required": ["hash"]
            }
        },
        {
            "name": "price",
            "description": "Get current USD price for ETH or other Base tokens",
            "endpoint": "/price/:token",
            "method": "GET",
            "price": "$0.01",
            "currency": "USDC",
            "network": "base",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "token": {
                        "type": "string",
                        "description": "Token symbol (ETH, USDC, WETH, DAI, USDT, CBETH)",
                        "enum": ["ETH", "USDC", "WETH", "DAI", "USDT", "CBETH"]
                    }
                },
                "required": ["token"]
            }
        },
        {
            "name": "wallet",
            "description": "Generate a fresh Base wallet keypair",
            "endpoint": "/wallet/generate",
            "method": "GET",
            "price": "$0.01",
            "currency": "USDC",
            "network": "base",
            "inputSchema": {
                "type": "object",
                "properties": {},
                "required": []
            }
        },
        {
            "name": "chat",
            "description": "Chat with the Pinion AI agent",
            "endpoint": "/chat",
            "method": "POST",
            "price": "$0.01",
            "currency": "USDC",
            "network": "base",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "messages": {
                        "type": "array",
                        "description": "Conversation messages",
                        "items": {
                            "type": "object",
                            "properties": {
                                "role": { "type": "string" },
                                "content": { "type": "string" }
                            }
                        }
                    }
                },
                "required": ["messages"]
            }
        }
    ],
    "x402": {
        "facilitator": "https://facilitator.payai.network",
        "network": "base",
        "paymentToken": "USDC"
    }
}
""",
        },

        # ── Stage 9: MCP plugin core ─────────────────────────────────────
        {
            "src/plugin/server.ts": """// MCP server implementation for Claude integration

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PinionClient } from "../client/index.js";
import { getToolDefinitions, handleToolCall } from "./tools.js";
import { loadPluginConfig, type PluginConfig } from "./config.js";

export async function startMcpServer(configOverride?: Partial<PluginConfig>) {
    const config = await loadPluginConfig(configOverride);

    const client = new PinionClient({
        privateKey: config.privateKey,
        apiUrl: config.apiUrl,
        network: config.network,
    });

    const server = new Server(
        { name: "pinion-os", version: "0.2.0" },
        { capabilities: { tools: {} } },
    );

    // list available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getToolDefinitions(),
    }));

    // handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return handleToolCall(client, name, args || {});
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);

    // log to stderr so MCP hosts can see we initialized (stdout is for MCP protocol)
    console.error("pinion-os MCP server running (wallet: %s)", client.address);
}
""",
        },

        # ── Stage 10: MCP plugin tools ───────────────────────────────────
        {
            "src/plugin/tools.ts": """// tool definitions for Claude MCP integration

import type { PinionClient } from "../client/index.js";

interface ToolDef {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
}

export function getToolDefinitions(): ToolDef[] {
    return [
        {
            name: "pinion_balance",
            description:
                "Get ETH and USDC balances for any Ethereum address on Base. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description:
                            "Ethereum address to check (0x...)",
                    },
                },
                required: ["address"],
            },
        },
        {
            name: "pinion_tx",
            description:
                "Get decoded transaction details for any Base transaction hash. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    hash: {
                        type: "string",
                        description: "Transaction hash (0x...)",
                    },
                },
                required: ["hash"],
            },
        },
        {
            name: "pinion_price",
            description:
                "Get current USD price for a token on Base (ETH, USDC, WETH, DAI, USDT, CBETH). Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    token: {
                        type: "string",
                        description: "Token symbol",
                        enum: [
                            "ETH",
                            "USDC",
                            "WETH",
                            "DAI",
                            "USDT",
                            "CBETH",
                        ],
                    },
                },
                required: ["token"],
            },
        },
        {
            name: "pinion_wallet",
            description:
                "Generate a fresh Ethereum wallet keypair for the Base network. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "pinion_chat",
            description:
                "Chat with the Pinion AI agent about x402, on-chain data, or the Pinion protocol. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "Your message to the agent",
                    },
                },
                required: ["message"],
            },
        },
    ];
}

export async function handleToolCall(
    client: PinionClient,
    toolName: string,
    args: Record<string, any>,
): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
        let result: any;

        switch (toolName) {
            case "pinion_balance":
                result = await client.skills.balance(args.address);
                break;
            case "pinion_tx":
                result = await client.skills.tx(args.hash);
                break;
            case "pinion_price":
                result = await client.skills.price(args.token);
                break;
            case "pinion_wallet":
                result = await client.skills.wallet();
                break;
            case "pinion_chat":
                result = await client.skills.chat(args.message);
                break;
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `unknown tool: ${toolName}`,
                        },
                    ],
                };
        }

        const paid =
            result.paidAmount !== "0"
                ? ` (paid ${result.paidAmount} wei USDC)`
                : "";

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result.data, null, 2) + paid,
                },
            ],
        };
    } catch (err: any) {
        return {
            content: [
                { type: "text", text: `error: ${err.message}` },
            ],
        };
    }
}
""",
            ".claude-plugin/plugin.json": """{
  "name": "pinion-os",
  "description": "On-chain AI skills via x402 micropayments on Base",
  "version": "0.2.0",
  "author": {
    "name": "chu2bard"
  },
  "homepage": "https://github.com/chu2bard/pinion-os",
  "repository": "https://github.com/chu2bard/pinion-os"
}
""",
            ".claude-plugin/marketplace.json": """{
  "name": "pinion-os",
  "description": "Pinion protocol plugins for Claude Code",
  "plugins": [
    {
      "name": "pinion-os",
      "description": "On-chain AI skills (balance, tx, price, wallet, chat) via x402 micropayments on Base",
      "source": "."
    }
  ]
}
""",
            ".mcp.json": """{
  "pinion": {
    "command": "npx",
    "args": ["pinion-os"],
    "env": {
      "PINION_PRIVATE_KEY": ""
    }
  }
}
""",
        },

        # ── Stage 11: MCP plugin config + entry point ────────────────────
        {
            "src/plugin/config.ts": """// plugin configuration -- loads from env or args

import { ConfigError } from "../shared/errors.js";
import { PINION_API_URL } from "../shared/constants.js";

export interface PluginConfig {
    privateKey: string;
    apiUrl: string;
    network: string;
}

export async function loadPluginConfig(
    overrides?: Partial<PluginConfig>,
): Promise<PluginConfig> {
    // try dotenv if available (dynamic import for ESM compat)
    try {
        await import("dotenv/config");
    } catch {
        // dotenv not installed or not needed, that's fine
    }

    const privateKey =
        overrides?.privateKey ||
        process.env.PINION_PRIVATE_KEY ||
        process.env.WALLET_KEY;

    if (!privateKey) {
        throw new ConfigError(
            "PINION_PRIVATE_KEY or WALLET_KEY environment variable is required. " +
                "Set it to a hex-encoded private key with USDC on Base.",
        );
    }

    return {
        privateKey,
        apiUrl:
            overrides?.apiUrl ||
            process.env.PINION_API_URL ||
            PINION_API_URL,
        network:
            overrides?.network ||
            process.env.PINION_NETWORK ||
            "base",
    };
}
""",
            "src/plugin/index.ts": """#!/usr/bin/env node
// pinion-os MCP plugin entry point
// run via: npx pinion-os
// or add to claude_desktop_config.json

import { startMcpServer } from "./server.js";

startMcpServer().catch((err) => {
    console.error("failed to start pinion MCP server:", err.message);
    process.exit(1);
});
""",
        },

        # ── Stage 12: Examples ───────────────────────────────────────────
        {
            "examples/use-sdk.ts": """// example: calling pinion skills via the SDK

import { PinionClient } from "../src/index.js";

async function main() {
    // create client with your wallet private key
    const pinion = new PinionClient({
        privateKey: process.env.WALLET_KEY!,
    });

    console.log("wallet:", pinion.address);

    // check a balance
    const balance = await pinion.skills.balance(
        "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
    );
    console.log("balance:", balance.data);

    // get ETH price
    const price = await pinion.skills.price("ETH");
    console.log("ETH price:", price.data);

    // generate a wallet
    const wallet = await pinion.skills.wallet();
    console.log("new wallet:", wallet.data.address);

    // chat with the agent
    const chat = await pinion.skills.chat("what is x402?");
    console.log("agent:", chat.data.response);
}

main().catch(console.error);
""",
            "examples/custom-skill.ts": """// example: building a custom x402-paywalled skill

import { createSkillServer, skill } from "../src/server/index.js";

const server = createSkillServer({
    payTo: process.env.ADDRESS || "0xYOUR_WALLET_ADDRESS",
    network: "base",
    port: 4020,
});

// add a custom skill
server.add(
    skill("analyze", {
        description: "Analyze an ethereum address for activity patterns",
        endpoint: "/analyze/:address",
        price: "$0.02",
        handler: async (req, res) => {
            const { address } = req.params;

            // your custom logic here
            const result = {
                address,
                txCount: Math.floor(Math.random() * 1000),
                firstSeen: "2024-01-15",
                labels: ["active", "defi-user"],
                riskScore: 0.12,
            };

            res.json(result);
        },
    }),
);

// add another skill
server.add(
    skill("summarize", {
        description: "Summarize recent activity for a wallet",
        endpoint: "/summarize/:address",
        price: "$0.01",
        handler: async (req, res) => {
            const { address } = req.params;
            res.json({
                address,
                summary: `wallet ${address.slice(0, 8)}... has been active on Base`,
                period: "30d",
            });
        },
    }),
);

server.listen();
""",
            "examples/claude-config.json": """{
    "mcpServers": {
        "pinion": {
            "command": "npx",
            "args": ["pinion-os"],
            "env": {
                "PINION_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE"
            }
        }
    }
}
""",
        },

        # ── Stage 13: Tests ──────────────────────────────────────────────
        {
            "tests/client.test.ts": """import { describe, it } from "node:test";
import assert from "node:assert/strict";

// test client types and basic construction
describe("PinionClient", () => {
    it("should throw on missing private key", () => {
        // dynamic import to avoid top-level side effects
        assert.throws(
            () => {
                const { PinionClient } = require("../src/client/index.js");
                new PinionClient({ privateKey: "" });
            },
            { name: "ConfigError" },
        );
    });

    it("should derive correct address from known private key", () => {
        const { PinionClient } = require("../src/client/index.js");
        // well-known test private key (hardhat account 0)
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });
        assert.equal(
            client.address.toLowerCase(),
            "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        );
    });

    it("should accept custom api url", () => {
        const { PinionClient } = require("../src/client/index.js");
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            apiUrl: "http://localhost:4020",
        });
        assert.ok(client);
    });
});

describe("SkillMethods", () => {
    it("should validate balance address format", async () => {
        const { PinionClient } = require("../src/client/index.js");
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });

        await assert.rejects(
            () => client.skills.balance("not-an-address"),
            { name: "SkillError" },
        );
    });

    it("should validate tx hash format", async () => {
        const { PinionClient } = require("../src/client/index.js");
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });

        await assert.rejects(
            () => client.skills.tx("bad-hash"),
            { name: "SkillError" },
        );
    });
});
""",
            "tests/x402.test.ts": """import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("x402 signing", () => {
    it("should sign a payment and produce base64 output", async () => {
        const { ethers } = require("ethers");
        const { signX402Payment } = require("../src/client/x402.js");

        const wallet = new ethers.Wallet(
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        );

        const requirements = {
            scheme: "exact",
            network: "base",
            maxAmountRequired: "10000",
            resource: "/balance/0x1234",
            description: "test payment",
            payTo: "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
            maxTimeoutSeconds: 900,
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        };

        const encoded = await signX402Payment(wallet, requirements, 1);

        // should be valid base64
        const decoded = JSON.parse(
            Buffer.from(encoded, "base64").toString(),
        );

        assert.equal(decoded.x402Version, 1);
        assert.equal(decoded.scheme, "exact");
        assert.equal(decoded.network, "base");
        assert.ok(decoded.payload.signature);
        assert.equal(
            decoded.payload.authorization.from.toLowerCase(),
            wallet.address.toLowerCase(),
        );
        assert.equal(
            decoded.payload.authorization.to,
            requirements.payTo,
        );
    });

    it("should parse payment requirements from 402 body", () => {
        const {
            parsePaymentRequirements,
        } = require("../src/client/x402.js");

        const body = {
            x402Version: 1,
            accepts: [
                {
                    scheme: "exact",
                    network: "base",
                    maxAmountRequired: "10000",
                    payTo: "0x1234",
                    asset: "0x5678",
                    maxTimeoutSeconds: 900,
                },
            ],
        };

        const { requirements, x402Version } =
            parsePaymentRequirements(body);
        assert.equal(x402Version, 1);
        assert.equal(requirements.scheme, "exact");
        assert.equal(requirements.payTo, "0x1234");
    });

    it("should throw on invalid 402 body", () => {
        const {
            parsePaymentRequirements,
        } = require("../src/client/x402.js");

        assert.throws(
            () => parsePaymentRequirements({}),
            /could not parse/,
        );
    });
});
""",
            "tests/server.test.ts": """import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("skill helper", () => {
    it("should create a skill definition", () => {
        const { skill } = require("../src/server/skill.js");

        const s = skill("test", {
            description: "test skill",
            price: "$0.05",
            handler: async (_req: any, res: any) => {
                res.json({ ok: true });
            },
        });

        assert.equal(s.name, "test");
        assert.equal(s.description, "test skill");
        assert.equal(s.endpoint, "/test");
        assert.equal(s.method, "GET");
        assert.equal(s.price, "$0.05");
        assert.ok(typeof s.handler === "function");
    });

    it("should use defaults for missing fields", () => {
        const { skill } = require("../src/server/skill.js");

        const s = skill("foo", {
            handler: async () => {},
        });

        assert.equal(s.endpoint, "/foo");
        assert.equal(s.method, "GET");
        assert.equal(s.price, "$0.01");
    });
});

describe("manifest generator", () => {
    it("should generate openclaw manifest", () => {
        const {
            generateManifest,
        } = require("../src/server/manifest.js");
        const { skill } = require("../src/server/skill.js");

        const skills = [
            skill("balance", {
                description: "get balance",
                endpoint: "/balance/:address",
                handler: async () => {},
            }),
        ];

        const manifest = generateManifest(
            "test-skill",
            "a test skill",
            skills,
            "base",
            "https://facilitator.payai.network",
        );

        assert.equal(manifest.name, "test-skill");
        assert.equal(manifest.skills.length, 1);
        assert.equal(manifest.skills[0].name, "balance");
        assert.deepEqual(
            manifest.skills[0].inputSchema.required,
            ["address"],
        );
        assert.equal(manifest.x402.network, "base");
    });
});
""",
        },

        # ── Stage 14: README + polish ────────────────────────────────────
        {
            ".env.example": """# your wallet private key (hex, with 0x prefix)
# must have ETH for gas and USDC for x402 payments on Base
PINION_PRIVATE_KEY=0x...

# optional: override the default pinion API URL
# PINION_API_URL=https://pinionos.com/skill

# optional: network (base or base-sepolia)
# PINION_NETWORK=base

# optional: for running your own skill server
# ADDRESS=0xYOUR_WALLET_ADDRESS
# FACILITATOR_URL=https://facilitator.payai.network

# optional: for the chat skill
# ANTHROPIC_API_KEY=sk-ant-...
""",
            "src/index.ts": """// pinion-os public API

// SDK exports
export { PinionClient } from "./client/index.js";
export type {
    PinionConfig,
    SkillResponse,
    BalanceResult,
    TxResult,
    PriceResult,
    WalletResult,
    ChatResult,
} from "./client/types.js";

// server exports available via "pinion-os/server"
// import { createSkillServer, skill } from "pinion-os/server"
""",
            "README.md": """<p align="center">
  <img src="assets/banner.png" alt="Pinion OS" width="100%" />
</p>

# pinion-os

Client SDK, Claude Code plugin, and skill server framework for [Pinion](https://pinionos.com). Handles x402 micropayments on Base so your code (or your agent) can call on-chain skills without thinking about payments.

## Architecture

```
                        +------------------------+
                        |   Your App / Agent /   |
                        |     Claude Code        |
                        +-----------+------------+
                                    |
                     +--------------+--------------+
                     |        pinion-os SDK        |
                     |   x402 signing & payments   |
                     +--------------+--------------+
                                    |
                     +--------------+--------------+
                     |   pinionos.com  /  custom   |
                     |      x402 skill server      |
                     +--------------+--------------+
                                    |
                        +-----------+------------+
                        |     Base L2 Network     |
                        |    USDC  settlement     |
                        +------------------------+
```

Three layers: your code talks to the SDK, the SDK handles x402 payment signing,
the skill server verifies payment through a facilitator and returns data.

## x402 Payment Flow

```
  Client                    Skill Server                 Facilitator
    |                             |                           |
    |--- GET /price/ETH --------->|                           |
    |<-- 402 + pay requirements --|                           |
    |                             |                           |
    |  [sign EIP-3009 auth]       |                           |
    |                             |                           |
    |--- GET /price/ETH --------->|                           |
    |    X-PAYMENT: <signed>      |--- verify + settle ------>|
    |                             |<-- ok --------------------|
    |<-- 200 { price: 2650 } -----|                           |
```

The SDK handles steps 2-4 automatically. You just call a method and get data back.

## Quickstart

```bash
# 1. install
npm install pinion-os

# 2. set your wallet key (needs ETH for gas, USDC for payments on Base)
export PINION_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# 3. use in code
node -e "
  import('pinion-os').then(async ({ PinionClient }) => {
    const p = new PinionClient({ privateKey: process.env.PINION_PRIVATE_KEY });
    console.log(await p.skills.price('ETH'));
  })
"

# 4. or run as MCP plugin for Claude
npx pinion-os

# 5. or build your own skill server
npx ts-node examples/custom-skill.ts
```

## Install

```
npm install pinion-os
```

## SDK Usage

```typescript
import { PinionClient } from "pinion-os";

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY,
});

// check balances
const bal = await pinion.skills.balance("0x1234...");
console.log(bal.data);  // { eth: "1.5", usdc: "100.0" }

// get token price
const price = await pinion.skills.price("ETH");
console.log(price.data);  // { token: "ETH", usd: "2650.00" }

// look up a transaction
const tx = await pinion.skills.tx("0xabc...");
console.log(tx.data);  // { from, to, value, ... }

// generate a wallet
const w = await pinion.skills.wallet();
console.log(w.data);  // { address, privateKey }

// chat with the agent
const chat = await pinion.skills.chat("what is x402?");
console.log(chat.data);  // { response: "..." }
```

Every call costs $0.01 USDC on Base via x402. Payment is handled automatically.

## MCP Plugin Setup

The plugin exposes five tools to any MCP-compatible host: `pinion_balance`,
`pinion_tx`, `pinion_price`, `pinion_wallet`, `pinion_chat`.

### Claude Desktop

Add to your config file:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\\Claude\\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "pinion": {
      "command": "npx",
      "args": ["pinion-os"],
      "env": {
        "PINION_PRIVATE_KEY": "0xYOUR_KEY"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude Code

Add the marketplace and install:

```
/plugin marketplace add chu2bard/pinion-os
/plugin install pinion-os
```

Set the env var when prompted, or export before launching:

```bash
export PINION_PRIVATE_KEY=0xYOUR_KEY
```

After installing, Claude can use `pinion_balance`, `pinion_tx`, `pinion_price`,
`pinion_wallet`, `pinion_chat` as tools.

Alternative (MCP-only, without plugin features):

```bash
claude mcp add pinion -- npx pinion-os
```

### Cursor IDE

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pinion": {
      "command": "npx",
      "args": ["pinion-os"],
      "env": {
        "PINION_PRIVATE_KEY": "0xYOUR_KEY"
      }
    }
  }
}
```

### Generic MCP Host

```bash
PINION_PRIVATE_KEY=0xYOUR_KEY npx pinion-os
```

The plugin communicates over stdio using the standard MCP protocol.

## Available Skills

| Skill | SDK Method | Endpoint | Price | Returns |
|-------|------------|----------|-------|---------|
| balance | `skills.balance(addr)` | GET /balance/:address | $0.01 | ETH + USDC balances |
| tx | `skills.tx(hash)` | GET /tx/:hash | $0.01 | Decoded tx details |
| price | `skills.price(token)` | GET /price/:token | $0.01 | USD price |
| wallet | `skills.wallet()` | GET /wallet/generate | $0.01 | New keypair |
| chat | `skills.chat(msg)` | POST /chat | $0.01 | Agent response |

## Build Your Own Skills

Use the server framework to create x402-paywalled endpoints:

```typescript
import { createSkillServer, skill } from "pinion-os/server";

const server = createSkillServer({
  payTo: "0xYOUR_WALLET",
  network: "base",
});

server.add(skill("analyze", {
  price: "$0.02",
  endpoint: "/analyze/:address",
  handler: async (req, res) => {
    const data = await analyzeAddress(req.params.address);
    res.json(data);
  },
}));

server.add(skill("score", {
  price: "$0.05",
  endpoint: "/score/:address",
  handler: async (req, res) => {
    const score = await getScore(req.params.address);
    res.json({ score });
  },
}));

server.listen(4020);
// -> http://localhost:4020/analyze/0x... (x402 paywalled)
// -> http://localhost:4020/score/0x...  (x402 paywalled)
```

The server automatically:
- Returns 402 with payment requirements for unauthenticated requests
- Verifies x402 payment signatures via the facilitator
- Settles USDC on Base to your wallet

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PINION_PRIVATE_KEY` | yes | -- | Hex private key (0x...) with USDC on Base |
| `PINION_API_URL` | no | `https://pinionos.com/skill` | Override the skill API endpoint |
| `PINION_NETWORK` | no | `base` | Network: `base` or `base-sepolia` |
| `ADDRESS` | server only | -- | Wallet address to receive payments |
| `FACILITATOR_URL` | server only | `https://facilitator.payai.network` | x402 facilitator endpoint |
| `ANTHROPIC_API_KEY` | chat skill | -- | Anthropic API key for the chat skill |

## Project Structure

```
pinion-os/
  .claude-plugin/
    plugin.json        Claude Code plugin manifest
    marketplace.json   Plugin marketplace catalog
  .mcp.json            MCP server auto-config
  src/
    client/            SDK for calling pinion skills
      index.ts           PinionClient class
      skills.ts          typed skill wrappers
      types.ts           TypeScript interfaces
      x402.ts            EIP-3009 payment signing
    plugin/            Claude MCP server
      server.ts          MCP request handlers
      tools.ts           tool definitions + dispatch
      config.ts          env/arg configuration
      index.ts           CLI entry point (npx pinion-os)
    server/            Framework for building skills
      index.ts           createSkillServer factory
      skill.ts           skill() definition helper
      middleware.ts      x402 middleware wrapper
      types.ts           server types
    skills/            Built-in skill handlers
      balance.ts         ETH/USDC balance lookup
      tx.ts              transaction decoder
      price.ts           token price via CoinGecko
      wallet.ts          keypair generation
      chat.ts            AI chat via Anthropic
    shared/            Shared utilities
      constants.ts       RPC URLs, contract addresses
      rpc.ts             Base JSON-RPC helper
      errors.ts          custom error classes
  examples/
    use-sdk.ts           SDK usage example
    custom-skill.ts      custom skill server example
    claude-config.json   example MCP config
  tests/
    client.test.ts       SDK tests
    x402.test.ts         payment signing tests
    server.test.ts       skill server tests
  openclaw.plugin.json   OpenClaw skill manifest
```

## Troubleshooting

**`PINION_PRIVATE_KEY or WALLET_KEY environment variable is required`**

Set the env var before running. The key must be a hex string starting with `0x`.

**`insufficient USDC balance`**

Your wallet needs USDC on Base (not Ethereum mainnet). Bridge USDC to Base via
https://bridge.base.org or buy directly on Base.

**`402 Payment Required` in response**

The SDK should handle this automatically. If you see raw 402 responses, check that
your private key has both ETH (for gas) and USDC (for payments) on Base.

**MCP plugin not showing up in Claude**

Make sure the config file path is correct for your OS (see setup section above).
Restart Claude Desktop or Claude Code after changing config.

**`Cannot find module 'pinion-os'`**

Run `npm install pinion-os` in your project, or use `npx pinion-os` to auto-install.

**`ESOCKETTIMEDOUT` or network errors**

Check your internet connection. The SDK calls `pinionos.com` by default.
You can override with `PINION_API_URL` env var.

## Development

```bash
git clone https://github.com/chu2bard/pinion-os
cd pinion-os
npm install
npm run build
npm test
```

## Contributing

PRs welcome. Keep it simple:

1. Fork and create a branch
2. Make your changes
3. Run `npm test` and `npm run lint`
4. Open a PR with a clear description

No need for elaborate commit messages. Just describe what changed and why.

## License

MIT
""",
            "package.json": """{
  "name": "pinion-os",
  "version": "0.2.0",
  "description": "Client SDK, Claude plugin and skill framework for the Pinion protocol. x402 micropayments on Base.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "pinion-os": "dist/plugin/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./server": {
      "types": "./dist/server/index.d.ts",
      "import": "./dist/server/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "node --test tests/",
    "lint": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "x402",
    "openclaw",
    "mcp",
    "claude",
    "agents",
    "payments",
    "base",
    "usdc",
    "pinion"
  ],
  "license": "MIT",
  "author": "chu2bard",
  "repository": {
    "type": "git",
    "url": "https://github.com/chu2bard/pinion-os"
  },
  "dependencies": {
    "ethers": "^6.11.0",
    "express": "^4.21.0",
    "x402-express": "^1.1.0",
    "dotenv": "^16.4.0",
    "@modelcontextprotocol/sdk": "^1.5.0",
    "@noble/hashes": "^1.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/express": "^5.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
""",
        },
    ]
