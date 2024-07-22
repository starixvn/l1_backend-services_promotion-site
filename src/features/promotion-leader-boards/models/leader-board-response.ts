import { Result } from '../../../_shared/common/models/result';

export class LeaderBoardResponse extends Result<LeaderBoardViewModel> {}
export const you = 'you';
export class LeaderBoardViewModel {
    constructor(
        public leadBoardItems: LeaderBoardItemViewModel[],
        public currentUser: LeaderBoardItemViewModel & {
            rank: number;
        },
    ) {
        this.leadBoardItems = leadBoardItems;
        this.currentUser = currentUser;
        const isUserTop10 = currentUser.rank <= 10 && currentUser.rank > 0;
        if (isUserTop10) {
            this.leadBoardItems[currentUser.rank - 1] = currentUser;
        }
    }
}
export class LeaderBoardItemViewModel {
    constructor(
        public nickName: string,
        public point: number,
    ) {
        let tempPoint = +point.toFixed(3);
        if (point - tempPoint > 0) tempPoint += 0.001;
        this.point = tempPoint;
        this.nickName = nickName != you ? `${nickName.substring(0, 1)}***${nickName.substring(nickName.length - 3, nickName.length)}` : you;
    }
}
export const GetFakeDataUserTop = () => {
    const leaderBoardItems: LeaderBoardItemViewModel[] = [];

    leaderBoardItems.push(new LeaderBoardItemViewModel(you, 1000));
    leaderBoardItems.push(new LeaderBoardItemViewModel('A***666', 900));
    leaderBoardItems.push(new LeaderBoardItemViewModel('C***123', 800));
    leaderBoardItems.push(new LeaderBoardItemViewModel('D***123', 700));
    leaderBoardItems.push(new LeaderBoardItemViewModel('E***123', 600));
    leaderBoardItems.push(new LeaderBoardItemViewModel('F***123', 600));
    leaderBoardItems.push(new LeaderBoardItemViewModel('G***123', 400));
    leaderBoardItems.push(new LeaderBoardItemViewModel('H***123', 300));
    leaderBoardItems.push(new LeaderBoardItemViewModel('K***123', 200));
    leaderBoardItems.push(new LeaderBoardItemViewModel('J***123', 100));

    return new LeaderBoardViewModel(leaderBoardItems, { rank: 1, ...new LeaderBoardItemViewModel(you, 1000) });
};

export const GetFakeData = () => {
    const leaderBoardItems: LeaderBoardItemViewModel[] = [];

    leaderBoardItems.push(new LeaderBoardItemViewModel('X***666', 1000));
    leaderBoardItems.push(new LeaderBoardItemViewModel('A***666', 900));
    leaderBoardItems.push(new LeaderBoardItemViewModel('C***123', 800));
    leaderBoardItems.push(new LeaderBoardItemViewModel('D***123', 700));
    leaderBoardItems.push(new LeaderBoardItemViewModel('E***123', 600));
    leaderBoardItems.push(new LeaderBoardItemViewModel('F***123', 600));
    leaderBoardItems.push(new LeaderBoardItemViewModel('G***123', 400));
    leaderBoardItems.push(new LeaderBoardItemViewModel('H***123', 300));
    leaderBoardItems.push(new LeaderBoardItemViewModel('K***123', 200));
    leaderBoardItems.push(new LeaderBoardItemViewModel('J***123', 100));

    return new LeaderBoardViewModel(leaderBoardItems, { ...new LeaderBoardItemViewModel(you, 10), rank: 15 });
};
