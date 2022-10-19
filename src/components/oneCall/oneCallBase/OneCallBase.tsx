import { useContext, useEffect, useState } from "react";
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
    const [callDoc, setCallDoc] = useState<any>();
    const [myOffer, setMyOffer] = useState<IMyOfferFB>();
    const [activeFrame, setActiveFrame] = useState<boolean>(false);
    const [activeVideo, setActiveVideo] = useState<boolean>(false);
    const [localStream, setLocalStream] = useState<any>(null);
    const [isChoiseWork, setIsChoiseWork] = useState<boolean>(true);
    let remoteStream: any = new MediaStream();

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const [pc, setPc] = useState<RTCPeerConnection | null>(new RTCPeerConnection(servers));

    const [offers] = useCollectionData<IMyOfferFB>(
        firestore.collection(`offers`)
    )

    useEffect(() => {
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
                            <OneCallOffer
                                callDoc={callDoc}
                                callId={callDoc.id}
                                activeFrame={activeFrame}
                                setActiveFrame={setActiveFrame}
                                activeVideo={activeVideo}
                                setActiveVideo={setActiveVideo}
                                pc={pc}
                                setPc={setPc}
                                localStream={localStream}
                                setLocalStream={setLocalStream}
                                remoteStream={remoteStream}
                                isChoiseWork={isChoiseWork}
                                setIsChoiseWork={setIsChoiseWork}
                            />
                        </div>
                        :
                        <div />

                    :
                    typeCall === "answer"
                        ?
                        myOffer
                            ?
                            <div>
                                <OneCallAnswer
                                    myOffer={myOffer}
                                    callId={myOffer.callDocId}
                                    activeFrame={activeFrame}
                                    setActiveFrame={setActiveFrame}
                                    activeVideo={activeVideo}
                                    setActiveVideo={setActiveVideo}
                                    pc={pc}
                                    setPc={setPc}
                                    localStream={localStream}
                                    setLocalStream={setLocalStream}
                                    remoteStream={remoteStream}
                                    isChoiseWork={isChoiseWork}
                                    setIsChoiseWork={setIsChoiseWork}
                                />
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