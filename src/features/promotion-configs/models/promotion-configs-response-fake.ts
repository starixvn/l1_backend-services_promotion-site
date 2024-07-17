import { WinningPrize } from "./promotion-configs-response";

export class PromotionViewModelFake {
    title: string;
    content: string;
    startDateTime: Date;
    endDateTime: Date;
    status: string;
    promotionId: number

    constructor(title: string, content: string, startDateTime: Date, endDateTime: Date, status: string, promotionId: number) {
        this.title = title;
        this.content = content;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.status = status;
        this.promotionId = promotionId;
    }
}

// Create fake data
const fakePromotions: PromotionViewModelFake[] = [
    new PromotionViewModelFake(
        "Weekly Promotion 1",
        "Weekly Promotion Detail 1",
        new Date("2024-08-01T22:16:00.000Z"),
        new Date("2024-08-07T22:16:00.000Z"),
        "new",
        1
    ),
    new PromotionViewModelFake(
        "Weekly Promotion 2",
        "Weekly Promotion Detail 2",
        new Date("2024-09-01T22:16:00.000Z"),
        new Date("2024-09-07T22:16:00.000Z"),
        "completed",
        2
    )
];


export class WinningPrizeFake {
    ranking: string;
    value: number;
    constructor(
        ranking: string,
        value: number
    ) {
        this.ranking = ranking;
        this.value = value;
    }
}

export class PromotionDetailViewModelFake {
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    otherGameMinBet: number;
    slotGameMinBet: number;
    totalPrize: number;
    countTotalPrize: number;
    winningPrizes: WinningPrizeFake[];

    constructor(
        title: string,
        startDateTime: Date,
        endDateTime: Date,
        otherGameMinBet: number,
        slotGameMinBet: number,
        totalPrize: number,
        countTotalPrize: number,
        winningPrizes: WinningPrizeFake[]
    ) {
        this.title = title;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.otherGameMinBet = otherGameMinBet;
        this.slotGameMinBet = slotGameMinBet;
        this.totalPrize = totalPrize;
        this.countTotalPrize = countTotalPrize;
        this.winningPrizes = winningPrizes;
    }
}

// Create fake data
const fakePromotionDetails: PromotionDetailViewModelFake = new PromotionDetailViewModelFake(
    "Weekly Promotion 2",
    new Date("2024-09-01T22:16:00.000Z"),
    new Date("2024-09-07T22:16:00.000Z"),
    2,
    0.2,
    1000,
    3,
    [
        new WinningPrize(1000, "1"),
        new WinningPrize(600, "2"),
        new WinningPrize(400, "3"),
        new WinningPrize(200, "4-6"),
        new WinningPrize(100, "7-10")
    ]
)

// Export fake data
export { fakePromotions, fakePromotionDetails };
