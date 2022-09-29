import { IDefaultStateDataUser, IAction } from "../../types/userDataReducer"

const defaultState: IDefaultStateDataUser = {
    name: "",
    id: "",
    email: "",
    photo: "",
}

export const userDataReducer = (state: IDefaultStateDataUser = defaultState, action: IAction) => {
    switch (action.type) {
        case "addUserData":
            return {
                name: action.payload.name,
                id: action.payload.id,
                email: action.payload.email,
                photo: action.payload.photo
            }
        case "deleteData":
            return {
                name: "",
                id: "",
                email: "",
                photo: "",
            }
        default:
            return state
    }
}