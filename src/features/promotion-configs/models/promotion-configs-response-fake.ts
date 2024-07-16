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
    name: string;
    value: number;
    quantity: number;
    constructor(
        name: string,
        value: number,
        quantity: number
    ) {
        this.name = name;
        this.value = value;
        this.quantity = quantity;
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
        new WinningPrizeFake("1st prize", 1000, 1),
        new WinningPrizeFake("2nd prize", 600, 1),
        new WinningPrizeFake("3rd prize", 400, 4)
    ]
)

// Export fake data
export { fakePromotions, fakePromotionDetails };
