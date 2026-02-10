import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface X402PageProps {}

const X402Page: React.FC<X402PageProps> = (props) => {
    return (
        <div className="site-page-content">
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>x402</h1>
                        <div style={styles.badge}>
                            <span style={styles.badgeText}>PAYMENT</span>
                        </div>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>HTTP 402 Payments</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    x402 uses the HTTP 402 status code to gate API endpoints
                    behind on-chain payments. When a server responds with 402
                    it includes structured payment requirements. The client
                    signs a USDC transfer and retries with proof attached.
                    No accounts, no API keys.
                </p>
            </div>

            {/* PROTOCOL FLOW */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Protocol Flow</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`CLIENT                                SERVER
  │                                      │
  │── GET /skill/balance/0xABC... ─────▶│
  │                                      │
  │◀── 402 Payment Required ───────────│
  │    {                                 │
  │      "scheme": "exact",              │
  │      "network": "base",              │
  │      "maxAmountRequired": "10000",   │
  │      "asset": "0x833589...USDC",     │
  │      "payTo": "0x101C...0acf",       │
  │      "maxTimeoutSeconds": 900        │
  │    }                                 │
  │                                      │
  │  [wallet signs EIP-3009 transfer]    │
  │                                      │
  │── GET /skill/balance/0xABC... ─────▶│
  │   X-PAYMENT: base64({               │
  │     x402Version: 1,                  │
  │     scheme: "exact",                 │
  │     network: "base",                 │
  │     payload: { signature, auth }     │
  │   })                                 │
  │                                      │
  │◀── 200 OK ─────────────────────────│
  │    { "eth": "0.042", "usdc": "12" }  │`}
                </pre>
            </div>

            {/* HOW IT WORKS */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>How Pinion Uses x402</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Every Pinion skill endpoint is protected by
                    x402-express middleware. Here is the step-by-step flow
                    for a real request.
                </p>
                <br />
                <div style={styles.stepCard}>
                    <div style={styles.stepNumber}>
                        <h3>1</h3>
                    </div>
                    <div style={styles.stepContent}>
                        <h3>Initial Request</h3>
                        <p>
                            The client calls a skill endpoint with no payment.
                            The middleware intercepts and returns HTTP 402 with
                            a JSON body containing the payment requirements:
                            amount, asset (USDC), network (Base) and payTo address.
                        </p>
                    </div>
                </div>
                <div style={styles.stepCard}>
                    <div style={styles.stepNumber}>
                        <h3>2</h3>
                    </div>
                    <div style={styles.stepContent}>
                        <h3>Wallet Signature</h3>
                        <p>
                            The client constructs an EIP-3009
                            TransferWithAuthorization typed data object and
                            signs it with eth_signTypedData_v4. This
                            authorizes a $0.01 USDC transfer from the user
                            to the payTo address on Base.
                        </p>
                    </div>
                </div>
                <div style={styles.stepCard}>
                    <div style={styles.stepNumber}>
                        <h3>3</h3>
                    </div>
                    <div style={styles.stepContent}>
                        <h3>Payment Verification</h3>
                        <p>
                            The client retries the same request with an
                            X-PAYMENT header containing a base64-encoded
                            JSON payload (signature + authorization params).
                            The facilitator verifies and settles the payment
                            on-chain then the server returns the skill result.
                        </p>
                    </div>
                </div>
            </div>

            {/* X-PAYMENT HEADER */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>X-PAYMENT Header Format</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`// The X-PAYMENT header is a base64-encoded JSON string:
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "base",
  "payload": {
    "signature": "0xABC...DEF",
    "authorization": {
      "from": "0xUSER_ADDRESS",
      "to": "0x101Cd32b...0acf",
      "value": "10000",
      "validAfter": "1738000000",
      "validBefore": "1738000900",
      "nonce": "0xRANDOM_32_BYTES"
    }
  }
}

// Sent as:
// X-PAYMENT: eyJ4NDAyVmVyc2lvbiI6MSwi...`}
                </pre>
            </div>

            {/* SERVER SETUP */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Server Setup</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    On the server side, a single middleware call protects
                    all routes. Bracket syntax marks dynamic segments.
                </p>
                <br />
                <pre style={styles.codeBlock}>
{`const { paymentMiddleware } = require('x402-express');

app.use(
  paymentMiddleware(
    '0x101Cd32b...0acf',       // payTo
    {
      'GET /balance/[address]': {
        price: '$0.01',
        network: 'base',
      },
      'POST /chat': {
        price: '$0.01',
        network: 'base',
      },
    },
    { url: 'https://x402.org/facilitator' },
  )
);`}
                </pre>
            </div>

            {/* NETWORK */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Network</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <div style={styles.networkCard}>
                    <h3>Base Mainnet</h3>
                    <p>
                        All Pinion skills settle on Base (chain ID 8453).
                        USDC contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913.
                        Low fees, fast finality.
                    </p>
                </div>
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
    codeBlock: {
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.5,
        backgroundColor: '#1a1a1a',
        color: '#00ff88',
        padding: 16,
        overflow: 'auto',
        whiteSpace: 'pre',
        border: '1px solid #333',
    },
    stepCard: {
        marginBottom: 16,
        padding: 16,
        border: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
    },
    stepNumber: {
        marginRight: 16,
        minWidth: 30,
        color: '#E8530E',
    },
    stepContent: {
        flexDirection: 'column',
        flex: 1,
    },
    networkCard: {
        padding: 12,
        marginBottom: 8,
        border: '1px solid #ccc',
        flexDirection: 'column',
    },
};

export default X402Page;
