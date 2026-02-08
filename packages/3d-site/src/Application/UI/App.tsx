import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import LoadingScreen from './components/LoadingScreen';
import HelpPrompt from './components/HelpPrompt';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import InterfaceUI from './components/InterfaceUI';
import eventBus from './EventBus';
import './style.css';

type ModalType = 'privacy' | 'terms' | null;

const App = () => {
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    useEffect(() => {
        eventBus.on('loadingScreenDone', () => {
            setLoading(false);
        });
    }, []);

    const openModal = useCallback((modal: 'privacy' | 'terms') => {
        setActiveModal(modal);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
    }, []);

    return (
        <div id="ui-app">
            <LoadingScreen />
            <Navbar visible={!loading} />
            {!loading && <HelpPrompt />}
            <Footer visible={!loading} onOpenModal={openModal} />
            <LegalModal activeModal={activeModal} onClose={closeModal} />
        </div>
    );
};

const createUI = () => {
    ReactDOM.render(<App />, document.getElementById('ui'));
};

const createVolumeUI = () => {
    ReactDOM.render(<InterfaceUI />, document.getElementById('ui-interactive'));
};

export { createUI, createVolumeUI };
