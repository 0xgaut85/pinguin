import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export interface IntegrationsProps {}

interface IntegrationBoxProps {
    title: string;
    subtitle: string;
    description: string;
    route: string;
    badge: string;
}

const IntegrationBox: React.FC<IntegrationBoxProps> = ({
    title,
    subtitle,
    description,
    route,
    badge,
}) => {
    const [, setIsHovering] = useState(false);
    const navigation = useNavigate();

    const handleClick = () => {
        navigation(`/integrations/${route}`);
    };

    return (
        <div
            onMouseDown={handleClick}
            className="big-button-container"
            style={styles.integrationLink}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div style={styles.integrationLinkLeft}>
                <div style={styles.badge}>
                    <span style={styles.badgeText}>{badge}</span>
                </div>
                <div style={styles.integrationText}>
                    <h1 style={{ fontSize: 36 }}>{title}</h1>
                    <h3>{subtitle}</h3>
                </div>
            </div>
            <div style={styles.integrationDescription}>
                <p style={styles.descriptionText}>{description}</p>
            </div>
        </div>
    );
};

const Integrations: React.FC<IntegrationsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Integrations</h1>
            <h3>Core Protocol Dependencies</h3>
            <br />
            <p>
                Pinion is designed to integrate deeply with existing protocols
                and standards. Each integration below represents a critical
                component of the economic execution stack. Click on any to learn
                more.
            </p>
            <br />
            <div style={styles.integrationLinksContainer}>
                <IntegrationBox
                    badge="EXECUTION"
                    title="OpenClaw"
                    subtitle="AGENT RUNTIME"
                    description="Skill-as-a-service execution environments for autonomous agents. Pinion enables payment-aware capability invocation within OpenClaw runtimes."
                    route="openclaw"
                />
                <IntegrationBox
                    badge="PAYMENT"
                    title="x402"
                    subtitle="HTTP PAYMENT STANDARD"
                    description="The HTTP 402 Payment Required protocol for machine-to-machine payments. Native value exchange embedded in every HTTP request."
                    route="x402"
                />
                <IntegrationBox
                    badge="IDENTITY"
                    title="ERC-8004"
                    subtitle="TRUST REGISTRY"
                    description="Decentralized identity and trust scoring for autonomous agents. Verifiable credentials that machines can evaluate at runtime."
                    route="erc8004"
                />
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    integrationLinksContainer: {
        flexDirection: 'column',
        width: '100%',
        display: 'flex',
        flex: 1,
    },
    integrationLink: {
        marginBottom: 24,
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        flexDirection: 'column',
        padding: 0,
    },
    integrationText: {
        justifyContent: 'center',
        flexDirection: 'column',
    },
    integrationLinkLeft: {
        marginLeft: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#E8530E',
        padding: '4px 10px',
        marginRight: 16,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    integrationDescription: {
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 13,
        lineHeight: 1.5,
        color: '#666',
    },
};

export default Integrations;
