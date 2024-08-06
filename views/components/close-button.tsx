import React from "react";

import { AppTypes } from "../constants";
import { isAppType } from "../helpers";

const CloseButton = () => {
    const handleClose = () => {
        parent?.postMessage('closePromotionPopup', '*');
    };

    return isAppType(AppTypes.SabaClub) || isAppType(AppTypes.MegaKeno) || isAppType(AppTypes.SabaMobi) ? (
        <span className="close-button-container">
            <span className="icon-close" onClick={handleClose}></span>
        </span>
    ) : null;
};

export default CloseButton;
