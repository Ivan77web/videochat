import { setDoc, doc } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Context } from "../..";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { Phone } from "../../icons/phone/Phone";
import { FullFrame } from "../ui/fullFrame/FullFrame";
import cl from "./OneCall.module.css"

interface IMyOfferFB {
    callDocId: string;
    mainId: string
}

const OneCall = () => {
    const { firestore } = useContext(Context);

    const [isCall, setIsCall] = useState(true) //Потом добавлю аудиозвонки

    const { mainId, guestId } = useTypedSelector(state => state.statusCall)
    const { id } = useTypedSelector(state => state.userData)

    const [activeFrame, setActiveFrame] = useState(false);
    const [activeVideo, setActiveVideo] = useState(false);

    const activeFrameClick = () => {
        setActiveFrame(!activeFrame);
        setActiveVideo(!activeVideo)
    }

    // --------------------------------------------------

    const webcamVideo = useRef<HTMLVideoElement | null>(null);
    const remoteVideo = useRef<HTMLVideoElement | null>(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false); // ТЕСТ !!!!!!!!!!

    // --------------------------------------------------

    const [myOffer, loadingOffer] = useCollectionData<IMyOfferFB>(
        firestore.collection(`offer_for_${id}`)
    )

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    // const pc = new RTCPeerConnection(servers);
    const [pc, setPc] = useState(new RTCPeerConnection(servers))
    // const pc = new RTCPeerConnection(servers);

    let localStream: any = null;
    let remoteStream: any = new MediaStream();;

    // pc.ontrack = (event) => { // тут возможна ошибка
    //     console.log("Получил");

    //     console.log(event);

    //     event.streams[0].getTracks().forEach((track) => {
    //         remoteStream.addTrack(track);
    //     });

    //     if (remoteVideo.current) {
    //         remoteVideo.current.srcObject = remoteStream;
    //     }
    // };

    useEffect(() => {
        pc.ontrack = (event) => { // тут возможна ошибка
            console.log("Получил");

            console.log(event);

            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });

            if (remoteVideo.current) {
                remoteVideo.current.srcObject = remoteStream;
            }
        };
    }, [pc])



    const answerOffer = async () => {
        if (myOffer) {
            const callId = myOffer[0].callDocId

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
        }
    }

    const createOffer = async () => {
        const callDoc = firestore.collection('calls').doc();
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

        setDoc(doc(firestore, `offer_for_${guestId}`, "callDocId"), {
            callDocId: callDoc.id
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

    const startCamera = async () => {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // remoteStream = new MediaStream();

        localStream.getTracks().forEach((track: any) => {
            console.log("Отправил");

            pc.addTrack(track, localStream);
        });

        // pc.ontrack = (event) => { // тут возможна ошибка
        //     console.log("Начало");

        //     console.log(event);

        //     event.streams[0].getTracks().forEach((track) => {
        //         remoteStream.addTrack(track);
        //     });
        // };

        // if (webcamVideo.current && remoteVideo.current) {
        //     webcamVideo.current.srcObject = localStream;
        //     remoteVideo.current.srcObject = remoteStream;
        // }

        if (webcamVideo.current) {
            webcamVideo.current.srcObject = localStream;
        }

        if (mainId === id) {
            await setDoc(doc(firestore, `offer_for_${guestId}`, "mainId"), {
                mainId: mainId,
            });

            createOffer();
        } else {
            setIsCameraOpen(true)
            // answerOffer()
        }

    }

    useEffect(() => {
        if (isCameraOpen && myOffer) {
            answerOffer();
        }
    }, [isCameraOpen, myOffer])

    useEffect(() => {
        startCamera()
    }, [])

    if (isCall) {
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
                        <div className={cl.cancel}>
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
    } else {
        return (
            <div className="container">

            </div>
        )
    }
}

export { OneCall }