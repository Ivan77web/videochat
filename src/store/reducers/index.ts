import { combineReducers } from "redux";
import { isAuthReducer } from "./isAuthReducer";
import { isOffer } from "./isOffer";
import { statusCall } from "./statusCall";
import { typeCall } from "./typeCall";
import { userDataReducer } from "./userDataReducer";

export const rootReducer = combineReducers({
    userData: userDataReducer,
    auth: isAuthReducer,
    statusCall: statusCall,
    isOffer: isOffer,
    typeCall: typeCall,
})

export type RootState = ReturnType<typeof rootReducer>