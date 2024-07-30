import '../helpers/string-helper';

import { useTranslate } from '@tolgee/react';
import React from 'react';

import { formatNumberWithComma } from '../helpers/common-helper';

const getPrizeDescription = ({ prize }) => {
    const { t } = useTranslate();

    switch (prize.from) {
        case 1:
            return {
                text: t('first_place'),
                image: 'first-prize.png',
            };
        case 2:
            return {
                text: t('second_place'),
                image: 'second-prize.png',
            };
        case 3:
            return {
                text: t('third_place'),
                image: 'third-prize.png',
            };
        default:
            return {
                text: t('other_places', { from: prize?.from, to: prize?.to }).replaceTolgeeFormat(),
                image: 'other-prize.png',
            };
    }
};

const Prize = ({ prize }) => {
    const { text, image } = getPrizeDescription({ prize });
    const imagePath = 'static/images';
    return (
        <div className="info-item  ">
            <img src={`${imagePath}/${image}`} alt="" />
            <div>
                <div className="item-description-header">{text}</div>
                <p className="item-description-content">{formatNumberWithComma(prize?.value)}</p>
            </div>
        </div>
    );
};

export default Prize;
