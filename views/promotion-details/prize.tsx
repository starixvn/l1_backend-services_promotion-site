import React from 'react';
import '../helpers/string-helper';
import '../../public/static/css/style.scss';
import { useTranslate } from "@tolgee/react";

const getPrizeDescription = ({ prize }) => {
  const { t } = useTranslate();

  switch (prize.from) {
    case 1:
      return {
        text: t('first_place'),
        image: `first-prize.png`
      };
    case 2:
      return {
        text: t('second_place'),
        image: `second-prize.png`
      }
    case 3:
      return {
        text: t('third_place'),
        image: `third-prize.png`
      }
    case 4:
      return {
        text: t('other_places', { from: prize.from, to: prize.to }).replaceTolgeeFormat(),
        image: `4-10-prize.png`
      }
    default:
      return {
        text: t('other_places', { from: prize.from, to: prize.to }).replaceTolgeeFormat(),
        image: `11-20-prize.png`
      }
  }
}

const Prize = ({ prize }) => {
  const { text, image } = getPrizeDescription({ prize });
  const imagePath = 'static/images';
  return (<div className="prize-item ">
    <img src={`${imagePath}/${image}`} alt="" />
    <div>
      <h3>{text}</h3>
      <p>{prize.value}</p>
    </div>
  </div>);
}

export default Prize;