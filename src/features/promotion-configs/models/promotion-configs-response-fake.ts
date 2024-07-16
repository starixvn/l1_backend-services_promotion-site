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

// Export fake data
export { fakePromotions };
