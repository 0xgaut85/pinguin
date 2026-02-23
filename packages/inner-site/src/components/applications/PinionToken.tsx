import React, { useState } from 'react';
import Window from '../os/Window';

export interface PinionTokenProps extends WindowAppProps {}

const CLANKER_URL =
    'https://clanker.world/clanker/0x4609f25450b1732D7Ec63ebF3E39f8fAbb7A5B07';

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
            windowTitle="$Pinion — Clanker"
            windowBarIcon="pinionTokenIcon"
            windowBarColor="#0d0d0d"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            bottomLeftText="clanker.world"
        >
            <div style={styles.container}>
                {iframeError ? (
                    <div style={styles.fallback}>
                        <p style={styles.fallbackTitle}>
                            Clanker blocked iframe embedding
                        </p>
                        <a
                            href={CLANKER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fallbackLink}
                        >
                            open in browser →
                        </a>
                    </div>
                ) : (
                    <iframe
                        src={CLANKER_URL}
                        title="$Pinion on Clanker"
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
