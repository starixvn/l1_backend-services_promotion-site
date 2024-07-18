import { LeanDocument } from 'mongoose';
import { UserSession } from '../../../../src/features/users/schemas';
import { PromotionConfigsDocument } from '../schemas';

export const isIncludedSite = (promotion: LeanDocument<PromotionConfigsDocument>, session: UserSession): boolean => {
    return promotion.operators.some(
        (operator) => operator.includedSiteNames === '' || operator.includedSiteNames?.trim().split(',').includes(session.siteName),
    );
};
