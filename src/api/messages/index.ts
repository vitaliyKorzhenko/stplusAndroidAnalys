//TODO: добавить сюда все message, которые будут использоваться в приложении

type ErrorWithMessage = {
    message: string
}
/**
 *
 *
 * @export
 * @class MessageHelper
 */
export class MessageHelper {

    
   public static NetworkErrorMessage: string = "Network error";
   
   public static IncorrectTokenMessage: string = "Incorrect token";

    /**
     *
     *
     * @static
     * @param {string} message
     * @return {*}  {string}
     * @memberof MessageHelper
     */
    public static getErrorMessage(message: string): string {
        return message;
    }

    public static isErrorWithMessage(error: unknown): error is ErrorWithMessage {
        return (
            typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof (error as Record<string, unknown>).message === 'string'
        )
    }

    public static toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
        if (MessageHelper.isErrorWithMessage(maybeError))
            return maybeError;
        try {
            return new Error(JSON.stringify(maybeError));
        } catch {
            // fallback in case there's an error stringifying the maybeError
            // like with circular references for example.
            return new Error(String(maybeError));
        }
    }
    
    /**
     *
     *
     * @static
     * @param {unknown} error
     * @return {*}  {string}
     * @memberof MessageHelper
     */
    public static parseErrorMessage(error: unknown): string {     
        if (MessageHelper.isErrorWithMessage(error)) {
            return error.message;
        }
        return MessageHelper.NetworkErrorMessage;
    }
}