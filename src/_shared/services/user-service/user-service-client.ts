import axios, { AxiosInstance } from 'axios';
import { VerifySessionResult } from './models';

export class UserServiceClient {
    private static instance: AxiosInstance;

    public static init(): AxiosInstance {
        if (!this.instance) {
            this.instance = axios.create({
                baseURL: process.env.USER_SERVICE_URL,
            });
        }
        return this.instance;
    }

    public static async getSession(session: string, username: string, browserUserAgent: string) {
        const path = `users/session?session=${session}&username=${username}&browserUserAgent=${browserUserAgent}`;
        console.log(`getSession: ${path}`);
        const response = await this.instance.get<VerifySessionResult>(path);

        return response.data;
    }
}
export default UserServiceClient;
