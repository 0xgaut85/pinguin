import React, { useEffect, useState, useCallback, useRef } from 'react';
import Window from '../os/Window';

export interface PinionAgentProps extends WindowAppProps {}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:3001';

const PinionAgent: React.FC<PinionAgentProps> = (props) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content:
                'hey! im the pinion agent. ask me anything about the protocol, how x402 works, openclaw integration, erc-8004 identity stuff... whatever you wanna know 🤙',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop =
                containerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const sendMessage = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: trimmed };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if (!res.ok) {
                throw new Error(`server returned ${res.status}`);
            }

            const data = await res.json();
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: any) {
            setError(
                err.message || 'failed to reach the agent'
            );
        } finally {
            setIsLoading(false);
        }
    }, [input, messages, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Window
            top={40}
            left={100}
            width={600}
            height={500}
            windowTitle="Pinion Agent"
            windowBarIcon="agentIcon"
            windowBarColor="#0d0d0d"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'Pinion Agent v1.0'}
        >
            <div style={styles.container}>
                {/* Messages area */}
                <div ref={containerRef} style={styles.messagesArea}>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={Object.assign(
                                {},
                                styles.messageRow,
                                msg.role === 'user'
                                    ? styles.userRow
                                    : styles.agentRow
                            )}
                        >
                            <span
                                style={
                                    msg.role === 'user'
                                        ? styles.userLabel
                                        : styles.agentLabel
                                }
                            >
                                {msg.role === 'user' ? 'you' : 'agent'}
                            </span>
                            <span
                                style={
                                    msg.role === 'user'
                                        ? styles.userText
                                        : styles.agentText
                                }
                            >
                                {msg.content}
                            </span>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div style={Object.assign({}, styles.messageRow, styles.agentRow)}>
                            <span style={styles.agentLabel}>agent</span>
                            <span style={styles.typingIndicator}>
                                thinking
                                <span className="typing-dots">...</span>
                            </span>
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div style={styles.errorRow}>
                            <span style={styles.errorText}>
                                [error] {error}
                            </span>
                        </div>
                    )}
                </div>

                {/* Input area */}
                <div style={styles.inputArea}>
                    <span style={styles.prompt}>{'>'}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ask me anything about pinion..."
                        style={styles.input}
                        disabled={isLoading}
                    />
                    <div
                        onMouseDown={sendMessage}
                        style={Object.assign(
                            {},
                            styles.sendButton,
                            isLoading && styles.sendButtonDisabled
                        )}
                    >
                        <span style={styles.sendText}>send</span>
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
    messagesArea: {
        flex: 1,
        padding: 12,
        overflowY: 'auto',
        flexDirection: 'column',
        gap: 8,
    },
    messageRow: {
        flexDirection: 'column',
        marginBottom: 12,
    },
    userRow: {},
    agentRow: {},
    userLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00ff88',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    agentLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#E8530E',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    userText: {
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.6,
        color: '#d0d0d0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    agentText: {
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.6,
        color: '#f0f0f0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    typingIndicator: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#E8530E',
        fontStyle: 'italic',
    },
    errorRow: {
        marginBottom: 8,
    },
    errorText: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#ff4444',
    },
    inputArea: {
        borderTop: '1px solid #333',
        padding: '8px 12px',
        alignItems: 'center',
        flexShrink: 0,
    },
    prompt: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#E8530E',
        marginRight: 8,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#d0d0d0',
        padding: '6px 0',
    },
    sendButton: {
        padding: '4px 14px',
        border: '1px solid #E8530E',
        cursor: 'pointer',
        marginLeft: 8,
        flexShrink: 0,
    },
    sendButtonDisabled: {
        opacity: 0.4,
        cursor: 'default',
    },
    sendText: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#E8530E',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
};

export default PinionAgent;
