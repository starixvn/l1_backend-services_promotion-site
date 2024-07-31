import { Inject, Injectable } from '@nestjs/common';
import { SentryLogger } from '../../_shared/common/providers';
import Axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class ChatBotService {
    constructor(@Inject(SentryLogger) private readonly logger: SentryLogger) {}

    buildProxyConfig() {
        const protocol = process.env.PROXY.includes('http://') ? 'http' : 'https';
        const urlWithoutProtocol = process.env.PROXY.replace(/^(https?):\/\//, '');

        return { protocol: protocol, host: urlWithoutProtocol.split(':')[0], port: +urlWithoutProtocol.split(':')[1] };
    }

    async sendMessage(conversationId, message, options = null) {
        try {
            const url = process.env.CHAT_BOT_URL;
            const token = process.env.CHAT_BOT_TOKEN;
            const defaultRequestTimeout = 5000;
            const requestConfigs: AxiosRequestConfig = {
                timeout: options?.requestTimeout || defaultRequestTimeout,
                headers: {},
                proxy: process.env.PROXY ? this.buildProxyConfig() : false,
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
