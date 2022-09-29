import { combineReducers } from "redux";
import { isAuthReducer } from "./isAuthReducer";
import { statusCall } from "./statusCall";
import { userDataReducer } from "./userDataReducer";

export const rootReducer = combineReducers({
    userData: userDataReducer,
    auth: isAuthReducer,
    statusCall: statusCall,
})

export type RootState = ReturnType<typeof rootReducer>