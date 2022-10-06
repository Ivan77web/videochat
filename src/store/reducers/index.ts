import { combineReducers } from "redux";
import { isAuthReducer } from "./isAuthReducer";
import { isOffer } from "./isOffer";
import { statusCall } from "./statusCall";
import { userDataReducer } from "./userDataReducer";

export const rootReducer = combineReducers({
    userData: userDataReducer,
    auth: isAuthReducer,
    statusCall: statusCall,
    isOffer: isOffer,
})

export type RootState = ReturnType<typeof rootReducer>