import { LeanDocument } from 'mongoose';
import { isSiteNameIncluded } from '../../../../src/_shared/helpers';
import { UserSession } from '../../../../src/features/users/schemas';
import { PromotionConfigsDocument } from '../schemas';

export const isIncludedSite = (promotion: LeanDocument<PromotionConfigsDocument>, session: UserSession): boolean => {
    return promotion.operators.some(
        (operator) => operator.operatorId === session.operatorId && isSiteNameIncluded(operator.includedSiteNames, session.siteName),
    );
};
