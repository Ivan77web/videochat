import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router";
import { Context } from "../../..";
import { Phone } from "../../../icons/phone/Phone";
import { IMyOfferFB } from "../../../types/oneCall";
import { FullFrame } from "../../ui/fullFrame/FullFrame";
import cl from "./OneCallAnswer.module.css"

interface IOneCallOffer {
    myOffer: IMyOfferFB;
    callId: string;
    activeFrame: boolean;
    setActiveFrame: (value: boolean) => void;
    activeVideo: boolean;
    setActiveVideo: (value: boolean) => void;
    pc: RTCPeerConnection | null;
    setPc: (value: RTCPeerConnection | null) => void;
    localStream: any;
    setLocalStream: (value: any) => void;
    remoteStream: any;
    isChoiseWork: boolean;
    setIsChoiseWork: (value: boolean) => void;
}

const OneCallAnswer: React.FC<IOneCallOffer> = ({
    myOffer,
    callId,
    activeFrame,
    setActiveFrame,
    activeVideo,
    setActiveVideo,
    pc,
    setPc,
    localStream,
    setLocalStream,
    remoteStream,
    isChoiseWork,
    setIsChoiseWork,
}) => {
    const { firestore } = useContext(Context);
    const navigate = useNavigate();
    const webcamVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideo = useRef<HTMLVideoElement | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const [isWorkCalls] = useCollectionData(
        firestore.collection(`isWorkCalls`)
    )

    const startSignal = async () => {
        setLocalStream(await navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
    }

    const answerOffer = async () => {
        if (myOffer && pc) {
            const callDoc = firestore.collection('calls').doc(callId);
            const answerCandidates = callDoc.collection('answerCandidates');
            const offerCandidates = callDoc.collection('offerCandidates');

            pc.onicecandidate = (event) => {
                event.candidate && answerCandidates.add(event.candidate.toJSON());
            };

            const callData = (await callDoc.get()).data();

            const offerDescription = callData.offer;
            await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);

            const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
            };

            await callDoc.update({ answer });

            offerCandidates.onSnapshot((snapshot: any) => { // ANY !!!!!!!!!
                snapshot.docChanges().forEach((change: any) => { // ANY !!!!!!!!!
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        pc.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });

            await setDoc(doc(firestore, "isWorkCalls", `call_${callId}`), {
                isWork: true
            });

            deleteDoc(doc(firestore, `offers`, `offer_for_${myOffer.guestId}`));
        }
    }

    const choiseWork = async () => {
        if (isChoiseWork) {
            const docRef = doc(firestore, "isWorkCalls", `call_${callId}`);

            const docSnap = await getDoc(docRef);

            if (docSnap.data()?.isWork === false) {
                deleteDoc(doc(firestore, "isWorkCalls", `call_${callId}`));
                stopVideo()
            }
        }
    }

    const buttonStop = async () => {
        setIsChoiseWork(false)

        await updateDoc(doc(firestore, "isWorkCalls", `call_${callId}`), {
            isWork: false
        });

        stopVideo()
    }

    const stopVideo = async () => {
        localStream.getTracks().forEach(function (track: any) {
            track.stop();
        });

        pc?.close()

        deleteDoc(doc(firestore, `offers`, `offer_for_${myOffer.guestId}`));

        navigate("/")
    }

    const activeFrameClick = () => {
        setActiveFrame(!activeFrame);
        setActiveVideo(!activeVideo);
    }

    useEffect(() => {
        startSignal()
    }, [])

    useEffect(() => {
        if (localStream && pc) {
            localStream.getTracks().forEach((track: any) => {
                pc.addTrack(track, localStream);
            });

            if (webcamVideo.current) {
                webcamVideo.current.srcObject = localStream;
            }

            setIsCameraOpen(true)
        }
    }, [localStream])

    useEffect(() => {
        if (isCameraOpen && myOffer) {
            answerOffer();
        }
    }, [isCameraOpen, myOffer])

    useEffect(() => {
        if (pc) {
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                });

                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = remoteStream;
                }
            };
        }
    }, [pc])

    useEffect(() => {
        if (isWorkCalls) {
            choiseWork()
        }
    }, [isWorkCalls])

    return (
        <div className="container">
            <div className={activeFrame ? cl.videoCall + " " + cl.activeFrame : cl.videoCall + " " + cl.notActiveFrame}>

                <video
                    className={activeFrame ? cl.remoteVideoBig : cl.remoteVideoSmall}
                    autoPlay
                    playsInline
                    ref={remoteVideo}
                >
                </video>

                <video className={cl.webcamVideo} autoPlay playsInline muted ref={webcamVideo}></video>

                <div className={cl.buttons}>
                    <div className={cl.cancel} onClick={buttonStop}>
                        <div className={cl.phoneIcon}>
                            <Phone color="white" />
                        </div>
                    </div>

                    <div className={cl.fullFrame} onClick={activeFrameClick}>
                        <FullFrame />
                    </div>
                </div>
            </div>
        </div>
    )
}

export { OneCallAnswer }