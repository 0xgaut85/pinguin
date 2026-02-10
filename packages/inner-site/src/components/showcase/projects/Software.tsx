import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface OpenClawPageProps {}

const OpenClawPage: React.FC<OpenClawPageProps> = (props) => {
    return (
        <div className="site-page-content">
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>OpenClaw</h1>
                        <div style={styles.badge}>
                            <span style={styles.badgeText}>EXECUTION</span>
                        </div>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Skill Format</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    OpenClaw is a skill-as-a-service standard for autonomous
                    agents. Skills are HTTP endpoints that agents can discover,
                    price-check and invoke programmatically. Pinion packages
                    all of its capabilities as OpenClaw skills.
                </p>
            </div>

            {/* LIVE SKILLS */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Live Skills</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Five skills are live in production at{' '}
                    <b>pinionos.com/skill/</b>. Each costs $0.01 USDC on
                    Base mainnet via x402.
                </p>
                <br />
                <div style={styles.skillCard}>
                    <h3 style={styles.skillTitle}>Balance Lookup</h3>
                    <code style={styles.skillEndpoint}>GET /skill/balance/:address</code>
                    <p>Returns ETH and USDC balances for any Base address.</p>
                </div>
                <div style={styles.skillCard}>
                    <h3 style={styles.skillTitle}>Transaction Details</h3>
                    <code style={styles.skillEndpoint}>GET /skill/tx/:hash</code>
                    <p>Decoded transaction info for any Base tx hash.</p>
                </div>
                <div style={styles.skillCard}>
                    <h3 style={styles.skillTitle}>Token Price</h3>
                    <code style={styles.skillEndpoint}>GET /skill/price/:token</code>
                    <p>Current USD price for ETH or other tokens via CoinGecko.</p>
                </div>
                <div style={styles.skillCard}>
                    <h3 style={styles.skillTitle}>Wallet Generation</h3>
                    <code style={styles.skillEndpoint}>GET /skill/wallet/generate</code>
                    <p>Generates a fresh Ethereum keypair for Base. Useful for funding OpenClaw agents.</p>
                </div>
                <div style={styles.skillCard}>
                    <h3 style={styles.skillTitle}>AI Agent Chat</h3>
                    <code style={styles.skillEndpoint}>POST /skill/chat</code>
                    <p>Chat with the Pinion AI Agent. Send a messages array, get a response.</p>
                </div>
            </div>

            {/* SKILL CATALOG */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Skill Catalog</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    The free catalog endpoint lists all available skills with
                    their price, method and description. No payment required.
                </p>
                <br />
                <pre style={styles.codeBlock}>
{`GET /skill/catalog

{
  "skills": [
    {
      "endpoint": "/skill/balance/:address",
      "method": "GET",
      "price": "$0.01",
      "currency": "USDC",
      "network": "base",
      "description": "Get ETH and USDC balances for any Base address"
    },
    ...
  ],
  "payTo": "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
  "network": "base"
}`}
                </pre>
            </div>

            {/* SKILL MANIFEST */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Skill Manifest</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Each skill set is described by an{' '}
                    <b>openclaw.plugin.json</b> manifest that agents use
                    for discovery.
                </p>
                <br />
                <pre style={styles.codeBlock}>
{`{
  "name": "pinion-openclaw-skill",
  "version": "1.0.0",
  "description": "On-chain intelligence on Base via x402",
  "skills": [
    {
      "name": "balance-lookup",
      "endpoint": "/skill/balance/{address}",
      "method": "GET",
      "price": "0.01",
      "currency": "USDC",
      "network": "base"
    },
    {
      "name": "wallet-generate",
      "endpoint": "/skill/wallet/generate",
      "method": "GET",
      "price": "0.01",
      "currency": "USDC",
      "network": "base"
    }
  ]
}`}
                </pre>
            </div>

            {/* ARCHITECTURE */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>How It Works</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`┌──────────────────────────────────────────┐
│              CLIENT / AGENT              │
│                                          │
│  1. GET /skill/balance/0xABC...          │
│  2. Receive 402 + payment requirements   │
│  3. Sign EIP-3009 USDC transfer          │
│  4. Retry with X-PAYMENT header          │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│          x402-express MIDDLEWARE          │
│                                          │
│  - Intercepts request                    │
│  - Sends 402 if no payment              │
│  - Verifies payment via facilitator     │
│  - Forwards to skill handler if valid   │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│            SKILL HANDLER                 │
│                                          │
│  - Calls Base RPC / CoinGecko / etc     │
│  - Returns JSON response                │
└──────────────────────────────────────────┘`}
                </pre>
            </div>
            <ResumeDownload />
        </div>
    );
};

const styles: StyleSheetCSS = {
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerContainer: {
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
    },
    headerRow: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    badge: {
        backgroundColor: '#E8530E',
        padding: '4px 10px',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    skillCard: {
        marginBottom: 16,
        padding: 16,
        border: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
    },
    skillTitle: {
        color: '#E8530E',
        marginBottom: 4,
    },
    skillEndpoint: {
        fontFamily: 'monospace',
        fontSize: 11,
        backgroundColor: '#1a1a1a',
        color: '#00ff88',
        padding: '2px 6px',
        marginBottom: 8,
        display: 'inline-block',
    },
    codeBlock: {
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.4,
        backgroundColor: '#1a1a1a',
        color: '#00ff88',
        padding: 16,
        overflow: 'auto',
        whiteSpace: 'pre',
        border: '1px solid #333',
    },
};

export default OpenClawPage;
