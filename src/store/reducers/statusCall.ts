import { IStatusCallReducer, IActionStatusCall } from "../../types/statusCallReducer"

const defaultState: IStatusCallReducer = {
    mainId: null,
    guestId: null
}

export const statusCall = (state: IStatusCallReducer = defaultState, action: IActionStatusCall) => {
    switch (action.type) {
        case "addMainId":
            return { ...state, mainId: action.payload }
        case "removeMainId":
            return { ...state, mainId: null }
        case "addGuestId":
            return { ...state, guestId: action.payload }
        case "removeGuestId":
            return { ...state, guestId: null }
        default:
            return state
    }
}