import { AppLogger } from "../../logsApp";
import { ServiceResponseErrorCodes } from "../../types/server";
import { ApiBase } from "../ApiBase";
import { MethodsHelper } from "../methods";
import { IUserProfile, UserProfile } from "../../users";
import { IChangeProfileModel } from "../types";


//create class ApiUserNode
export class ApiUserNode {

   public static async loginWithEmailNode(email: string): Promise<number> {
    AppLogger.log('ApiUser.loginWithEmail NODE()', 'Start Request' + email);

    const res = await ApiBase.runBaseRequest(
      {
        email: email
      },
      MethodsHelper.loginWithEmailNode
    );
    console.log('res', res);

    if (res.status !== ServiceResponseErrorCodes.NoError)
      return Promise.reject(res.message);

    return  Promise.resolve(res.data);
   }

   public static async getProfile(userId: string): Promise<IUserProfile> {
    AppLogger.log('ApiUser.getProfile NODE()', 'Start Request' + userId);
    const numberId = parseInt(userId);
    const res = await ApiBase.runBaseRequest(
      {
        userId: numberId
      },
      MethodsHelper.getProfileNode
    );
    console.log('res', res);

    if (res.status !== ServiceResponseErrorCodes.NoError)
      return Promise.reject(res.message);

    return  Promise.resolve(res.data);
   }

   public static async sendFeedback (userId: string, feedback: string): Promise<void> {
    AppLogger.log('ApiUser.sendFeedback NODE()', 'Start Request' + userId);
    const numberId = parseInt(userId);
    const res = await ApiBase.runBaseRequest(
      {
        userId: numberId,
        feedback_text: feedback
      },
      MethodsHelper.createFeedbackNode
    );
    console.log('res', res);

    if (res.status !== ServiceResponseErrorCodes.NoError)
      return Promise.reject(res.message);

    return  Promise.resolve();
   }


   public static async changeUserProfile(user: IChangeProfileModel): Promise<void> {
    console.log('user', user);
    const res = await ApiBase.runBaseRequest(
      {
        userId: UserProfile.getCurrentUserIdNumber(),
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
        country_code: user.country_code
      },
      MethodsHelper.changeProfileNode
    );
    if (res.status !== ServiceResponseErrorCodes.NoError)
      return Promise.reject(res.message);
   }

}
