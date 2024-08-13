import "../helpers/string-helper";

import { useTranslate } from "@tolgee/react";
import React from "react";

import { formatNumberWithComma } from "../helpers/common-helper";

const getPrizeDescription = ({ prize }) => {
    const { t } = useTranslate();

    switch (prize.from) {
        case 1:
            return {
                text: t('first_place'),
                image: 'first-prize.webp',
            };
        case 2:
            return {
                text: t('second_place'),
                image: 'second-prize.webp',
            };
        case 3:
            return {
                text: t('third_place'),
                image: 'third-prize.webp',
            };
        default:
            if (prize.from && prize.to) {
                return {
                    text: t('other_places', { from: prize?.from, to: prize?.to }).replaceTolgeeFormat(),
                    image: 'other-prize.webp',
                };
            } else {
                return {
                    text: t('other_places_single_value', { place: prize?.from }).replaceTolgeeFormat(),
                    image: 'other-prize.webp',
                };
            }
    }
};

const Prize = ({ prize }) => {
    const { text, image } = getPrizeDescription({ prize });
    const imagePath = 'static/images';
    return (
        <div className="info-item">
            <div className="left">
                <img className="icon" src={`${imagePath}/${image}`} alt="" />
            </div>
            <div className="left">
                <div className="item-description-header">{text}</div>
            </div>
            <p className="item-description-content">{formatNumberWithComma(prize?.value)}</p>
        </div>
    );
};

export default Prize;
