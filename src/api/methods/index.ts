//Create class MethodsHelper  
enum MethodType {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD',
    CONNECT = 'CONNECT',
    TRACE = 'TRACE',
}

export interface IMethod {
    name: string;
    type: MethodType;
    parameters?: string[];
}

export class MethodsHelper {

    //Node Methods

    public static createFileNode = { name: 'files', type: MethodType.POST, parameters: ['file_name'] };

    public static findUserFilesNode: IMethod = { name: 'files/findUserFiles', type: MethodType.POST, parameters: ['_iduser'] };

    public static getExampleFilesNode: IMethod = { name: 'examples/getExamples', type: MethodType.POST, parameters: ['_iduser'] };

    public static findExampleFileByIdNode: IMethod = { name: 'examples/findExample', type: MethodType.POST, parameters: ['file_id'] };

    public static duplicateExampleFileNode: IMethod = { name: 'examples/duplicate', type: MethodType.POST, parameters: ['file_id', 'user_id'] };

    public static duplicateFileNode: IMethod = { name: 'files/duplicateFile', type: MethodType.POST, parameters: ['file_id'] };

    public static renameFileNode: IMethod = { name: 'files/renameFile', type: MethodType.POST, parameters: ['file_id', 'file_name'] };

    public static openFileNode: IMethod = { name: 'files/openFile', type: MethodType.POST, parameters: ['file_id'] };

    public static saveFileNode: IMethod = { name: 'files/saveFile', type: MethodType.POST, parameters: ['file_id', 'file_data'] };

    public static deleteFileNode: IMethod = { name: 'files/delete', type: MethodType.POST, parameters: ['file_id'] };

    public static deleteFilesNode: IMethod = { name: 'files/deleteFiles', type: MethodType.POST, parameters: ['file_ids'] };
    
    public static emptyTrashNode: IMethod = { name: 'files/emptyTrash', type: MethodType.POST, parameters: ['userId'] };

    public static restoreTrashFilesNode: IMethod = { name: 'files/restoreFile', type: MethodType.POST, parameters: ['file_ids'] };

    public static deleteTrashFilesNode: IMethod = { name: 'files/deleteTrashFiles', type: MethodType.POST, parameters: ['file_ids'] };

    public static uploadFilesNode: IMethod = { name: 'files/uploadFiles', type: MethodType.POST, parameters: ['userId', 'files'] };

    public static uploadSingleFileNode: IMethod = { name: 'files/uploadSingleFile', type: MethodType.POST, parameters: ['userId', 'file'] };
 
    public static createNewUserNode: IMethod = { name: 'users/', type: MethodType.POST, parameters: ['first_name', 'last_name', 'email', 'phone', 'theme', 'language'] };

    public static getProfileNode: IMethod = { name: 'users/getProfile', type: MethodType.POST, parameters: ['_iduser'] };

    public static changeProfileNode: IMethod = { name: 'users/changeProfile', type: MethodType.POST, parameters: ['userId', 'phone_number', 'first_name', 'last_name'] };

    public static changeThemeNode: IMethod = { name: 'users/changeTheme', type: MethodType.POST, parameters: ['userId', 'theme'] };

    public static loginWithEmailNode: IMethod = { name: 'users/loginWithEmail', type: MethodType.POST, parameters: ['email'] };
    
    public static fetchPricesNode: IMethod = { name: 'users/fetchPrices', type: MethodType.POST, parameters: ['userId'] };

    public static createFeedbackNode: IMethod = { name: 'feedbacks', type: MethodType.POST, parameters: ['userId', 'feedback_text'] };


    //commands methods
    public static findBasicCommandsByLanguage: IMethod = { name: 'basiccommands/findBasicCommands', type: MethodType.POST, parameters: ['language'] };


    public static createAnalysNode : IMethod = { name: 'analyses', type: MethodType.POST, parameters: ['userId', 'cmIdd', 'status', 'prefsCorePascal', 'windowJSON', 'result'] };

    public static getMethod(method: IMethod): MethodType {
        return method.type;
    }
    /**
     *
     *
     * @static
     * @param {IMethod} method
     * @param {string[]} parameters
     * @return {*}  {FormData}
     * @memberof MethodsHelper
     */
    public static createFormDataFromMethodParameters(method: IMethod, values: string[]): FormData {
        const formData = new FormData();
        //add log parameters
        if (method.parameters) {
            //parse string to array use split for ',' 
            method.parameters.forEach((parameter, index) => {
                formData.append(parameter, values[index]);
            });
        }
        return formData;
    }


}
