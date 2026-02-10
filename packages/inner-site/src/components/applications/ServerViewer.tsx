import React, { useState } from 'react';
import Window from '../os/Window';

export interface ServerViewerProps extends WindowAppProps {}

const X402SCAN_URL =
    'https://www.x402scan.com/server/49a688db-0234-4609-948c-c3eee1719e5d';

const ServerViewer: React.FC<ServerViewerProps> = (props) => {
    const [iframeError, setIframeError] = useState(false);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);

    return (
        <Window
            top={30}
            left={80}
            width={width}
            height={height}
            windowTitle="x402scan — Pinion Server"
            windowBarIcon="windowServerIcon"
            windowBarColor="#0d0d0d"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            bottomLeftText="x402scan.com"
        >
            <div style={styles.container}>
                {iframeError ? (
                    <div style={styles.fallback}>
                        <p style={styles.fallbackTitle}>
                            x402scan blocked iframe embedding
                        </p>
                        <a
                            href={X402SCAN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fallbackLink}
                        >
                            open in browser →
                        </a>
                    </div>
                ) : (
                    <iframe
                        src={X402SCAN_URL}
                        title="x402scan Pinion Server"
                        width="100%"
                        height="100%"
                        style={styles.iframe}
                        onError={() => setIframeError(true)}
                    />
                )}
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        overflow: 'hidden',
    },
    iframe: {
        border: 'none',
        flex: 1,
    },
    fallback: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    fallbackTitle: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#ccc',
    },
    fallbackLink: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#00ff88',
        textDecoration: 'underline',
        cursor: 'pointer',
    },
};

export default ServerViewer;
