import { Result } from '../../../_shared/common/models/result';
import { WinningPrize } from '../schemas';

export class PromotionConfigsResponse extends Result<PromotionViewModel[]> { }
export class PromotionConfigResponse extends Result<PromotionDetailViewModel> { }
export class PromotionsViewModel {
    constructor(public promotions: PromotionViewModel[]) { }
}
enum Status {
    Running = 1,
    New = 2,
    Completed = 3,
}

export class PromotionViewModel {
    constructor(
        public promotionId: number,
        public title: string,
        public content: string,
        public startDateTime: Date,
        public endDateTime: Date,
    ) {
        this.promotionId = promotionId;
        this.title = title;
        this.content = content;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;

        this.status = this.getStatus();
        this.isCompleted = this.status === Status.Completed;
    }

    private getStatus = (): Status => {
        const currentTime = new Date();
        if (currentTime < this.startDateTime) {
            return Status.New;
        } else if (currentTime > this.startDateTime && currentTime < this.endDateTime) {
            return Status.Running;
        }
        return Status.Completed;
    };
    public status: Status;
    public isCompleted: boolean;
}
export class WinningPrizeViewModel {
    constructor(value: number, ranking: string) {
        this.value = value;
        this.ranking = ranking;
        if (+ranking) {
            this.from = +ranking;
        } else {
            const rankings = ranking.split('-');
            if (rankings.length > 1) {
                this.from = +rankings[0];
                this.to = +rankings[1];
            }
        }
    }
    public value: number;
    public ranking: string;

    public from: number;
    public to: number;
}

export class PromotionDetailViewModel {
    constructor(
        public title: string,
        public startDateTime: Date,
        public endDateTime: Date,
        public otherGameMinBet: number,
        public slotGameMinBet: number,
        winningPrizes: WinningPrize[],
    ) {
        this.title = title;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.otherGameMinBet = otherGameMinBet;
        this.slotGameMinBet = slotGameMinBet;

        let countTotalPrize = 0;
        winningPrizes.forEach((winningPrize) => {
            const prize = new WinningPrizeViewModel(winningPrize.value, winningPrize.ranking);

            const countTotalPrizeTmp = prize.to ?? prize.from;
            if (countTotalPrizeTmp > countTotalPrize) {
                countTotalPrize = countTotalPrizeTmp;
            }

            this.winningPrizes.push(prize);
        });

        this.totalPrize = winningPrizes.reduce(
            (winningPrize, currentWinningPrize) => winningPrize + currentWinningPrize.value,
            0,
        );

        this.countTotalPrize = countTotalPrize;
    }

    public winningPrizes: WinningPrizeViewModel[] = [];
    public totalPrize: number;
    public countTotalPrize: number;
}
