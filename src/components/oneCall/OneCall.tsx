import { setDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router";
import { Context } from "../..";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { Phone } from "../../icons/phone/Phone";
import { IMyOfferFB } from "../../types/oneCall";
import { FullFrame } from "../ui/fullFrame/FullFrame";
import cl from "./OneCall.module.css"

const OneCall = () => {
    const { firestore } = useContext(Context);
    const navigate = useNavigate();

    const { mainId, guestId } = useTypedSelector(state => state.statusCall)
    const { id } = useTypedSelector(state => state.userData)

    const webcamVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideo = useRef<HTMLVideoElement | null>(null);

    const [activeFrame, setActiveFrame] = useState(false);
    const [activeVideo, setActiveVideo] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const [offers] = useCollectionData<IMyOfferFB>(
        firestore.collection(`offers`)
    )

    const [calls] = useCollectionData(
        firestore.collection("calls")
    )

    const [myOffer, setMyOffer] = useState<IMyOfferFB>();

    const [isFindOffer, setIsFindOffer] = useState<boolean>(false)

    const [callId, setCallId] = useState<string>("");

    // useEffect( () => {
    //     if(calls && callId){
    //         const callDoc = firestore.collection('calls').doc(callId);
    //         console.log(callDoc);
            
    //     }
    // }, [calls, callId])

    useEffect(() => {
        if (offers) {
            if (id !== mainId) {
                offers.map(offer => {
                    if (offer.guestId === id) {
                        setMyOffer(offer)
                        setIsFindOffer(true)
                    }
                })
            } else {
                setIsFindOffer(true)
            }
        }
    }, [offers])

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const [pc, setPc] = useState<RTCPeerConnection | null>(new RTCPeerConnection(servers))
    const [localStream, setLocalStream] = useState<any>(null)
    let remoteStream: any = new MediaStream();

    const activeFrameClick = () => {
        setActiveFrame(!activeFrame);
        setActiveVideo(!activeVideo)
    }

    const answerOffer = async () => {
        if (myOffer && pc) {
            setCallId(myOffer.callDocId)

            const callId = myOffer.callDocId
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

            deleteDoc(doc(firestore, `offers`, `offer_for_${myOffer.guestId}`));
        }
    }

    const createOffer = async () => {
        if (pc) {
            const callDoc = firestore.collection('calls').doc();
            const offerCandidates = callDoc.collection('offerCandidates');
            const answerCandidates = callDoc.collection('answerCandidates');

            setCallId(callDoc.id)

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

    const startSignal = async () => {
        // localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(await navigator.mediaDevices.getUserMedia({ video: true, audio: false }))

        // localStream.getTracks().forEach((track: any) => {
        //     pc.addTrack(track, localStream);
        // });

        // if (webcamVideo.current) {
        //     webcamVideo.current.srcObject = localStream;
        // }

        // if (mainId === id) {
        //     await setDoc(doc(firestore, `offer_for_${guestId}`, "mainId"), {
        //         mainId: mainId,
        //     });

        //     createOffer();
        // } else {
        //     setIsCameraOpen(true)
        // }
    }

    useEffect(() => {
        if (localStream && pc) {
            localStream.getTracks().forEach((track: any) => {
                pc.addTrack(track, localStream);
            });

            if (webcamVideo.current) {
                webcamVideo.current.srcObject = localStream;
            }

            if (mainId === id) {
                createOffer();
            } else {
                setIsCameraOpen(true)
            }
        }
    }, [localStream])

    const stopVideo = async () => {
        localStream.getTracks().forEach(function (track: any) {
            track.stop();
        });

        pc?.close()

        deleteDoc(doc(firestore, `calls`, callId));
    }

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
        if (isCameraOpen && myOffer) {
            answerOffer();
        }
    }, [isCameraOpen, myOffer])

    useEffect(() => {
        if (isFindOffer) {
            startSignal()
        }
    }, [isFindOffer])

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
                    <div className={cl.cancel} onClick={stopVideo}>
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

export { OneCall }