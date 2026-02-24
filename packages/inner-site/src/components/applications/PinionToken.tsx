import React, { useState } from 'react';
import Window from '../os/Window';

export interface PinionTokenProps extends WindowAppProps {}

const DEXSCREENER_URL =
    'https://dexscreener.com/solana/8h7wetdnk7nra2hzx6bnztet9q5uujp7y4qs938drjal';

const PinionToken: React.FC<PinionTokenProps> = (props) => {
    const [iframeError, setIframeError] = useState(false);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);

    return (
        <Window
            top={50}
            left={120}
            width={width}
            height={height}
            windowTitle="$Pinion — DEX Screener"
            windowBarIcon="pinionTokenIcon"
            windowBarColor="#0d0d0d"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            bottomLeftText="dexscreener.com"
        >
            <div style={styles.container}>
                {iframeError ? (
                    <div style={styles.fallback}>
                        <p style={styles.fallbackTitle}>
                            DEX Screener blocked iframe embedding
                        </p>
                        <a
                            href={DEXSCREENER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fallbackLink}
                        >
                            open in browser →
                        </a>
                    </div>
                ) : (
                    <iframe
                        src={DEXSCREENER_URL}
                        title="$Pinion on DEX Screener"
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

export default PinionToken;
