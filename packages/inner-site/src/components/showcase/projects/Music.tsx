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
                        <h3>HTTP Payment Standard</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    The x402 protocol implements the long-dormant HTTP 402
                    "Payment Required" status code as a machine-native payment
                    negotiation standard. When a server responds with 402, it
                    includes structured payment requirements that clients can
                    fulfill automatically without human interaction.
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
{`CLIENT                              SERVER
  │                                    │
  │──── GET /api/analyze ────────────▶│
  │                                    │
  │◀─── 402 Payment Required ────────│
  │     x-payment-amount: 0.001 ETH    │
  │     x-payment-address: 0xABC...    │
  │     x-payment-network: base        │
  │     x-payment-token: USDC          │
  │                                    │
  │──── GET /api/analyze ────────────▶│
  │     x-payment-proof: 0xDEF...      │
  │     x-payment-tx: 0x123...         │
  │                                    │
  │◀─── 200 OK ──────────────────────│
  │     { result: "analysis data" }    │
  │                                    │`}
                </pre>
            </div>

            {/* HOW PINION IMPLEMENTS x402 */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>How Pinion Implements x402</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Pinion uses x402 as the wire protocol for all payment
                    negotiation within the economic execution flow. When a
                    capability invocation requires payment, the interaction
                    follows the standard HTTP 402 handshake:
                </p>
                <br />
                <div style={styles.stepCard}>
                    <div style={styles.stepNumber}>
                        <h3>1</h3>
                    </div>
                    <div style={styles.stepContent}>
                        <h3>Initial Request</h3>
                        <p>
                            The calling agent sends a capability request. If
                            the capability requires payment, the server
                            responds with HTTP 402 and structured payment
                            headers.
                        </p>
                    </div>
                </div>
                <div style={styles.stepCard}>
                    <div style={styles.stepNumber}>
                        <h3>2</h3>
                    </div>
                    <div style={styles.stepContent}>
                        <h3>Policy Evaluation</h3>
                        <p>
                            Pinion's policy engine evaluates the payment
                            request against the agent's spending limits, trust
                            requirements and budget constraints. Payment is
                            authorized or rejected automatically.
                        </p>
                    </div>
                </div>
                <div style={styles.stepCard}>
                    <div style={styles.stepNumber}>
                        <h3>3</h3>
                    </div>
                    <div style={styles.stepContent}>
                        <h3>Payment & Execution</h3>
                        <p>
                            Payment is submitted on-chain (or via payment
                            channel). The proof is then included in a retry
                            request. The server verifies payment and executes
                            the capability.
                        </p>
                    </div>
                </div>
            </div>

            {/* HEADER FORMAT */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>x402 Header Format</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`// x402 Response Headers (Server → Client)
HTTP/1.1 402 Payment Required
Content-Type: application/json
X-Payment-Amount: 1000000          // Amount in smallest unit
X-Payment-Currency: USDC           // Token symbol
X-Payment-Network: base            // Chain / network
X-Payment-Address: 0xABC...DEF    // Recipient address
X-Payment-Expiry: 1738000000      // Unix timestamp
X-Payment-Memo: cap:text-analysis  // Capability reference

// x402 Request Headers (Client → Server)
GET /api/analyze HTTP/1.1
X-Payment-Proof: 0xSIGNATURE...   // Payment signature
X-Payment-TxHash: 0xHASH...       // On-chain tx hash
X-Payment-Payer: 0xPAYER...       // Payer identity`}
                </pre>
            </div>

            {/* SUPPORTED NETWORKS */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Supported Networks</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <div style={styles.networkGrid}>
                    <div style={styles.networkCard}>
                        <h3>Base</h3>
                        <p>Primary settlement layer. Low fees, fast finality.</p>
                    </div>
                    <div style={styles.networkCard}>
                        <h3>Ethereum</h3>
                        <p>High-value settlements and identity anchoring.</p>
                    </div>
                    <div style={styles.networkCard}>
                        <h3>Solana</h3>
                        <p>High-throughput micro-payment settlement.</p>
                    </div>
                    <div style={styles.networkCard}>
                        <h3>Arbitrum</h3>
                        <p>L2 settlement for cost-sensitive operations.</p>
                    </div>
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
    networkGrid: {
        flexDirection: 'column',
    },
    networkCard: {
        padding: 12,
        marginBottom: 8,
        border: '1px solid #ccc',
        flexDirection: 'column',
    },
};

export default X402Page;
