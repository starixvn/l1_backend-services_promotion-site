import React from "react";

import { AppTypes } from "../constants";
import { isAppType } from "../helpers";

const CloseButton = () => {
    const handleClose = () => {
        parent?.postMessage('closePromotionPopup', '*');
    };

    return isAppType(AppTypes.SabaClub) || isAppType(AppTypes.MegaKeno) || isAppType(AppTypes.SabaMobi) ? (
        <span className="icon-close" onClick={handleClose}></span>
    ) : null;
};

export default CloseButton;
