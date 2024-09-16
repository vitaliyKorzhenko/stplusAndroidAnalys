import { AppLogger } from "../logsApp";

export class AppConfiguration {

    //is debug mode
    private static isDebug: boolean = true;

    //add local api url xf

    private static nodeLocalApiUrl: string = "http://localhost:4000";
    //vercel droplet
    private static nodeRemoteApiUrl: string = "https://sp-server-test.vercel.app";


    private static apiUrl : string = '';

    public static getApiUrlNode(): string {
        this.apiUrl = this.isDebug ? this.nodeLocalApiUrl : this.nodeRemoteApiUrl;
        return this.apiUrl;
    }

    /**
     * 

    private static isDebug: boolean = false;
    /**
     *
     *
     * @static
     * @return {*}  {boolean}
     * @memberof AppConfiguration
     */
    public static isDebugMode(): boolean {
        return AppConfiguration.isDebug;
    }

    /**
     *
     *
     * @static
     * @return {*}  {boolean}
     * @memberof AppConfiguration
     */

    private static shortTabFlag: boolean = false;

    public static isShortTabFlag(): boolean {
        return this.shortTabFlag;
    }

    public static setShortTabFlag(value: boolean) {
        this.shortTabFlag = value;
    }

    private static forceInputDialogTabShort: boolean = false;

    public static isForceInputDialogTabShort(): boolean {
        return this.forceInputDialogTabShort;
    }

    public static setForceInputDialogTabShort(value: boolean) {
        this.forceInputDialogTabShort = value;
    }

    /**
     *
     *use For init AppConfiguration
     * @static
     * @param {boolean} isDebug
     * @param {boolean} isAjaxMode
     * @param {string} serverExtAjax
     * @memberof AppConfiguration
     */
    public static initConfig(isDebug: boolean,) {


        this.isDebug = isDebug ? isDebug : false;
        AppLogger.initLogMode(this.isDebug);
        this.apiUrl = isDebug ? this.nodeLocalApiUrl : this.nodeRemoteApiUrl;

        //App logger add log for init config
        AppLogger.log("AppConfiguration", "initConfig: " + ' debugMode:' + isDebug );
    }

  

    public static isHideAccountMenu(): boolean {
        //TODO: for beta version
        //   return AppConfiguration.isAndroid();
        return false;
    }

}
