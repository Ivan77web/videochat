export interface IStatusCallReducer {
    mainId: string | null,
    guestId: string | null,
}

export interface IActionStatusCall {
    type: string,
    payload: string
}