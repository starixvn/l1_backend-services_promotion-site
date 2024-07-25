import { useTranslate } from '@tolgee/react';
import React from 'react';
import '../../public/static/css/leader-board.scss';
import LoadingSpinner from '../components/loading-spinner';
import { formatNumberWithComma } from '../helpers/common-helper';
import useFetchData from '../hooks/use-fetch-data';

export const PlayerBoard = ({ player, index }) => {
    const { t } = useTranslate();
    const isTop3 = index < 3;
    const isOtherPlayer = player.nickName.includes('***');

    return (
        <div>
            <div className={`board-row ${isTop3 ? 'top-3' : ''} ${isOtherPlayer ? '' : 'player'} `}>
                <div>
                    <span className={`ranking-place ${isTop3 ? 'place-first' : ''} `}>{index + 1}</span>
                </div>
                <div>{isOtherPlayer ? player.nickName : t('you')}</div>
                <div>{formatNumberWithComma(player.point)}</div>
            </div>
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
        <div className="leader-board-container">
            <div className='header'>
                <div className="text">{t('leaderboard')}</div>
            </div>
            <div className="board-table-container">
                <div className="board-table-header">
                    <div>
                        <div className="board-header">
                            <div className="place">{t('ranking')}</div>
                            <div className="name">{t('nickname')}</div>
                            <div className="points">{t('total_points')}</div>
                        </div>
                    </div>
                </div>

                <div className="board-table">
                    <div className="board-body">
                        {data.leadBoardItems.map((player, index) => (
                            <PlayerBoard key={index} {...{ player, index, currentUserNickName: data.currentUser.nickName }} />
                        ))}
                    </div>
                </div>

                <div className="board-table-player">
                    <div className="board-row-player">
                        <div>
                            <span className={`ranking-place ${rank < 3 ? 'place-first' : ''}`}>{rank}</span>
                        </div>
                        <div className='player'>{t('you')}</div>
                        <div className='player'>{formatNumberWithComma(data.currentUser.point)}</div>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default LeaderBoard;
