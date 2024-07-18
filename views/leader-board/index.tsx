import React from 'react';
import '../../public/static/css/style.scss';
import { useTranslate } from '@tolgee/react';
import LoadingSpinner from '../components/loading-spinner';
import useFetchData from '../hooks/use-fetch-data';
import { formatNumberWithComma } from '../helpers/common-helper';

export const PlayerBoard = ({ player, currentUserNickName, index }) => {
  const { t } = useTranslate();
  const isTop3 = index < 3;
  const isCurrentPlayer = player.nickName === currentUserNickName;

  return (
    <div className={`board-row ${isTop3 ? 'top-3' : ''} ${isCurrentPlayer ? 'player' : ''} `}>
      <div>
        <span className={`ranking-place ${isTop3 ? 'place-third' : ''} `}>{index + 1}</span>
      </div>
      <div>{isCurrentPlayer ? t("you") : player.nickName}</div>
      <div>{formatNumberWithComma(player.point)}</div>
    </div>)
}

const LeaderBoard = ({ handleMoreInfo, promotionId }) => {
  const { t } = useTranslate();
  const { data, loading, error } = useFetchData(`/leader-board/1`);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="leaderboard">
        <h2 className="text-center">{t("leaderboard")}</h2>
        <div className="board-table">
          <div className="board-header">
            <div className="place">{t("ranking")}</div>
            <div className="name">{t("nickname")}</div>
            <div className="points">{t("total_points")}</div>
          </div>
          <div className="board-body">
            {
              data.leadBoardItems.map((player, index) => <PlayerBoard key={index} {...{ player, index, currentUserNickName: data.currentUser.nickName }} />)
            }

            <div className="board-body">
              <div className="board-row player">
                <div>
                  <span className="ranking-place place-third">{data.currentUser.rank}</span>
                </div>
                <div>{t("you")}</div>
                <div>{formatNumberWithComma(data.currentUser.point)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="leader-board  ">
        <button className="btn btn-primary" onClick={() => handleMoreInfo(promotionId)}>
          Back
        </button>
      </div>
    </div>
  );
};


export default LeaderBoard;