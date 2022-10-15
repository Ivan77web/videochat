import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { deleteDoc, doc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Context } from "../..";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { Phone } from "../../icons/phone/Phone";
import cl from "./WindowOffer.module.css"
import { IMyOfferFB } from "../../types/oneCall";

const WindowOffer = () => {
    const { firestore } = useContext(Context);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useTypedSelector(state => state.userData)
    const { isCall } = useTypedSelector(state => state.isOffer)
    const [mainIdName, setMainNameId] = useState<string>("")

    const [offers, loadingOffers] = useCollectionData<IMyOfferFB>(
        firestore.collection(`offers`)
    )

    const [myOffer, setMyOffer] = useState<IMyOfferFB>();

    const [allUsers] = useCollectionData(
        firestore.collection(`allUsers`)
    )

    const removeCall = async () => {
        await deleteDoc(doc(firestore, `offer_for_${id}`, "mainId"));
    }

    const connectCall = () => {
        dispatch({ type: "removeOffer" })
        dispatch({type: "typeIsAnswer"})
        navigate("/call")
    }

    useEffect(() => {
        if (offers) {
            offers.map(offer => {
                if (offer.guestId === id) {
                    setMyOffer(offer)
                }
            })
        }
    }, [offers])

    useEffect(() => {
        if (!loadingOffers) {
            if (myOffer !== undefined) {
                dispatch({ type: "addOffer" })
            } else {
                dispatch({ type: "removeOffer" })
            }
        }
    }, [myOffer])

    useEffect(() => {
        if (allUsers && myOffer && myOffer !== undefined) {
            allUsers.map(user => {
                if (user.id === myOffer.mainId) {
                    setMainNameId(user.name)
                }
            })
        }
    }, [myOffer])

    if (isCall) {
        return (
            <div className={cl.window}>

                <h3 className={cl.name}>{mainIdName}</h3>

                <div className={cl.icons}>
                    <div className={cl.bgRed} onClick={removeCall}>
                        <div className={cl.phone}><Phone color="red" /></div>
                    </div>

                    <div className={cl.bgGreen} onClick={connectCall}>
                        <div className={cl.phone}><Phone color="green" /></div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div />
        )
    }
}

export { WindowOffer }