import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router";
import { Context } from "../../..";
import { useTypedSelector } from "../../../hooks/useTypedSelector";
import { Phone } from "../../../icons/phone/Phone";
import { IMyOfferFB } from "../../../types/oneCall";
import { FullFrame } from "../../ui/fullFrame/FullFrame";
import cl from "./OneCallOffer.module.css"

interface IOneCallOffer {
    servers: any // ANY !!!!!!!!
    callDoc: any // ANY !!!!!!!!
    callId: string
}

const OneCallOffer: React.FC<IOneCallOffer> = ({ servers, callDoc, callId }) => {
    const { firestore } = useContext(Context); // ПОВТОРЯЕТСЯ
    const navigate = useNavigate(); // ПОВТОРЯЕТСЯ
    const { mainId, guestId } = useTypedSelector(state => state.statusCall)
    const webcamVideo = useRef<HTMLVideoElement | null>(null); // ПОВТОРЯЕТСЯ
    const remoteVideo = useRef<HTMLVideoElement | null>(null); // ПОВТОРЯЕТСЯ
    const [activeFrame, setActiveFrame] = useState(false); // ПОВТОРЯЕТСЯ
    const [activeVideo, setActiveVideo] = useState(false); // ПОВТОРЯЕТСЯ
    const [localStream, setLocalStream] = useState<any>(null) // ПОВТОРЯЕТСЯ
    let remoteStream: any = new MediaStream(); // ПОВТОРЯЕТСЯ
    const [pc, setPc] = useState<RTCPeerConnection | null>(new RTCPeerConnection(servers)) // ПОВТОРЯЕТСЯ

    const [isWorkCalls] = useCollectionData(
        firestore.collection(`isWorkCalls`)
    ) // ПОВТОРЯЕТСЯ

    const startSignal = async () => {
        setLocalStream(await navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
    } // ПОВТОРЯЕТСЯ

    const createOffer = async () => {
        if (pc) {
            const offerCandidates = callDoc.collection('offerCandidates');
            const answerCandidates = callDoc.collection('answerCandidates');

            await setDoc(doc(firestore, "offers", `offer_for_${guestId}`), {
                callDocId: callDoc.id,
                mainId: mainId,
                guestId: guestId,
            });

            pc.onicecandidate = (event) => {
                event.candidate && offerCandidates.add(event.candidate.toJSON());
            };

            const offerDescription = await pc.createOffer();

            await pc.setLocalDescription(offerDescription);

            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
            };

            await callDoc.set({ offer });

            callDoc.onSnapshot((snapshot: any) => { // ANY !!!!!!!!
                const data = snapshot.data();

                if (!pc.currentRemoteDescription && data?.answer) {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    pc.setRemoteDescription(answerDescription);
                }
            });

            answerCandidates.onSnapshot((snapshot: any) => { // ANY !!!!!!!!
                snapshot.docChanges().forEach((change: any) => { // ANY !!!!!!!!
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
                    }
                });
            });
        }
    }

    const [isChoiseWork, setIsChoiseWork] = useState<boolean>(true) // ПОВТОРЯЕТСЯ

    const choiseWork = async () => {
        if (isChoiseWork) {
            const docRef = doc(firestore, "isWorkCalls", `call_${callId}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.data()?.isWork === false) {
                deleteDoc(doc(firestore, "isWorkCalls", `call_${callId}`));
                stopVideo()
            }
        }
    } // ПОВТОРЯЕТСЯ

    const buttonStop = async () => {
        setIsChoiseWork(false)

        await updateDoc(doc(firestore, "isWorkCalls", `call_${callId}`), {
            isWork: false
        });

        stopVideo()
    } // ПОВТОРЯЕТСЯ

    const stopVideo = async () => {
        localStream.getTracks().forEach(function (track: any) {
            track.stop();
        });

        pc?.close()

        deleteDoc(doc(firestore, `offers`, `offer_for_${guestId}`));

        navigate("/")
    } // ПОВТОРЯЕТСЯ, НО ЕСТЬ НЕБОЛЬШОЕ ОТЛИЧИЕ

    const activeFrameClick = () => {
        setActiveFrame(!activeFrame);
        setActiveVideo(!activeVideo)
    } // ПОВТОРЯЕТСЯ

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

            createOffer();
        }
    }, [localStream])

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

export { OneCallOffer }