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
                        <h3>Agent Runtime Integration</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    OpenClaw provides execution environments where autonomous
                    agents can discover, acquire and invoke capabilities
                    (called "skills") as modular units of computation. Pinion
                    integrates natively with OpenClaw to add economic execution
                    to this skill-based architecture.
                </p>
            </div>

            {/* HOW IT WORKS */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>How Pinion Extends OpenClaw</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    In the OpenClaw model, skills are self-contained execution
                    units that agents can discover and invoke. Pinion extends
                    this by making each skill a <b>priced capability</b>:
                </p>
                <br />
                <div style={styles.conceptCard}>
                    <h3 style={styles.conceptTitle}>
                        Skill-as-a-Service
                    </h3>
                    <p>
                        Every OpenClaw skill can publish a pricing model through
                        Pinion. This transforms skills from free internal
                        resources into economically viable services that can be
                        sold to external agents.
                    </p>
                </div>
                <div style={styles.conceptCard}>
                    <h3 style={styles.conceptTitle}>
                        Agent Invocation Flow
                    </h3>
                    <p>
                        When an agent needs a skill it doesn't own, Pinion's
                        Capability Gateway discovers available providers,
                        compares pricing and trust scores then invokes the
                        skill with automatic payment settlement.
                    </p>
                </div>
                <div style={styles.conceptCard}>
                    <h3 style={styles.conceptTitle}>
                        Execution Context Preservation
                    </h3>
                    <p>
                        Pinion preserves the full OpenClaw execution context
                        across paid invocations. State, permissions, and
                        observability data flow seamlessly between the calling
                        agent and the capability provider.
                    </p>
                </div>
            </div>

            {/* INTEGRATION ARCHITECTURE */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Integration Architecture</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`┌────────────────────────────────────────────┐
│            OPENCLAW RUNTIME                │
│                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Skill A │  │ Skill B │  │ Skill C │   │
│  │  (own)  │  │  (own)  │  │ (paid)  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘   │
│       │            │            │          │
│       └────────────┼────────────┘          │
│                    │                       │
│         ┌──────────┴─────────┐             │
│         │  PINION GATEWAY    │             │
│         │  - Price lookup    │             │
│         │  - x402 payment    │             │
│         │  - Invoke & return │             │
│         └────────────────────┘             │
└────────────────────────────────────────────┘`}
                </pre>
            </div>

            {/* USE CASES */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Use Cases</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <div style={styles.useCaseCard}>
                    <h3>Multi-Agent Workflows</h3>
                    <p>
                        Multiple agents collaborate on complex tasks, purchasing
                        each other's skills on-demand. Each transaction is
                        atomic and observable.
                    </p>
                </div>
                <div style={styles.useCaseCard}>
                    <h3>Skill Marketplace</h3>
                    <p>
                        Developers publish specialized skills (NLP, vision,
                        data analysis) that any agent can discover and purchase
                        at runtime, creating a decentralized compute market.
                    </p>
                </div>
                <div style={styles.useCaseCard}>
                    <h3>Resource Optimization</h3>
                    <p>
                        Agents dynamically purchase compute capabilities during
                        peak demand rather than provisioning permanent
                        infrastructure, reducing cost and improving efficiency.
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
    conceptCard: {
        marginBottom: 16,
        padding: 16,
        border: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
    },
    conceptTitle: {
        color: '#E8530E',
        marginBottom: 8,
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
    },
    useCaseCard: {
        marginBottom: 16,
        padding: 16,
        border: '1px solid #ccc',
        flexDirection: 'column',
    },
};

export default OpenClawPage;
