//For Node Server
export interface ServerNodeResponse {
    status: number;
    message: string;
    data: any;
}


export enum ServiceResponseErrorCodes
{
    // Request completed successfully.
    NoError = 0,
    // Internal error. Must be supplied with unique code and displayed to the user.
    UnexpectedError = 1,
    // Session expired. Logout with return path.
    IncorrectToken = 2,
}