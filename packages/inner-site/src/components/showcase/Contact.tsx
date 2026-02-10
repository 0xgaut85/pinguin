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
                        <h3>Build with Pinion &amp; x402</h3>
                    </div>
                </div>
            </div>

            {/* GETTING STARTED */}
            <div className="text-block">
                <h2>Getting Started</h2>
                <br />
                <p>
                    Pinion exposes on-chain intelligence and AI skills as
                    paywalled HTTP endpoints on <b>Base mainnet</b>.
                    Every call costs <b>$0.01 USDC</b> and is gated via
                    the <b>x402</b> protocol. No API keys, no
                    subscriptions. Just a wallet signature per request.
                </p>
                <br />
                <p>
                    The server uses{' '}
                    <b>x402-express</b> middleware to enforce payments.
                    Clients receive a <code style={styles.inlineCode}>402 Payment Required</code>{' '}
                    response, sign an EIP-3009 <code style={styles.inlineCode}>TransferWithAuthorization</code>,
                    and retry with the <code style={styles.inlineCode}>X-PAYMENT</code> header.
                    The facilitator verifies the payment on-chain and forwards the
                    request to the endpoint.
                </p>
            </div>

            {/* LIVE ENDPOINTS */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Live Endpoints</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    All endpoints are live at{' '}
                    <code style={styles.inlineCode}>https://pinionos.com/skill/</code>.
                    Browse the free catalog at{' '}
                    <a href="https://pinionos.com/skill/catalog" target="_blank" rel="noopener noreferrer" style={styles.link}>
                        /skill/catalog
                    </a>.
                </p>
                <br />
                <div style={styles.endpointTable}>
                    <div style={styles.endpointHeader}>
                        <span style={{ ...styles.endpointCell, flex: 2.5 }}>Endpoint</span>
                        <span style={{ ...styles.endpointCell, flex: 0.7 }}>Method</span>
                        <span style={{ ...styles.endpointCell, flex: 0.7 }}>Price</span>
                        <span style={{ ...styles.endpointCell, flex: 3 }}>Description</span>
                    </div>
                    {[
                        { path: '/skill/balance/:address', method: 'GET', desc: 'ETH + USDC balances for any Base address' },
                        { path: '/skill/tx/:hash', method: 'GET', desc: 'Decoded transaction details for any Base tx' },
                        { path: '/skill/price/:token', method: 'GET', desc: 'Current USD price for ETH or other tokens' },
                        { path: '/skill/wallet/generate', method: 'GET', desc: 'Generate a fresh Base wallet keypair' },
                        { path: '/skill/chat', method: 'POST', desc: 'Chat with the Pinion AI Agent' },
                    ].map((ep, i) => (
                        <div key={i} style={i % 2 === 0 ? styles.endpointRow : styles.endpointRowAlt}>
                            <code style={{ ...styles.endpointCell, flex: 2.5, fontSize: 10, color: '#00ff88' }}>{ep.path}</code>
                            <span style={{ ...styles.endpointCell, flex: 0.7 }}>{ep.method}</span>
                            <span style={{ ...styles.endpointCell, flex: 0.7 }}>$0.01</span>
                            <span style={{ ...styles.endpointCell, flex: 3 }}>{ep.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SERVER EXAMPLE */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h2>Server: x402-express</h2>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Protect any Express route with a single middleware call.
                    The facilitator handles on-chain USDC settlement.
                </p>
                <br />
                <pre style={styles.codeBlock}>
{`const express = require('express');
const { paymentMiddleware } = require('x402-express');

const app = express();

const payTo   = '0x101C...0acf';       // your USDC receive address
const network = 'base';

app.use(
  paymentMiddleware(
    payTo,
    {
      'GET /balance/[address]': {
        price: '$0.01', network,
        config: { description: 'ETH + USDC balances' },
      },
      'GET /wallet/generate': {
        price: '$0.01', network,
        config: { description: 'Generate a Base keypair' },
      },
    },
    { url: 'https://x402.org/facilitator' },
  )
);

app.get('/balance/:address', async (req, res) => {
  // x402 payment already verified at this point
  const balance = await getBalance(req.params.address);
  res.json(balance);
});`}
                </pre>
            </div>

            {/* CLIENT EXAMPLE */}
            <div className="text-block">
                <h2>Client: x402 Payment Flow</h2>
                <br />
                <pre style={styles.codeBlock}>
{`// 1. Make the initial request
const res = await fetch(
  'https://pinionos.com/skill/balance/0x...'
);

if (res.status === 402) {
  // 2. Parse payment requirements from response
  const requirements = await res.json();
  const { payTo, maxAmountRequired, asset } = requirements;

  // 3. Sign EIP-3009 TransferWithAuthorization
  const sig = await ethereum.request({
    method: 'eth_signTypedData_v4',
    params: [walletAddress, typedData],
  });

  // 4. Retry with X-PAYMENT header
  const paid = await fetch(
    'https://pinionos.com/skill/balance/0x...', {
      headers: {
        'X-PAYMENT': btoa(JSON.stringify({
          x402Version: 1,
          scheme: 'exact',
          network: 'base',
          payload: { signature: sig, authorization },
        })),
      },
    }
  );

  const data = await paid.json();
  // { eth: "0.042", usdc: "12.50" }
}`}
                </pre>
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
                    <a
                        href="https://www.x402scan.com/server/49a688db-0234-4609-948c-c3eee1719e5d"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialLink}
                    >
                        <div style={styles.socialCard}>
                            <h3>x402scan Server</h3>
                            <p>View live endpoint stats</p>
                        </div>
                    </a>
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
    inlineCode: {
        fontFamily: 'monospace',
        fontSize: 11,
        backgroundColor: '#1a1a1a',
        color: '#00ff88',
        padding: '1px 5px',
        border: '1px solid #333',
    },
    link: {
        color: '#E8530E',
        textDecoration: 'underline',
    },
    endpointTable: {
        flexDirection: 'column',
        border: '1px solid #ccc',
        width: '100%',
        overflow: 'auto',
    },
    endpointHeader: {
        display: 'flex',
        backgroundColor: '#222',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    endpointRow: {
        display: 'flex',
        backgroundColor: '#f8f8f8',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    endpointRowAlt: {
        display: 'flex',
        backgroundColor: '#eee',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    endpointCell: {
        padding: '8px 10px',
        borderRight: '1px solid #ccc',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
