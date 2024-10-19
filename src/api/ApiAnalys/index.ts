import { AppLogger } from "../../logsApp";
import { ServiceResponseErrorCodes } from "../../types/server";
import { ApiBase } from "../ApiBase";
import { MethodsHelper } from "../methods";

export class ApiAnalys {

    //run analysis  public static runAnalysisNode : IMethod = { name: 'analyses/runAnalysis', type: MethodType.POST, parameters: ['id', 'prefs', 'data'] };

   public static async runAnalysis(id: string, prefs: string, data: string): Promise<void> {
    AppLogger.log('ApiAnalys.runAnalysis NODE()', 'Start Request' + id);
    const numberId = parseInt(id);
    const res = await ApiBase.runBaseRequest(
      {
        id: numberId,
        prefs: prefs,
        data: data
      },
      MethodsHelper.runAnalysisNode
    );
    console.log('res', res);

    if (res.status !== ServiceResponseErrorCodes.NoError)
      return Promise.reject(res.message);

    return  Promise.resolve(res.data);
   }

   //test analysis (run analysis)  with test data
//    data:{"id":1001,"version":1,"groupid":1000,"window":{"Vars":[{"ValueReference":"Data!A:A","varlabel":"Variables","text":false,"multi":true,"mincols":1,"minrows":2,"constsubstitute":false,"required":true,"Cols":[{"Label":"Var1-x","Cells":[10,8,13,9,11,14,6,4,12,7,5]}]}],"AdvOpts":[{"Value":"false","Type":"checkbox"},{"Value":"false","Type":"checkbox"},{"Value":"0","Type":"numberint"},{"Value":"6","Type":"list"},{"Value":"2","Type":"list"},{"Value":"0","Type":"list"},{"Value":"false","Type":"checkbox"}]},"subscription":"free"}
// prefs:{"SheetDefFontName":"","SheetDefFontSize":0,"ReportTimestamp":false,"DecimalPlaces":4,"HideTrailZeros":false,"ScientificNotation":false,"ShowProbsAsPercent":false,"Alpha_Idx":4,"MissingValuesHandling":0,"Seed":0,"LangUI":"English"}
// id:1001

   public static async testAnalysis(): Promise<any> {
    AppLogger.log('ApiAnalys.testAnalysis NODE()', 'Start Request');
    const testId = 1001;
    const testPrefs = '{"SheetDefFontName":"","SheetDefFontSize":0,"ReportTimestamp":false,"DecimalPlaces":4,"HideTrailZeros":false,"ScientificNotation":false,"ShowProbsAsPercent":false,"Alpha_Idx":4,"MissingValuesHandling":0,"Seed":0,"LangUI":"English"}';
    const testData = '{"id":1001,"version":1,"groupid":1000,"window":{"Vars":[{"ValueReference":"Data!A:A","varlabel":"Variables","text":false,"multi":true,"mincols":1,"minrows":2,"constsubstitute":false,"required":true,"Cols":[{"Label":"Var1-x","Cells":[10,8,13,9,11,14,6,4,12,7,5]}]}],"AdvOpts":[{"Value":"false","Type":"checkbox"},{"Value":"false","Type":"checkbox"},{"Value":"0","Type":"numberint"},{"Value":"6","Type":"list"},{"Value":"2","Type":"list"},{"Value":"0","Type":"list"},{"Value":"false","Type":"checkbox"}]},"subscription":"free"}';
    const res = await ApiBase.runBaseRequest(
      {
        id: testId,
        prefs: testPrefs,
        data: testData
      },
      MethodsHelper.runAnalysisNode
    );
    console.log('res', res);

    if (res.status !== ServiceResponseErrorCodes.NoError)
      return Promise.reject(res.message);

    return  Promise.resolve(res.data);
   }


}