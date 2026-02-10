import React, { useCallback, useEffect, useState, useRef } from 'react';
import Window from '../os/Window';
import { signX402Payment, getApiBase, PaymentRequirements } from '../../utils/x402';

export interface OpenClawGatewayProps extends WindowAppProps {}

// ── Types ────────────────────────────────────────────
interface SkillEndpoint {
    endpoint: string;
    method: string;
    price: string;
    currency: string;
    network: string;
    description: string;
    example: string;
}

interface TxLogEntry {
    id: number;
    skill: string;
    param: string;
    cost: string;
    status: 'pending' | 'success' | 'error';
    result?: any;
    error?: string;
    timestamp: number;
}

// ── Component ────────────────────────────────────────
const OpenClawGateway: React.FC<OpenClawGatewayProps> = (props) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [catalog, setCatalog] = useState<SkillEndpoint[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<number>(0);
    const [paramValue, setParamValue] = useState('');
    const [txLog, setTxLog] = useState<TxLogEntry[]>([]);
    const [isInvoking, setIsInvoking] = useState(false);
    const [catalogError, setCatalogError] = useState<string | null>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(1);

    // Detect connected wallet (self-managing, no prop needed)
    useEffect(() => {
        const provider = (window as any).ethereum;
        if (!provider) return;

        // Check if already connected
        provider.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
            if (accounts.length > 0) setWalletAddress(accounts[0]);
        }).catch(() => {});

        const handleAccountsChanged = (accounts: string[]) => {
            setWalletAddress(accounts.length > 0 ? accounts[0] : null);
        };
        provider.on('accountsChanged', handleAccountsChanged);
        return () => {
            provider.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

    // Fetch skill catalog on mount
    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await fetch(`${getApiBase()}/skill/catalog`);
                const data = await res.json();
                setCatalog(data.skills || []);
            } catch (err: any) {
                setCatalogError('failed to load skill catalog');
                console.error('Catalog fetch error:', err);
            }
        };
        fetchCatalog();
    }, []);

    // Auto-scroll log
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [txLog]);

    // Set default param when skill changes
    useEffect(() => {
        if (catalog[selectedSkill]) {
            const example = catalog[selectedSkill].example;
            // Extract the param from the example URL
            const parts = example.split('/');
            setParamValue(parts[parts.length - 1] || '');
        }
    }, [selectedSkill, catalog]);

    const addLogEntry = useCallback((entry: Omit<TxLogEntry, 'id' | 'timestamp'>) => {
        const newEntry: TxLogEntry = {
            ...entry,
            id: nextId.current++,
            timestamp: Date.now(),
        };
        setTxLog(prev => [...prev, newEntry]);
        return newEntry.id;
    }, []);

    const updateLogEntry = useCallback((id: number, updates: Partial<TxLogEntry>) => {
        setTxLog(prev => prev.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
        ));
    }, []);

    // Check if selected skill requires a parameter
    const skillHasParam = useCallback(() => {
        if (!catalog[selectedSkill]) return false;
        const ep = catalog[selectedSkill].endpoint;
        return ep.includes(':');
    }, [catalog, selectedSkill]);

    const invokeSkill = useCallback(async () => {
        if (!walletAddress) return;
        if (!catalog[selectedSkill]) return;
        if (skillHasParam() && !paramValue.trim()) return;

        const skill = catalog[selectedSkill];
        const provider = (window as any).ethereum;
        if (!provider) return;

        setIsInvoking(true);
        const skillName = skill.endpoint.split('/').filter(Boolean).pop()?.replace(':', '') || 'unknown';
        const logId = addLogEntry({
            skill: skillName,
            param: skillHasParam() ? (paramValue.length > 12 ? paramValue.slice(0, 6) + '...' + paramValue.slice(-4) : paramValue) : '—',
            cost: skill.price,
            status: 'pending',
        });

        try {
            // Step 1: Call the endpoint (will get 402)
            const endpoint = skill.endpoint.replace(/:address|:hash|:token/, paramValue);
            const url = `${getApiBase()}${endpoint}`;

            const initialRes = await fetch(url, {
                headers: { 'Accept': 'application/json' },
            });

            if (initialRes.status !== 402) {
                // Shouldn't happen, but handle gracefully
                if (initialRes.ok) {
                    const data = await initialRes.json();
                    updateLogEntry(logId, { status: 'success', result: data });
                    setIsInvoking(false);
                    return;
                }
                const errData = await initialRes.json().catch(() => ({ error: 'unknown' }));
                updateLogEntry(logId, { status: 'error', error: errData.error || `HTTP ${initialRes.status}` });
                setIsInvoking(false);
                return;
            }

            // Step 2: Parse 402 payment requirements
            const paymentData = await initialRes.json();
            const { x402Version, accepts } = paymentData;

            if (!accepts || accepts.length === 0) {
                updateLogEntry(logId, { status: 'error', error: 'no payment requirements returned' });
                setIsInvoking(false);
                return;
            }

            // Select the first matching requirement (Base network)
            const requirement: PaymentRequirements = accepts[0];

            // Step 3: Sign x402 payment using wallet
            const paymentHeader = await signX402Payment(
                provider,
                walletAddress,
                requirement,
                x402Version
            );

            // Step 4: Retry with X-PAYMENT header
            const paidRes = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-PAYMENT': paymentHeader,
                    'Access-Control-Expose-Headers': 'X-PAYMENT-RESPONSE',
                },
            });

            if (paidRes.ok) {
                const data = await paidRes.json();
                updateLogEntry(logId, { status: 'success', result: data });
            } else {
                const errData = await paidRes.json().catch(() => ({ error: 'unknown' }));
                updateLogEntry(logId, {
                    status: 'error',
                    error: errData.error || errData.invalidReason || `HTTP ${paidRes.status}`,
                });
            }
        } catch (err: any) {
            console.error('Invoke error:', err);
            updateLogEntry(logId, {
                status: 'error',
                error: err.message?.includes('User denied') ? 'payment rejected by user' : (err.message || 'invoke failed'),
            });
        } finally {
            setIsInvoking(false);
        }
    }, [walletAddress, catalog, selectedSkill, paramValue, addLogEntry, updateLogEntry, skillHasParam]);

    const totalSpent = txLog
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + parseFloat(t.cost.replace('$', '')), 0);

    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <Window
            top={60}
            left={200}
            width={560}
            height={520}
            windowTitle="OpenClaw Gateway"
            windowBarIcon="windowOpenclawIcon"
            windowBarColor="#0d0d0d"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={`x402 on Base | spent: $${totalSpent.toFixed(3)}`}
        >
            <div style={styles.container}>
                {/* ─── Skill Catalog ─── */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>skill catalog</span>
                        <span style={styles.sectionBadge}>x402</span>
                    </div>
                    {catalogError ? (
                        <p style={styles.errorText}>{catalogError}</p>
                    ) : catalog.length === 0 ? (
                        <p style={styles.loadingText}>loading skills...</p>
                    ) : (
                        <div style={styles.catalogList}>
                            {catalog.map((skill, i) => (
                                <div
                                    key={skill.endpoint}
                                    style={Object.assign(
                                        {},
                                        styles.catalogItem,
                                        i === selectedSkill && styles.catalogItemSelected
                                    )}
                                    onMouseDown={() => setSelectedSkill(i)}
                                >
                                    <div style={styles.catalogItemLeft}>
                                        <span style={styles.catalogMethod}>{skill.method}</span>
                                        <span style={styles.catalogEndpoint}>{skill.endpoint}</span>
                                    </div>
                                    <span style={styles.catalogPrice}>{skill.price}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Invoke Panel ─── */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>invoke</span>
                    </div>
                    {!walletAddress ? (
                        <p style={styles.warningText}>connect wallet first to invoke skills</p>
                    ) : (
                        <div style={styles.invokePanel}>
                            <div style={styles.invokeRow}>
                                {skillHasParam() ? (
                                    <input
                                        type="text"
                                        value={paramValue}
                                        onChange={e => setParamValue(e.target.value)}
                                        placeholder={catalog[selectedSkill]?.endpoint.includes(':address') ? '0x...' : catalog[selectedSkill]?.endpoint.includes(':hash') ? '0x...' : 'ETH'}
                                        style={styles.paramInput}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !isInvoking) invokeSkill();
                                        }}
                                    />
                                ) : (
                                    <span style={styles.noParamText}>no parameters required</span>
                                )}
                                <div
                                    onMouseDown={isInvoking ? undefined : invokeSkill}
                                    style={Object.assign(
                                        {},
                                        styles.invokeButton,
                                        isInvoking && styles.buttonDisabled
                                    )}
                                >
                                    <span style={styles.invokeButtonText}>
                                        {isInvoking ? 'signing...' : `invoke (${catalog[selectedSkill]?.price || '?'})`}
                                    </span>
                                </div>
                            </div>
                            {catalog[selectedSkill] && (
                                <p style={styles.descText}>{catalog[selectedSkill].description}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Transaction Log ─── */}
                <div style={Object.assign({}, styles.section, styles.logSection)}>
                    <div style={styles.sectionHeader}>
                        <span style={styles.sectionTitle}>transaction log</span>
                        <span style={styles.logCount}>{txLog.length} txns</span>
                    </div>
                    <div style={styles.logContainer} ref={logRef}>
                        {txLog.length === 0 ? (
                            <p style={styles.emptyLogText}>no transactions yet. invoke a skill to start.</p>
                        ) : (
                            txLog.map(entry => (
                                <div key={entry.id} style={styles.logEntry}>
                                    <div style={styles.logEntryHeader}>
                                        <span style={styles.logTime}>{formatTime(entry.timestamp)}</span>
                                        <span style={styles.logSkill}>{entry.skill}</span>
                                        <span style={styles.logParam}>{entry.param}</span>
                                        <span style={styles.logCost}>{entry.cost}</span>
                                        <span style={Object.assign(
                                            {},
                                            styles.logStatus,
                                            entry.status === 'success' && styles.logStatusSuccess,
                                            entry.status === 'error' && styles.logStatusError,
                                            entry.status === 'pending' && styles.logStatusPending
                                        )}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    {entry.status === 'success' && entry.result && (
                                        <pre style={styles.logResult}>
                                            {JSON.stringify(entry.result, null, 2)}
                                        </pre>
                                    )}
                                    {entry.status === 'error' && entry.error && (
                                        <p style={styles.logError}>{entry.error}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
    },
    section: {
        flexDirection: 'column',
        borderBottom: '1px solid #222',
        padding: '8px 12px',
    },
    logSection: {
        flex: 1,
        overflow: 'hidden',
        borderBottom: 'none',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    sectionTitle: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionBadge: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#00ff88',
        border: '1px solid #00ff88',
        padding: '1px 6px',
        letterSpacing: 1,
    },
    catalogList: {
        flexDirection: 'column',
        gap: 2,
    },
    catalogItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: 'pointer',
        borderLeft: '2px solid transparent',
    },
    catalogItemSelected: {
        backgroundColor: '#1a1a2e',
        borderLeftColor: '#00ff88',
    },
    catalogItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    catalogMethod: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#00ff88',
        fontWeight: 'bold',
    },
    catalogEndpoint: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#ccc',
    },
    catalogPrice: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#E8530E',
        fontWeight: 'bold',
    },
    invokePanel: {
        flexDirection: 'column',
        gap: 6,
    },
    invokeRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    paramInput: {
        flex: 1,
        backgroundColor: '#111',
        border: '1px solid #333',
        color: '#f0f0f0',
        fontFamily: 'monospace',
        fontSize: 11,
        padding: '6px 8px',
        outline: 'none',
    },
    noParamText: {
        flex: 1,
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#666',
        fontStyle: 'italic',
    },
    invokeButton: {
        padding: '6px 14px',
        backgroundColor: '#E8530E',
        cursor: 'pointer',
        flexShrink: 0,
    },
    invokeButtonText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 1,
        whiteSpace: 'nowrap',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'default',
    },
    descText: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#666',
    },
    warningText: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#ffaa00',
    },
    errorText: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#ff4444',
    },
    loadingText: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#666',
    },
    logCount: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#666',
    },
    logContainer: {
        flex: 1,
        overflow: 'auto',
        flexDirection: 'column',
        gap: 4,
    },
    emptyLogText: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#444',
        textAlign: 'center',
        padding: 20,
    },
    logEntry: {
        flexDirection: 'column',
        padding: '4px 6px',
        borderBottom: '1px solid #1a1a1a',
    },
    logEntryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logTime: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#555',
    },
    logSkill: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ff88',
    },
    logParam: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#888',
        flex: 1,
    },
    logCost: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#E8530E',
    },
    logStatus: {
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    logStatusSuccess: {
        color: '#00ff88',
    },
    logStatusError: {
        color: '#ff4444',
    },
    logStatusPending: {
        color: '#ffaa00',
    },
    logResult: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#aaa',
        backgroundColor: '#111',
        padding: 6,
        marginTop: 4,
        overflow: 'auto',
        maxHeight: 100,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
    logError: {
        fontFamily: 'monospace',
        fontSize: 9,
        color: '#ff4444',
        marginTop: 2,
    },
};

export default OpenClawGateway;
