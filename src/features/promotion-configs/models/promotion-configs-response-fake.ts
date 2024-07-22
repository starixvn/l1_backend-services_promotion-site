import { WinningPrize } from "../schemas";
import { PromotionDetailViewModel, PromotionViewModel } from "./promotion-configs-response";
const fakePromotions: PromotionViewModel[] = [
    new PromotionViewModel(
        1,
        "Summer Sale",
        "Get up to 50% off on selected items.",
        new Date("2024-08-01T00:00:00"),
        new Date("2024-08-31T23:59:59")
    ),
    new PromotionViewModel(
        2,
        "Back to School",
        "Special discounts on school supplies.",
        new Date("2024-09-01T00:00:00"),
        new Date("2024-09-30T23:59:59")
    ),
    new PromotionViewModel(
        3,
        "Holiday Deals",
        "Exclusive offers for the holiday season.",
        new Date("2024-12-01T00:00:00"),
        new Date("2024-12-31T23:59:59")
    )
];

export class WinningPrizeFake {
    ranking: string;
    value: number;
    constructor(value: number, ranking: string) {
        this.ranking = ranking;
        this.value = value;
    }
}


const winningPrizes: WinningPrize[] = [
    { value: 1000.0, ranking: '1' },         // Single rank prize
    { value: 500.0, ranking: '2-3' },       // Range prize
    { value: 200.0, ranking: '4' },         // Single rank prize
    { value: 50.0, ranking: '5-10' }        // Range prize
];

// Create an instance of PromotionDetailViewModel with sample data
const fakePromotionDetails = new PromotionDetailViewModel(
    "Summer Special Promotion",
    new Date("2024-07-01T00:00:00"),
    new Date("2024-07-31T23:59:59"),
    10.0, // otherGameMinBet
    5.0,  // slotGameMinBet
    winningPrizes
);


// Export fake data
export { fakePromotionDetails, fakePromotions };

