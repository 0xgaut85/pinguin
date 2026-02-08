import React from 'react';
import ResumeDownload from './ResumeDownload';

export interface OverviewProps {}

const Overview: React.FC<OverviewProps> = (props) => {
    return (
        <div className="site-page-content">
            {/* ABSTRACT */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Overview</h1>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Software is evolving from passive infrastructure into
                    autonomous execution systems that plan tasks, discover
                    capabilities, execute workflows and complete outcomes
                    without continuous human direction.
                </p>
                <br />
                <p>
                    Despite this shift, one essential primitive is still missing
                    from the global internet stack:{' '}
                    <b>
                        a native way for software to exchange value at the
                        moment of execution.
                    </b>
                </p>
                <br />
                <p>
                    Pinion introduces a global operating primitive that allows
                    machines to discover priced capabilities, authorize payment,
                    programmatically invoke execution and continue workflows
                    in a single uninterrupted transaction cycle.
                </p>
            </div>

            {/* GLOBAL INFRASTRUCTURE SHIFT */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>The Shift</h1>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>A Global Infrastructure Evolution</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    The internet was originally built for static publishing,
                    then evolved into interactive services, then became
                    programmable infrastructure. Today we are entering an era
                    defined by autonomous systems that coordinate compute
                    resources, manage operations and perform complex workflows
                    without human supervision.
                </p>
                <br />
                <p>
                    These systems already interact through APIs, message queues,
                    distributed runtimes and container orchestration frameworks.
                    However, when one system requires a capability owned by
                    another, the interaction still depends on manual contracts,
                    static credentials, or subscription billing models.
                </p>
                <br />
                <p>
                    This gap prevents the emergence of a true machine-native
                    economic layer where systems can dynamically purchase
                    execution capability at runtime.
                </p>
                <br />
                <p>
                    <b>
                        Pinion addresses this limitation by embedding
                        payment-aware execution into the core capability
                        invocation path of software infrastructure.
                    </b>
                </p>
            </div>

            {/* ECONOMIC EXECUTION */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Economic Execution</h1>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>The Core Concept</h3>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Pinion defines a model called{' '}
                    <b>economic execution</b>. In this model, the invocation of
                    a capability includes three atomic actions:
                </p>
                <br />
                <div style={styles.atomicAction}>
                    <div style={styles.actionNumber}>
                        <h3>01</h3>
                    </div>
                    <div style={styles.actionContent}>
                        <h3>Capability Request</h3>
                        <p>
                            A system or agent issues a request for a specific
                            capability: discovering priced endpoints, required
                            parameters and trust requirements.
                        </p>
                    </div>
                </div>
                <div style={styles.atomicAction}>
                    <div style={styles.actionNumber}>
                        <h3>02</h3>
                    </div>
                    <div style={styles.actionContent}>
                        <h3>Payment Authorization</h3>
                        <p>
                            Payment authorization is generated automatically
                            based on execution policy. Spending limits, trust
                            scores and budget constraints are evaluated
                            in-line.
                        </p>
                    </div>
                </div>
                <div style={styles.atomicAction}>
                    <div style={styles.actionNumber}>
                        <h3>03</h3>
                    </div>
                    <div style={styles.actionContent}>
                        <h3>Capability Execution</h3>
                        <p>
                            The capability is invoked, executed and the result
                            is returned within the same transaction
                            context. No separate billing cycle, no manual
                            reconciliation.
                        </p>
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
    atomicAction: {
        marginBottom: 24,
        padding: 16,
        border: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
    },
    actionNumber: {
        marginRight: 16,
        minWidth: 40,
        color: '#E8530E',
    },
    actionContent: {
        flexDirection: 'column',
        flex: 1,
    },
};

export default Overview;
