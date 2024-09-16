/*

    Navigate between app modes/features.

*/

import helpRules from './helprules.json';

export class AppNavigate {

    public static relaunch(): void {
        /*
            //TODO: ScreenPayment dialog was using window.location.replace
            // https://stackoverflow.com/questions/7241851/how-do-i-reload-the-page-without-the-query-parameters
            window.location.replace(location.pathname);
        */
        window.location.reload();
    }

    

    public static navigateAccountIndex(err?: unknown): void {
        let query = "";
        if (err) {
            const params = {
                error: typeof err === "string" ? err : ""
            };
            const searchParams = new URLSearchParams(params);
            query = searchParams.toString();
        }
        window.location.href = "/account/" + (query ? "?" + query : "");
    }

    public static navigateAccountSpread(id: string): void {
        window.location.href = "/account/spreadsheet?id=" + id;
    }

    public static openHelpDrive = () => {
        // TODO: move to shared like addin
        const root = window.location.protocol + '//' + window.location.host;
        window.open(root + '/help', "_blank");
    }

    public static getHelpLink(id: string | number, suffix?: string): string {
        console.log('getHelpLink', id, suffix, helpRules)
        const link = helpRules[id as keyof typeof helpRules];
        console.log('getHelpLink', link);
        return helpRules["helpurl"] + link + (suffix ?? "");
      }
      
    public static openHelpLink(id: string | number) {
        const url = AppNavigate.getHelpLink(id);
        window.open(url, "_blank");
      }
      
      
      public static redirectToUrl (url: string) {
        window.location.href = url;
      }
      

}