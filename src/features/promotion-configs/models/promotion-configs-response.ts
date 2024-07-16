import { Result } from '../../../_shared/common/models/result';

export class PromotionConfigsResponse extends Result<PromotionViewModel[]> {}
export class PromotionConfigResponse extends Result<PromotionDetailViewModel> {}

export class PromotionViewModel {
    constructor(
        public promotionId: number,
        public title: string,
        public content: string,
        public startDateTime: Date,
        public endDateTime: Date,
        public status: string,
    ) {
        this.promotionId = promotionId;
        this.title = title;
        this.content = content;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.status = status;
    }
}
export class PromotionDetailViewModel {
    constructor(public winningPrizes: object[]) {
        this.winningPrizes = winningPrizes;
    }
}
