import { Result } from '../../../_shared/common/models/result';

export class LeaderBoardResponse extends Result<LeaderBoardViewModel> {}
export class LeaderBoardViewModel {
    constructor(public leadBoardItems: LeaderBoardItemViewModel[]) {
        this.leadBoardItems = leadBoardItems;
    }
    public currentUser: LeaderBoardItemViewModel & {
        rank: number;
    };
}
export class LeaderBoardItemViewModel {
    constructor(
        public nickName: string,
        public point: number,
    ) {
        this.point = point;
        this.nickName = nickName;
    }
}
export const GetFakeDataUserTop = () => {
    const leaderBoardItems: LeaderBoardItemViewModel[] = [];

    leaderBoardItems.push(new LeaderBoardItemViewModel('Faker666', 1000));
    leaderBoardItems.push(new LeaderBoardItemViewModel('A***666', 900));
    leaderBoardItems.push(new LeaderBoardItemViewModel('C***123', 800));
    leaderBoardItems.push(new LeaderBoardItemViewModel('D***123', 700));
    leaderBoardItems.push(new LeaderBoardItemViewModel('E***123', 600));
    leaderBoardItems.push(new LeaderBoardItemViewModel('F***123', 600));
    leaderBoardItems.push(new LeaderBoardItemViewModel('G***123', 400));
    leaderBoardItems.push(new LeaderBoardItemViewModel('H***123', 300));
    leaderBoardItems.push(new LeaderBoardItemViewModel('K***123', 200));
    leaderBoardItems.push(new LeaderBoardItemViewModel('J***123', 100));

    const leaderBoard = new LeaderBoardViewModel(leaderBoardItems);
    leaderBoard.currentUser = { rank: 1, ...new LeaderBoardItemViewModel('Faker666', 1000) };
    return leaderBoard;
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

    const leaderBoard = new LeaderBoardViewModel(leaderBoardItems);
    leaderBoard.currentUser = { ...new LeaderBoardItemViewModel('Faker666', 10), rank: 15 };
    return leaderBoard;
};
