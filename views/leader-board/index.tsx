import '../../public/static/css/leader-board.scss';

import { useTranslate } from '@tolgee/react';
import React from 'react';

import CloseButton from '../components/close-button';
import LoadingSpinner from '../components/loading-spinner';
import { formatNumberWithComma } from '../helpers/common-helper';
import useFetchData from '../hooks/use-fetch-data';

export const PlayerBoard = ({ player, index }) => {
    const { t } = useTranslate();
    const isTop3 = index < 3;
    const isOtherPlayer = player.nickName.includes('***');

    return (
        <div className={`table-row ${isOtherPlayer ? '' : 'player'} `}>
            <div>
                <span className={`rank ${isTop3 ? `rank-${index + 1}` : ''} `}>{isTop3 ? '' : index + 1}</span>
            </div>
            <div className={`${isTop3 ? 'txt-special' : ''}`}>{isOtherPlayer ? player.nickName : t('you')}</div>
            <div className={`${isTop3 ? 'txt-special' : ''}`}>{formatNumberWithComma(player.point)}</div>
        </div>
    );
};

const LeaderBoard = ({ promotionId }) => {
    const { t } = useTranslate();
    const { data, loading, error } = useFetchData(`/leader-board/${promotionId}`);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error.message}</div>;

    const rank =
        data.currentUser.point === 0 || (data.currentUser.rank === 0 && data.currentUser.point !== 0) ? '-' : data.currentUser.rank;
    return (
        <div className="promotion-container leader-board">
            <div className="page-title">
                <div className="text">{t('leaderboard')}</div>
                <CloseButton />
            </div>
            <div className="main-content">
                <div className="leader-board-table table">
                    <div className="table-header-container header-bg">
                        <div className="bg">
                            <div className="left"></div>
                            <div className="middle"></div>
                            <div className="right"></div>
                        </div>
                        <div className="header-content">
                            <div className="place">{t('ranking')}</div>
                            <div className="name">{t('nickname')}</div>
                            <div className="points">{t('total_points')}</div>
                        </div>
                    </div>

                    <div className="table-body-container main-bg">
                        <div className="table-body">
                            <div className="bg">
                                <div className="left"></div>
                                <div className="middle"></div>
                                <div className="right"></div>
                            </div>
                            {data.leadBoardItems.map(
                                (player, index) =>
                                    player && (
                                        <PlayerBoard key={index} {...{ player, index, currentUserNickName: data.currentUser.nickName }} />
                                    ),
                            )}
                        </div>
                    </div>

                    <div className="table-body-container player-container">
                        <div className="table-row">
                            <div>
                                <span className={`rank ${rank < 3 ? `rank-${rank}` : ''}`}>{rank < 3 ? '' : rank}</span>
                            </div>
                            <div className="txt-special">{t('you')}</div>
                            <div className="txt-special">{formatNumberWithComma(data.currentUser.point)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;
