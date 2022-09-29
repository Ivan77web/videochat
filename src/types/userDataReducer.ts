export interface IDefaultStateDataUser {
    name: string;
    id: string;
    email: string;
    photo: string;
}

export interface IAction {
    type: string;
    payload: IDefaultStateDataUser
}