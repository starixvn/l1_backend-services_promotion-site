import { Result } from '../../../_shared/common/models/result';
import { WinningPrize } from '../schemas';

export class PromotionConfigsResponse extends Result<PromotionViewModel[]> {}
export class PromotionConfigResponse extends Result<PromotionDetailViewModel> {}
export class PromotionsViewModel {
    constructor(public promotions: PromotionViewModel[]) {}
}
export enum Status {
    Running = 1,
    New = 2,
    Completed = 3,
}

export class PromotionViewModel {
    public status: Status;
    public isCompleted: boolean;

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

    public getStatus = (): Status => {
        const currentTime = new Date();
        if (currentTime < this.startDateTime) {
            return Status.New;
        } else if (currentTime > this.startDateTime && currentTime < this.endDateTime) {
            return Status.Running;
        }
        return Status.Completed;
    };
}

export class WinningPrizeViewModel {
    public value: number;
    public ranking: string;
    public from: number;
    public to?: number;

    constructor(value: number, ranking: string) {
        this.value = Math.trunc(value);
        this.ranking = ranking;
        this.parseRanking(ranking);
    }

    private parseRanking(ranking: string): void {
        if (this.isNumeric(ranking)) {
            this.from = +ranking;
        } else {
            const rankings = ranking.split('-');
            if (rankings.length === 2 && this.isNumeric(rankings[0]) && this.isNumeric(rankings[1])) {
                this.from = +rankings[0];
                this.to = +rankings[1];
            } else {
                throw new Error(`Invalid ranking format: ${ranking}`);
            }
        }
    }

    private isNumeric(value: string): boolean {
        return !isNaN(Number(value));
    }
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

        this.winningPrizes = winningPrizes.map(prize => new WinningPrizeViewModel(prize.value, prize.ranking));
        this.totalPrize = this.calculateTotalPrize(this.winningPrizes);
        this.numerousPrize = this.calculateNumerousPrize(this.winningPrizes);
    }

    private calculateTotalPrize(winningPrizes: WinningPrizeViewModel[]): number {
        return winningPrizes.reduce((total, prize) => {
            const ranks = Math.max(1, (prize.to ?? prize.from) - prize.from + 1);
            const rankingTotalPrize = prize.value * ranks;
            return total + rankingTotalPrize;
        }, 0);
    }

    private calculateNumerousPrize(winningPrizes: WinningPrizeViewModel[]): number {
        return winningPrizes.reduce((max, prize) => {
            const numerousPrizeTmp = prize.to ?? prize.from;
            return numerousPrizeTmp > max ? numerousPrizeTmp : max;
        }, 0);
    }

    public winningPrizes: WinningPrizeViewModel[] = [];
    public totalPrize: number;
    public numerousPrize: number;
}
