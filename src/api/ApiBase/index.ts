/*

  Request helper.
  
  Pre-documentation:

  https://www.notion.so/ApiBase-ebc6f5ee542a408a9139e5b72d1d1cdf
  
*/
import axios from 'axios';
import API from '../index';
import { AppConfiguration } from '../../config';
import { AppLogger } from '../../logsApp';
import { ServerNodeResponse, ServiceResponseErrorCodes } from '../../types/server';
import { MessageHelper } from '../messages';
import { IMethod } from '../methods';


/* 
  Хранит состояние сессии — передает с каждым запросом 
    * legacy apikey-token (”ioapikey”),
    * Firebase UID,
    * Firebase Token для аутентификации пользователя.
*/
export class ApiBase {

 
  public static async runBaseRequest(payload: object, endpoint: IMethod): Promise<ServerNodeResponse> {
    try {
      AppLogger.consoleBaseAxios("NODE REQUEST = " + endpoint.name);
      AppLogger.consoleBaseAxios("payload " + JSON.stringify(payload));
      const path = AppConfiguration.getApiUrlNode() + '/' + endpoint.name;

      // Ready
      AppLogger.consoleBaseAxios('Start NODE Request: ' + path + ' Data: ');
      AppLogger.consoleBaseAxios(payload.toString());

      const apiResult = await API.post(path, payload);
      console.log("===API RESULT");
      console.log(apiResult);
      AppLogger.consoleBaseAxios('API NODE: ' + endpoint.name + ' Result: ' + JSON.stringify(apiResult));

      if (apiResult.status == ServiceResponseErrorCodes.IncorrectToken) {
        //logout(true);
        //TODO:
        return Promise.reject('Need logout ??');
      } else if (apiResult.status == ServiceResponseErrorCodes.UnexpectedError) {
        return Promise.reject(apiResult.status);
      } else {
        console.log("Response is good, return resolve", apiResult);
        return Promise.resolve({
          status: ServiceResponseErrorCodes.NoError,
          message: '',
          data: apiResult.data
        })
      }
    } catch (error /*TODO: TS4.4+ : unknown*/) {
      // Try to get error message
      if (error instanceof Error) {
        const msg = axios.isAxiosError(error) ? MessageHelper.NetworkErrorMessage + ' ' + error.message : MessageHelper.toErrorWithMessage(error);
        return Promise.reject(msg);
      }
      return Promise.reject(MessageHelper.NetworkErrorMessage);
    }
  }
}
