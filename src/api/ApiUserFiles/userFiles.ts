import { IExampleFileNodeModel, IUserFileNodeModel } from "../../types/files";
import { ServiceResponseErrorCodes } from "../../types/server";
import { ApiBase } from "../ApiBase";
import { MethodsHelper } from "../methods";

export class ApiUserFilesNode {


    public static async createNewFileNode(
        fileName: string,
        userId: number
        ): Promise<IUserFileNodeModel> {
        try {
            //default post - create file
            const fileData = `{"workbook":{"version":"3.0","useWijmoTheme":true,"sheets":{"Sheet1":{"name":"Sheet1","rowCount":200,"columnCount":20,"rowHeaderData":{"rowCount":200,"colCount":1},"colHeaderData":{"rowCount":1,"colCount":20},"data":{"rowCount":200,"colCount":20,"dataTable":{"0":{"0":{}}}}}},"namedStyles":[{"hAlign":2,"vAlign":2,"name":"styleDefNumber"}]},"charts":[]} `;
            const res = await ApiBase.runBaseRequest({
                file_name: fileName,
                file_data: fileData,
                file_size: 100,
                userId: userId
            }, MethodsHelper.createFileNode);
            if (res.status !== ServiceResponseErrorCodes.NoError)
                return Promise.reject(res.message);

            return Promise.resolve<IUserFileNodeModel>(res.data);
        } catch (error) {
            console.error("createNewFileNode Error: ", error);
            //global error
            return Promise.reject('Network Error');

        }
    }

    /**
      *
      *
      * @static
      * @return {*}  {Promise<IExampleFileNodeModel[]>}
      * @memberof ApiUserFilesNode
      */
    public static async getExamplesFilesNode(): Promise<IExampleFileNodeModel[]> {
        const tokenData = new FormData();
        const res = await ApiBase.runBaseRequest(tokenData, MethodsHelper.getExampleFilesNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IExampleFileNodeModel[]>(res.data)
    }
   
    public static async getUserFilesNode(userId: number): Promise<IUserFileNodeModel[]> {
        const res = await ApiBase.runBaseRequest({ userId: userId }, MethodsHelper.findUserFilesNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IUserFileNodeModel[]>(res.data)
    }

    /*
    renameFile
    */

    public static async renameFileNode(fileId: number, fileName: string): Promise<IUserFileNodeModel> {
        const res = await ApiBase.runBaseRequest({ file_id: fileId, file_name: fileName }, MethodsHelper.renameFileNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IUserFileNodeModel>(res.data)
    }

    /*  
    duplicate user file
    */

    public static async duplicateFileNode(fileId: number): Promise<IUserFileNodeModel> {
        const res = await ApiBase.runBaseRequest({ file_id: fileId }, MethodsHelper.duplicateFileNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IUserFileNodeModel>(res.data)
    }

    /*
    delete user file
    */

    public static async deleteFileNode(fileId: number): Promise<IUserFileNodeModel> {
        const res = await ApiBase.runBaseRequest({ file_id: fileId }, MethodsHelper.deleteFileNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IUserFileNodeModel>(res.data)
    }

    /*
    restore files
    */
    
    public static async restoreFileNode(fileId: number): Promise<IUserFileNodeModel> {
        const res = await ApiBase.runBaseRequest({ file_ids: fileId.toString() }, MethodsHelper.restoreTrashFilesNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IUserFileNodeModel>(res.data)
    }

    /*
    open file
    */

    public static async openFileNode(fileId: number): Promise<IUserFileNodeModel> {
        const res = await ApiBase.runBaseRequest({ file_id: fileId }, MethodsHelper.openFileNode);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve<IUserFileNodeModel>(res.data)
    }

    /*
    delete Trash Files
    */
    public static async deleteTrashFilesNode (file_ids: string): Promise<any> {
        const res = await ApiBase.runBaseRequest({ file_ids: file_ids }, MethodsHelper.deleteTrashFilesNode);
        console.log('deleteTrashFilesNode', res);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve(res.data);
    }

    /*
    emptyTrashNode
    */

    public static async emptyTrashNode(userId: number): Promise<any> {
        const res = await ApiBase.runBaseRequest({ userId: userId }, MethodsHelper.emptyTrashNode);
        console.log('emptyTrashNode', res);
        if (res.status != ServiceResponseErrorCodes.NoError) return Promise.reject(res.message);
        return Promise.resolve(res.data);
    }
}

