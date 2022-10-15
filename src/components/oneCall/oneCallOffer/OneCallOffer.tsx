import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router";
import { Context } from "../../..";
import { useTypedSelector } from "../../../hooks/useTypedSelector";
import { Phone } from "../../../icons/phone/Phone";
import { FullFrame } from "../../ui/fullFrame/FullFrame";
import cl from "./OneCallOffer.module.css"

interface IOneCallOffer {
    callDoc: any // ANY !!!!!!!!
    callId: string
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

const OneCallOffer: React.FC<IOneCallOffer> = ({
    callDoc,
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
    const { mainId, guestId } = useTypedSelector(state => state.statusCall)
    const webcamVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideo = useRef<HTMLVideoElement | null>(null);

    const [isWorkCalls] = useCollectionData(
        firestore.collection(`isWorkCalls`)
    )

    const startSignal = async () => {
        setLocalStream(await navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
    }

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

        deleteDoc(doc(firestore, `offers`, `offer_for_${guestId}`));

        navigate("/")
    }

    const activeFrameClick = () => {
        setActiveFrame(!activeFrame);
        setActiveVideo(!activeVideo)
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