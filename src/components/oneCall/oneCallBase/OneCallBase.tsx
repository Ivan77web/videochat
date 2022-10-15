import React, { useContext, useEffect, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Context } from "../../..";
import { useTypedSelector } from "../../../hooks/useTypedSelector";
import { IMyOfferFB } from "../../../types/oneCall";
import { OneCallAnswer } from "../oneCallAnswer/OneCallAnswer";
import { OneCallOffer } from "../oneCallOffer/OneCallOffer";

const OneCallBase = () => {
    const { firestore } = useContext(Context);
    const { typeCall } = useTypedSelector(state => state.typeCall)
    const { id } = useTypedSelector(state => state.userData)

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const [offers] = useCollectionData<IMyOfferFB>(
        firestore.collection(`offers`)
    )

    const [callDoc, setCallDoc] = useState<any>();
    const [myOffer, setMyOffer] = useState<IMyOfferFB>();

    useEffect( () => {
        if (typeCall === "offer") { 
            setCallDoc(firestore.collection('calls').doc());
        }
    }, [])

    useEffect(() => {
        if (typeCall === "answer") {
            if (offers) {
                offers.map(offer => {
                    if (offer.guestId === id) {
                        setMyOffer(offer)
                    }
                })
            }
        }
    }, [offers])

    return (
        <>
            {
                typeCall === "offer"
                    ?
                    (callDoc && callDoc.id)
                        ?
                        <div>
                            <OneCallOffer servers={servers} callDoc={callDoc} callId={callDoc.id} />
                        </div>
                        :
                        <div />

                    :
                    typeCall === "answer"
                        ?
                        myOffer
                            ?
                            <div>
                                <OneCallAnswer servers={servers} myOffer={myOffer} callId={myOffer.callDocId} />
                            </div>
                            :
                            <div />
                        :
                        <div />

            }
        </>
    )
}

export { OneCallBase }