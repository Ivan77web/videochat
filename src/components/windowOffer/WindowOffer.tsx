import React, { useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Context } from "../..";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import cl from "./WindowOffer.module.css"

const WindowOffer = () => {
    const { firestore } = useContext(Context);
    const {id} = useTypedSelector( state => state.userData)
    const [myOffer, loading] = useCollectionData(
        firestore.collection(`offer_for_${id}`)
    )

    if(myOffer !== undefined && myOffer[0] && myOffer[0].mainId){
        return(
            <div className={cl.window}>
    
            </div>
        )   
    } else{
        return(
            <div/>
        )
    }
}

export {WindowOffer}