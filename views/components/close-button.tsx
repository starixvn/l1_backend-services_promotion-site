import React from 'react';
import { AppTypes } from '../constants';

const CloseButton = () => {
    const handleClose = () => {
        parent?.postMessage('closePromotionPopup', '*');
    };

    return window?.AppInitialState?.system === AppTypes.SabaClub ? (
        <span className="close-button-container">
            <span className="icon-close" onClick={handleClose}></span>
        </span>
    ) : null;
};

export default CloseButton;
