import '../../public/static/css/leader-board.scss';

import { useTranslate } from '@tolgee/react';
import React from 'react';

import LoadingSpinner from '../components/loading-spinner';
import { formatNumberWithComma } from '../helpers/common-helper';
import useFetchData from '../hooks/use-fetch-data';
import { LeaderBoardResponse } from '../../src/features/promotion-leader-boards/models/leader-board-response';

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
    const { result, loading, error } = useFetchData<LeaderBoardResponse>(`/leader-board/${promotionId}`);

    if (loading) return <LoadingSpinner />;
    if (error || !result.isSuccessful) return <div>Network Error.</div>;

    const { rank, point } = result?.data.currentUser;

    const displayedRank = point === 0 || (rank === 0 && point !== 0) ? '-' : rank;

    return (
        <div className="promotion-container leader-board">
            <div className="page-title">
                <div className="text">{t('leaderboard')}</div>
            </div>
            <div className="main-content">
                <div className="leader-board-table">
                    <div className="table-header-container">
                        <div className="place">{t('ranking')}</div>
                        <div className="name">{t('nickname')}</div>
                        <div className="points">{t('total_points')}</div>
                    </div>

                    <div className="table-body-container">
                        {result?.data.leadBoardItems.map(
                            (player, index) =>
                                player && (
                                    <PlayerBoard key={index} {...{ player, index, currentUserNickName: result?.data.currentUser.nickName }} />
                                ),
                        )}
                    </div>

                    <div className="table-body-container player-container">
                        <div className="table-row">
                            <div>
                                <span className={`rank ${rank < 3 ? `rank-${rank}` : ''}`}>{rank < 3 ? '' : displayedRank}</span>
                            </div>
                            <div className="txt-special">{t('you')}</div>
                            <div className="txt-special">{formatNumberWithComma(result?.data.currentUser.point)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;
