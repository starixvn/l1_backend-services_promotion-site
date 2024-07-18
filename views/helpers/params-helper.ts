export class ParamsHelper {
    public static getParams() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('sessionId');
        const username = urlParams.get('username');
        const language = urlParams.get('language');
        return { sessionId, username, language };
    }
}
