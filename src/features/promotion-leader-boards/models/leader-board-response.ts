import { Result } from '../../../_shared/common/models/result';
import { roundUpToTwoDecimals } from '../../../_shared/helpers';
export class LeaderBoardResponse extends Result<LeaderBoardViewModel> { }
export const you = 'you';
export const topUserRank = 10;

export class LeaderBoardViewModel {
    constructor(
        public leadBoardItems: LeaderBoardItemViewModel[],
        public currentUser: LeaderBoardItemViewModel & {
            rank: number;
        },
    ) {
        this.leadBoardItems = leadBoardItems;
        this.currentUser = currentUser;
        const isUserOnTop = currentUser.rank <= topUserRank && currentUser.rank > 0;
        if (isUserOnTop) {
            this.leadBoardItems[currentUser.rank - 1] = currentUser;
        }
    }
}
export class LeaderBoardItemViewModel {
    constructor(
        public nickName: string,
        public point: number,
    ) {
        this.point = roundUpToTwoDecimals(point);
        this.nickName =
            nickName !== you ? `${nickName.substring(0, 1)}***${nickName.substring(nickName.length - 3, nickName.length)}` : you;
    }
}