import { Inject, Injectable } from '@nestjs/common';
import { SentryLogger } from '../../_shared/common/providers';
import Axios from 'axios';

@Injectable()
export class ChatBotService {
    constructor(@Inject(SentryLogger) private readonly logger: SentryLogger) {}

    async sendMessage(conversationId, message, options = null) {
        try {
            const url = process.env.CHAT_BOT_URL;
            const token = process.env.CHAT_BOT_TOKEN;
            const defaultRequestTimeout = 5000;
            const requestConfigs = {
                timeout: options?.requestTimeout || defaultRequestTimeout,
                headers: {},
            };

            await Axios.post(
                `${url}forwardwithtoken?token=${token}&conversationId=${conversationId}&message=${message}`,
                {},
                requestConfigs,
            );
        } catch (error) {
            console.log('chat bot', error);
            this.logger.error(error);
        }
    }
}
