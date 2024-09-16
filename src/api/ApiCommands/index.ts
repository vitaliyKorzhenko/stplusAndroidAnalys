import { BasicCommand } from "../../types/commands";
import { ServiceResponseErrorCodes } from "../../types/server";
import { ApiBase } from "../ApiBase";
import { MethodsHelper } from "../methods";

export class ApiCommands {


    //find all commands by language

    public static async findAllCommandsByLanguage(language?: string): Promise<BasicCommand[]> {

        const res = await ApiBase.runBaseRequest(
            {
                language: language
            },
            MethodsHelper.findBasicCommandsByLanguage
        );
        console.log('res', res);

        if (res.status !== ServiceResponseErrorCodes.NoError)
            return Promise.reject(res.message);

        return Promise.resolve(res.data);
    }
}