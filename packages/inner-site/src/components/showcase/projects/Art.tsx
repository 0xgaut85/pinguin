import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface ERC8004PageProps {}

const ERC8004Page: React.FC<ERC8004PageProps> = (props) => {
    return (
        <div className="site-page-content">
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>ERC-8004</h1>
                        <div style={styles.badge}>
                            <span style={styles.badgeText}>IDENTITY</span>
                        </div>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Identity and Trust Registry</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    ERC-8004 is a proposed Ethereum standard for decentralized
                    identity and trust scoring of autonomous agents. It provides
                    a framework where machines can establish, verify, and
                    evaluate the trustworthiness of other machines at runtime
                    without relying on centralized certificate authorities.
                </p>
            </div>

            {/* TRUST MODEL */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Trust Score System</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Every agent registered in an ERC-8004 trust registry
                    receives a <b>trust score</b> that reflects its historical
                    reliability, transaction volume and dispute record. This
                    score is used by Pinion's Capability Gateway to make
                    real-time authorization decisions.
                </p>
                <br />
                <div style={styles.scoreCard}>
                    <div style={styles.scoreHeader}>
                        <h3>Trust Score Components</h3>
                    </div>
                    <div style={styles.scoreRow}>
                        <div style={styles.scoreName}>
                            <b>Transaction History</b>
                        </div>
                        <div style={styles.scoreDesc}>
                            <p>
                                Number of successful capability invocations
                                completed without disputes or failures.
                            </p>
                        </div>
                    </div>
                    <div style={styles.scoreRow}>
                        <div style={styles.scoreName}>
                            <b>Payment Reliability</b>
                        </div>
                        <div style={styles.scoreDesc}>
                            <p>
                                Track record of on-time payment settlement and
                                absence of payment disputes.
                            </p>
                        </div>
                    </div>
                    <div style={styles.scoreRow}>
                        <div style={styles.scoreName}>
                            <b>Execution Quality</b>
                        </div>
                        <div style={styles.scoreDesc}>
                            <p>
                                Quality of capabilities provided, based on
                                consumer feedback and error rates.
                            </p>
                        </div>
                    </div>
                    <div style={styles.scoreRow}>
                        <div style={styles.scoreName}>
                            <b>Registry Age</b>
                        </div>
                        <div style={styles.scoreDesc}>
                            <p>
                                Duration of presence in the trust registry.
                                Longer history increases score weight.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* REGISTRY ARCHITECTURE */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Registry Architecture</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`┌─────────────────────────────────────────┐
│         ERC-8004 TRUST REGISTRY         │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Agent Identity Record           │   │
│  │  ├─ address: 0xABC...           │   │
│  │  ├─ trustScore: 87              │   │
│  │  ├─ registeredAt: 1704067200    │   │
│  │  ├─ totalTransactions: 14,231   │   │
│  │  ├─ disputeRate: 0.02%         │   │
│  │  ├─ capabilities: [             │   │
│  │  │    "text-analysis",          │   │
│  │  │    "image-recognition",      │   │
│  │  │    "data-pipeline"           │   │
│  │  │  ]                           │   │
│  │  └─ attestations: [             │   │
│  │       { from: 0xDEF, score: 92 }│   │
│  │       { from: 0x456, score: 85 }│   │
│  │     ]                           │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Lookup: O(1) by address               │
│  Update: Governed by attestation rules  │
└─────────────────────────────────────────┘`}
                </pre>
            </div>

            {/* PINION INTEGRATION */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Pinion Integration</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Pinion's policy engine queries ERC-8004 registries at
                    runtime to make authorization decisions. Before any
                    capability invocation, the trust score of both the caller
                    and the provider is evaluated:
                </p>
                <br />
                <div style={styles.integrationStep}>
                    <h3 style={styles.stepTitle}>1. Identity Verification</h3>
                    <p>
                        The agent's on-chain identity is resolved from the
                        ERC-8004 registry. Unsigned or unregistered agents are
                        rejected by default.
                    </p>
                </div>
                <div style={styles.integrationStep}>
                    <h3 style={styles.stepTitle}>2. Trust Evaluation</h3>
                    <p>
                        The agent's trust score is compared against the
                        capability's minimum trust threshold. Policy engine
                        can also evaluate specific attestations from trusted
                        registries.
                    </p>
                </div>
                <div style={styles.integrationStep}>
                    <h3 style={styles.stepTitle}>3. Dynamic Pricing</h3>
                    <p>
                        Trust scores can influence pricing. Agents with higher
                        trust scores may receive preferential pricing or reduced
                        escrow requirements.
                    </p>
                </div>
                <div style={styles.integrationStep}>
                    <h3 style={styles.stepTitle}>4. Post-Execution Update</h3>
                    <p>
                        After successful execution, the trust registry is
                        updated with the transaction outcome, incrementally
                        adjusting both parties' trust scores.
                    </p>
                </div>
            </div>

            {/* SMART CONTRACT */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Contract Interface</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.solidityBlock}>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC8004 {
    struct AgentIdentity {
        address agent;
        uint256 trustScore;
        uint256 registeredAt;
        uint256 totalTransactions;
        string[] capabilities;
    }

    function register(
        address agent,
        string[] calldata capabilities
    ) external returns (uint256 agentId);

    function getTrustScore(
        address agent
    ) external view returns (uint256);

    function attest(
        address agent,
        uint256 score,
        bytes calldata proof
    ) external;

    function meetsThreshold(
        address agent,
        uint256 minScore
    ) external view returns (bool);
}`}
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
    codeBlock: {
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.4,
        backgroundColor: '#1a1a1a',
        color: '#E8530E',
        padding: 16,
        overflow: 'auto',
        whiteSpace: 'pre',
        border: '1px solid #333',
    },
    solidityBlock: {
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
    scoreCard: {
        border: '1px solid #ccc',
        flexDirection: 'column',
        marginBottom: 16,
    },
    scoreHeader: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ccc',
    },
    scoreRow: {
        padding: 12,
        borderBottom: '1px solid #eee',
    },
    scoreName: {
        minWidth: 150,
        marginRight: 12,
    },
    scoreDesc: {
        flex: 1,
    },
    integrationStep: {
        marginBottom: 16,
        padding: 16,
        border: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
    },
    stepTitle: {
        color: '#E8530E',
        marginBottom: 8,
    },
};

export default ERC8004Page;
