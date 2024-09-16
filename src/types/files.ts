export interface IExampleFileNodeModel {
    file_name: string;
    description: string;
    id: number;
    file_data: string;
   
}

export interface IUserFileNodeModel {
    file_name: string;
    description: string;
    id: number;
    file_data: string;
    file_size: number;
    folder?: string;
    is_trashed: boolean;
}

