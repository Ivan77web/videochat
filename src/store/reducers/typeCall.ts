interface ITypeCall{
    typeCall: string
}

interface IActionStatusCall{
    type: string
}

const defaultState = {
    typeCall: "notCall"
}

export const typeCall = (state: ITypeCall = defaultState, action: IActionStatusCall) => {
    switch (action.type) {
        case "typeIsOffer":
            return { typeCall: "offer"  }
        case "typeIsAnswer":
            return { typeCall: "answer"  }
        case "typeIsNotCall":
            return { typeCall: "notCall"  }
        default:
            return state
    }
}