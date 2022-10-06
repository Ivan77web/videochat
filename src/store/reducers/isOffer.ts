import { IDefaultState, IActionIsOffer } from "../../types/isOfferReducer"

const defaultState: IDefaultState = {
    isCall: false
}

export const isOffer = (state: IDefaultState = defaultState, action: IActionIsOffer) => {
    switch (action.type) {
        case "addOffer":
            return { isCall: true }
        case "removeOffer":
            return { isCall: false }
        default:
            return state
    }
}