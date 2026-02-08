import React from 'react';
import { Link } from '../general';
import { useNavigate } from 'react-router';

export interface HomeProps {}

const Home: React.FC<HomeProps> = (props) => {
    const navigate = useNavigate();

    const goToDevelopers = () => {
        navigate('/developers');
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.name}>pinion</h1>
                <h2 style={styles.subtitle}>An operating primitive for</h2>
                <h2 style={styles.subtitle}>paid autonomous software</h2>
            </div>
            <div style={styles.tagline}>
                <p style={styles.taglineText}>
                    Enabling machines to discover, pay for and execute
                    capabilities in a single uninterrupted transaction cycle.
                </p>
            </div>
            <div style={styles.buttons}>
                <Link containerStyle={styles.link} to="overview" text="OVERVIEW" />
                <Link
                    containerStyle={styles.link}
                    to="architecture"
                    text="ARCHITECTURE"
                />
                <Link
                    containerStyle={styles.link}
                    to="integrations"
                    text="INTEGRATIONS"
                />
                <Link
                    containerStyle={styles.link}
                    to="developers"
                    text="DEVELOPERS"
                />
            </div>
            <div style={styles.visionContainer}>
                <p style={styles.visionHighlight}>
                    The execution primitive for machine-to-machine commerce.
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    page: {
        left: 0,
        right: 0,
        top: 0,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        textAlign: 'center',
        marginBottom: 32,
        marginTop: 64,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagline: {
        textAlign: 'center',
        marginBottom: 48,
        maxWidth: 500,
        paddingLeft: 16,
        paddingRight: 16,
    },
    taglineText: {
        fontSize: 14,
        lineHeight: 1.6,
        color: '#666',
    },
    buttons: {
        justifyContent: 'space-between',
    },
    link: {
        padding: 16,
    },
    visionContainer: {
        marginTop: 48,
        textAlign: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    visionHighlight: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E8530E',
    },
    name: {
        fontSize: 72,
        marginBottom: 16,
        lineHeight: 0.9,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'normal',
        lineHeight: 1.4,
    },
};

export default Home;
