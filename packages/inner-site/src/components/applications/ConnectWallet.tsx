import React, { useCallback, useEffect, useState } from 'react';
import Window from '../os/Window';

export interface ConnectWalletProps extends WindowAppProps {
    onWalletChange?: (address: string | null) => void;
}

const BASE_CHAIN_ID = '0x2105'; // 8453
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Minimal ERC-20 balanceOf ABI encoded: balanceOf(address)
const encodeBalanceOf = (address: string): string => {
    const clean = address.toLowerCase().replace('0x', '').padStart(64, '0');
    return '0x70a08231' + clean;
};

const formatEth = (weiHex: string): string => {
    const wei = BigInt(weiHex);
    const eth = Number(wei) / 1e18;
    if (eth === 0) return '0';
    if (eth < 0.0001) return '<0.0001';
    return eth.toFixed(4);
};

const formatUsdc = (rawHex: string): string => {
    // USDC has 6 decimals
    const raw = BigInt(rawHex);
    const usdc = Number(raw) / 1e6;
    if (usdc === 0) return '0';
    if (usdc < 0.01) return '<0.01';
    return usdc.toFixed(2);
};

const truncateAddress = (addr: string): string => {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
};

const ConnectWallet: React.FC<ConnectWalletProps> = (props) => {
    const [address, setAddress] = useState<string | null>(null);
    const [ethBalance, setEthBalance] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [chainId, setChainId] = useState<string | null>(null);

    const getProvider = (): any => {
        return (window as any).ethereum;
    };

    const fetchBalances = useCallback(async (addr: string) => {
        const provider = getProvider();
        if (!provider) return;

        try {
            // ETH balance
            const ethHex = await provider.request({
                method: 'eth_getBalance',
                params: [addr, 'latest'],
            });
            setEthBalance(formatEth(ethHex));

            // USDC balance via ERC-20 balanceOf
            const usdcHex = await provider.request({
                method: 'eth_call',
                params: [
                    {
                        to: USDC_ADDRESS,
                        data: encodeBalanceOf(addr),
                    },
                    'latest',
                ],
            });
            setUsdcBalance(formatUsdc(usdcHex));
        } catch (err: any) {
            console.error('balance fetch error:', err);
        }
    }, []);

    const switchToBase = useCallback(async () => {
        const provider = getProvider();
        if (!provider) return;

        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BASE_CHAIN_ID }],
            });
        } catch (switchError: any) {
            // Chain not added - try adding it
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: BASE_CHAIN_ID,
                                chainName: 'Base',
                                nativeCurrency: {
                                    name: 'Ether',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://mainnet.base.org'],
                                blockExplorerUrls: ['https://basescan.org'],
                            },
                        ],
                    });
                } catch (addError: any) {
                    setError('failed to add Base network');
                }
            }
        }
    }, []);

    const connect = useCallback(async () => {
        const provider = getProvider();
        if (!provider) {
            setError('no wallet detected. install metamask or rabby.');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const accounts: string[] = await provider.request({
                method: 'eth_requestAccounts',
            });

            if (accounts.length > 0) {
                const addr = accounts[0];
                setAddress(addr);
                props.onWalletChange?.(addr);

                // Switch to Base
                await switchToBase();

                // Get current chain
                const currentChain = await provider.request({
                    method: 'eth_chainId',
                });
                setChainId(currentChain);

                // Fetch balances
                await fetchBalances(addr);
            }
        } catch (err: any) {
            if (err.code === 4001) {
                setError('connection rejected by user');
            } else {
                setError(err.message || 'connection failed');
            }
        } finally {
            setIsConnecting(false);
        }
    }, [switchToBase, fetchBalances, props]);

    const disconnect = useCallback(() => {
        setAddress(null);
        setEthBalance(null);
        setUsdcBalance(null);
        setChainId(null);
        setError(null);
        props.onWalletChange?.(null);
    }, [props]);

    const refreshBalances = useCallback(() => {
        if (address) {
            fetchBalances(address);
        }
    }, [address, fetchBalances]);

    // Listen for account and chain changes
    useEffect(() => {
        const provider = getProvider();
        if (!provider) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnect();
            } else {
                const addr = accounts[0];
                setAddress(addr);
                props.onWalletChange?.(addr);
                fetchBalances(addr);
            }
        };

        const handleChainChanged = (newChainId: string) => {
            setChainId(newChainId);
            if (address) {
                fetchBalances(address);
            }
        };

        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);

        return () => {
            provider.removeListener('accountsChanged', handleAccountsChanged);
            provider.removeListener('chainChanged', handleChainChanged);
        };
    }, [address, disconnect, fetchBalances, props]);

    const isOnBase = chainId === BASE_CHAIN_ID;

    return (
        <Window
            top={80}
            left={180}
            width={420}
            height={360}
            windowTitle="Connect Wallet"
            windowBarIcon="walletIcon"
            windowBarColor="#0d0d0d"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'Wallet v1.0'}
        >
            <div style={styles.container}>
                {!address ? (
                    // Not connected state
                    <div style={styles.disconnectedContainer}>
                        <div style={styles.walletArt}>
                            <span style={styles.walletEmoji}>{'{ }'}</span>
                        </div>
                        <p style={styles.statusText}>no wallet connected</p>
                        <p style={styles.subtitleText}>
                            connect metamask, rabby, coinbase wallet or any eip-1193 provider
                        </p>

                        <div
                            onMouseDown={isConnecting ? undefined : connect}
                            style={Object.assign(
                                {},
                                styles.connectButton,
                                isConnecting && styles.buttonDisabled
                            )}
                        >
                            <span style={styles.connectButtonText}>
                                {isConnecting ? 'connecting...' : 'connect wallet'}
                            </span>
                        </div>

                        {error && (
                            <p style={styles.errorText}>[error] {error}</p>
                        )}
                    </div>
                ) : (
                    // Connected state
                    <div style={styles.connectedContainer}>
                        {/* Address */}
                        <div style={styles.addressRow}>
                            <span style={styles.addressLabel}>address</span>
                            <span style={styles.addressValue}>
                                {truncateAddress(address)}
                            </span>
                        </div>

                        {/* Network */}
                        <div style={styles.networkRow}>
                            <span style={styles.networkLabel}>network</span>
                            <span
                                style={Object.assign(
                                    {},
                                    styles.networkValue,
                                    isOnBase
                                        ? styles.networkOnBase
                                        : styles.networkNotBase
                                )}
                            >
                                {isOnBase ? 'base' : `chain ${parseInt(chainId || '0', 16)}`}
                            </span>
                            {!isOnBase && (
                                <div
                                    onMouseDown={switchToBase}
                                    style={styles.switchButton}
                                >
                                    <span style={styles.switchButtonText}>
                                        switch to base
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div style={styles.divider} />

                        {/* ETH Balance */}
                        <div style={styles.balanceRow}>
                            <span style={styles.balanceLabel}>ETH</span>
                            <span style={styles.balanceValue}>
                                {ethBalance !== null ? ethBalance : '...'}
                            </span>
                        </div>

                        {/* USDC Balance */}
                        <div style={styles.balanceRow}>
                            <span style={styles.balanceLabel}>USDC</span>
                            <span style={styles.balanceValue}>
                                {usdcBalance !== null ? usdcBalance : '...'}
                            </span>
                        </div>

                        {/* Divider */}
                        <div style={styles.divider} />

                        {/* Actions */}
                        <div style={styles.actionsRow}>
                            <div
                                onMouseDown={refreshBalances}
                                style={styles.actionButton}
                            >
                                <span style={styles.actionButtonText}>
                                    refresh
                                </span>
                            </div>
                            <div
                                onMouseDown={disconnect}
                                style={styles.disconnectButton}
                            >
                                <span style={styles.disconnectButtonText}>
                                    disconnect
                                </span>
                            </div>
                        </div>

                        {error && (
                            <p style={styles.errorText}>[error] {error}</p>
                        )}
                    </div>
                )}
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 16,
    },
    disconnectedContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletArt: {
        marginBottom: 16,
    },
    walletEmoji: {
        fontSize: 36,
        fontFamily: 'monospace',
        color: '#E8530E',
    },
    statusText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#f0f0f0',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 1.5,
    },
    connectButton: {
        padding: '10px 28px',
        border: '1px solid #E8530E',
        cursor: 'pointer',
        backgroundColor: '#E8530E',
    },
    connectButtonText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'default',
    },
    errorText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#ff4444',
        marginTop: 12,
        textAlign: 'center',
    },
    connectedContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    addressValue: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#E8530E',
        letterSpacing: 0.5,
    },
    networkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    networkLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginRight: 8,
    },
    networkValue: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
    networkOnBase: {
        color: '#00ff88',
    },
    networkNotBase: {
        color: '#ffaa00',
    },
    switchButton: {
        padding: '2px 8px',
        border: '1px solid #E8530E',
        cursor: 'pointer',
        marginLeft: 8,
    },
    switchButtonText: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#E8530E',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#222',
        marginTop: 8,
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingLeft: 4,
        paddingRight: 4,
    },
    balanceLabel: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: '#888',
        fontWeight: 'bold',
    },
    balanceValue: {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#f0f0f0',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    actionButton: {
        padding: '6px 16px',
        border: '1px solid #444',
        cursor: 'pointer',
    },
    actionButtonText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    disconnectButton: {
        padding: '6px 16px',
        border: '1px solid #ff4444',
        cursor: 'pointer',
    },
    disconnectButtonText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#ff4444',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
};

export default ConnectWallet;
