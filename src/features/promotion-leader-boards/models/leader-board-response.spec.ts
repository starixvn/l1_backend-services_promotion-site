import { LeaderBoardItemViewModel, LeaderBoardViewModel, you } from './leader-board-response';

describe('LeaderBoardResponse', () => {
    describe('LeaderBoardViewModel', () => {
        it('should have nick name is "you" if current user have rank on top leader board', () => {
            const leaderBoardItems: LeaderBoardItemViewModel[] = [];
            leaderBoardItems.push(new LeaderBoardItemViewModel('Username666', 900));
            leaderBoardItems.push(new LeaderBoardItemViewModel('Username111', 950));
            leaderBoardItems.push(new LeaderBoardItemViewModel('Username123', 800));
            const leaderBoard = new LeaderBoardViewModel(leaderBoardItems, { rank: 2, ...new LeaderBoardItemViewModel(you, 950) });

            expect(leaderBoard.leadBoardItems[1].nickName).toBe(you);
        });
    });

    describe('LeaderBoardItemViewModel', () => {
        it.each([
            [123.123, 123.123],
            [123.1231, 123.124],
            [123.1235, 123.124],
            [123.1236, 123.124],
            [123.123000001, 123.124],
        ])('should round up point to 3 decimal place', (point, expected) => {
            const leaderBoardItem = new LeaderBoardItemViewModel('Username123', point);
            expect(leaderBoardItem.point).toBe(expected);
        });
    });
});
