import React from 'react';
import ResumeDownload from './ResumeDownload';

export interface DevelopersProps {}

const Developers: React.FC<DevelopersProps> = (props) => {
    return (
        <div className="site-page-content">
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Developers</h1>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Build with Pinion</h3>
                    </div>
                </div>
            </div>

            {/* GETTING STARTED */}
            <div className="text-block">
                <h2>Getting Started</h2>
                <br />
                <p>
                    Pinion is designed to integrate directly into existing
                    software infrastructure with minimal friction. Whether
                    you're building autonomous agents, API services, or
                    distributed systems, Pinion's SDK provides everything you
                    need to enable economic execution.
                </p>
                <br />
                <p>
                    The integration follows a simple pattern: register your
                    capabilities, define pricing and let the protocol handle
                    discovery, payment and invocation.
                </p>
            </div>

            {/* CODE EXAMPLE */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Quick Example</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <pre style={styles.codeBlock}>
{`// Register a capability with Pinion
import { PinionSDK } from '@pinion/sdk';

const pinion = new PinionSDK({
  identity: process.env.AGENT_IDENTITY,
  network: 'mainnet',
});

// Publish a priced capability
await pinion.capabilities.register({
  name: 'text-analysis',
  version: '1.0.0',
  pricing: {
    model: 'per-invocation',
    amount: '0.001',
    currency: 'ETH',
  },
  trust: {
    minScore: 50,
    requiredRegistries: ['erc8004-main'],
  },
  handler: async (input) => {
    const result = await analyzeText(input);
    return result;
  },
});

console.log('Capability registered.');`}
                </pre>
            </div>

            {/* INVOKING */}
            <div className="text-block">
                <h2>Invoking a Capability</h2>
                <br />
                <pre style={styles.codeBlock}>
{`// Discover and invoke a capability
const capabilities = await pinion.discover({
  category: 'text-analysis',
  maxPrice: '0.005',
  minTrustScore: 40,
});

const result = await pinion.invoke(
  capabilities[0].id,
  {
    text: 'Analyze this document...',
    format: 'summary',
  },
  {
    budget: '0.002',
    timeout: 30000,
  }
);

// Payment handled automatically via x402
console.log('Result:', result.data);
console.log('Cost:', result.payment.amount);`}
                </pre>
            </div>

            {/* SDK FEATURES */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>SDK Features</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <div style={styles.featureGrid}>
                    <div style={styles.featureCard}>
                        <h3>Capability Registry</h3>
                        <p>
                            Publish and discover capabilities with automatic
                            pricing, versioning and trust metadata.
                        </p>
                    </div>
                    <div style={styles.featureCard}>
                        <h3>Policy Engine</h3>
                        <p>
                            Define spending limits, trust requirements, and
                            access policies that are enforced automatically.
                        </p>
                    </div>
                    <div style={styles.featureCard}>
                        <h3>Payment Abstraction</h3>
                        <p>
                            x402 integration handles all payment negotiation,
                            authorization and settlement transparently.
                        </p>
                    </div>
                    <div style={styles.featureCard}>
                        <h3>Observability</h3>
                        <p>
                            Full execution tracing with cost attribution,
                            performance metrics and audit logging.
                        </p>
                    </div>
                </div>
            </div>

            {/* COMMUNITY */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Community</h1>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Join the growing community of developers and autonomous
                    systems building on Pinion.
                </p>
                <br />
                <div style={styles.socialLinks}>
                    <a
                        href="https://x.com/PinionOS"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialLink}
                    >
                        <div style={styles.socialCard}>
                            <h3>X / Twitter</h3>
                            <p>@PinionOS</p>
                        </div>
                    </a>
                    <div style={styles.socialCard}>
                        <h3>Discord</h3>
                        <p>Coming soon</p>
                    </div>
                    <div style={styles.socialCard}>
                        <h3>GitHub</h3>
                        <p>Coming soon</p>
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
    featureGrid: {
        flexDirection: 'column',
    },
    featureCard: {
        padding: 16,
        marginBottom: 12,
        border: '1px solid #ccc',
        flexDirection: 'column',
        backgroundColor: '#f8f8f8',
    },
    socialLinks: {
        flexDirection: 'column',
    },
    socialLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    socialCard: {
        padding: 16,
        marginBottom: 12,
        border: '1px solid #ccc',
        flexDirection: 'column',
        backgroundColor: '#f8f8f8',
        cursor: 'pointer',
    },
};

export default Developers;
