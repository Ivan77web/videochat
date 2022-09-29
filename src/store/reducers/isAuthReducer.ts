import { IDefautState, IActionIsAuth } from "../../types/isAuthReducer"

const defaultState = {
    isAuth: false
}

export const isAuthReducer = (state: IDefautState = defaultState, action: IActionIsAuth) => {
    switch(action.type){
        case "auth":
            return {isAuth: true}
        case "logout":
            return {isAuth: false}
        default: 
            return state
    }
}