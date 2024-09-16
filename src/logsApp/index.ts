
enum LogMode {
    Debug = 'debug',
    Production = 'production',
}

export enum LogLevels {
    Debug = 'debug',
    Warning = 'warning',
    Error = 'error',
}

export class AppLogger {

    private static currentLogMode: LogMode = LogMode.Debug;
    /**
     *
     *
     * @static
     * @memberof AppLogger
     */
    public static initLogMode = (isDebug: boolean) => {
        if (isDebug) {
            this.currentLogMode = LogMode.Debug;
        }
        else {
            this.currentLogMode = LogMode.Production;
        }
    }
    /**
     *
     *
     * @private
     * @static
     * @memberof AppLogger
     */
    private static isDebugMode = () => {
        return this.currentLogMode == LogMode.Debug;
    }
    /**
     *
     *
     * @private
     * @static
     * @param {LogLevels} logLevel
     * @param {string} source
     * @param {string} message
     * @memberof AppLogger
     */
    public static addLog(logLevel: LogLevels, source: string, message: string): void {
        if (logLevel == LogLevels.Debug && this.isDebugMode()) {
            console.debug(source, message);
        }
        if (logLevel == LogLevels.Warning) {
            console.warn(source, message);
        }
        if (logLevel == LogLevels.Error) {
            console.error(source, message);
        }
    }
    /**
     *
     *
     * @static
     * @param {string} source
     * @param {string} message
     * @memberof AppLogger
     */
    public static log = (source: string, message: string): void => {
        this.addLog(LogLevels.Debug, source, message);
    }
    /**
     *
     *
     * @static
     * @param {string} source
     * @param {string} message
     * @memberof AppLogger
     */
    public static warn = (source: string, message: string): void => {
        this.addLog(LogLevels.Warning, source, message);
    }
    /**
     *
     *
     * @static
     * @param {string} source
     * @param {string} message
     * @memberof AppLogger
     */
    public static error = (source: string, message: string) => {
        this.addLog(LogLevels.Error, source, message);
    }


    /**
     *
     *
     * @private
     * @static
     * @param {(string | FormData)} message
     * @memberof AppLogger
     */
    public static consoleBaseAxios(message: string | FormData) {
        this.warn(message.toString(), 'ApiBase');
    }

    //Create public static function to add Log with FormDAta
    public static consoleFormDataAxios(message: FormData) {
        // for (var pair of message.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]); 
        // }
    }

}