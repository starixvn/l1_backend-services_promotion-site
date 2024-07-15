import { useTranslate } from "@tolgee/react";
export class ResourceTypes {
    public static readonly COMMON = "Common";
    public static readonly PROMOTION_CAMPAIGN = "PromotionCampaign";
}

export function parseTranslationKey(input: string) {
    if (input.includes(".")) {
        const ns = input.split(".")[0];
        const key = input.split(".")[1];
        return { key, ns };
    } else {
        return { key: input };
    }
}

export const useTranslator = (gameNamespaces?: string[]) => {
    const defaultNamespaces = [ResourceTypes.PROMOTION_CAMPAIGN, ResourceTypes.COMMON];
    const ns = gameNamespaces ? gameNamespaces.concat(defaultNamespaces) : defaultNamespaces;
    const translator = useTranslate(ns);
    const t = (key: string, params?: any, opt?: any) => {
        const { key: parsedKey, ns } = parseTranslationKey(key);

        return translator.t({ key: parsedKey, ns, params, ...opt });
    };
    return { t };
};

export const useCommonTranslate = () => {
    return useTranslate(ResourceTypes.COMMON);
};

export const usePromotionCampaignTranslate = () => {
    return useTranslate(ResourceTypes.PROMOTION_CAMPAIGN);
};
