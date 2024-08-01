import React from 'react';
import { isIframe } from '../index';

const CloseButton = () => {
    const handleClose = () => {
        parent?.postMessage('closePromotionPopup', '*');
    };

    return isIframe ? (
        <span className="close-button-container">
            <span className="icon-close" onClick={handleClose}></span>
        </span>
    ) : null;
};

export default CloseButton;
