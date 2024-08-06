import { UserSession } from "../schemas/user-session.schema";

export class VerifySessionResult {
    isAuthenticated: boolean;
    session: UserSession;

    constructor(isAuthenticated: boolean, session: UserSession) {
        this.isAuthenticated = isAuthenticated;
        this.session = session;
    }
}
