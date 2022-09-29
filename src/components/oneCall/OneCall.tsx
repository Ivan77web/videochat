import { setDoc, doc } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../..";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { Phone } from "../../icons/phone/Phone";
import { FullFrame } from "../ui/fullFrame/FullFrame";
import cl from "./OneCall.module.css"

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

    // --------------------------------------------------

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const pc = new RTCPeerConnection(servers);

    let localStream: any = null;
    let remoteStream: any = null;

    // const webcamButton = document.getElementById('webcamButton');
    // const webcamVideo: HTMLVideoElement | null = document.querySelector(cl.webcamVideo);
    // const callButton = document.getElementById('callButton');
    // const callInput = document.getElementById('callInput');
    // const answerButton = document.getElementById('answerButton');
    // const remoteVideo: HTMLVideoElement | null = document.querySelector(cl.remoteVideo);
    // const hangupButton = document.getElementById('hangupButton');




    // const createOffer = async () => {
    //     const callDoc = firestore.collection('calls').doc();
    //     const offerCandidates = callDoc.collection('offerCandidates');
    //     const answerCandidates = callDoc.collection('answerCandidates');



    //     callInput.value = callDoc.id;

    //     // Get candidates for caller, save to db!!!

    //     pc.onicecandidate = (event) => {
    //       event.candidate && offerCandidates.add(event.candidate.toJSON());
    //     };

    //     // Create offer!!!

    //     const offerDescription = await pc.createOffer();

    //     await pc.setLocalDescription(offerDescription);

    //     const offer = {
    //       sdp: offerDescription.sdp,
    //       type: offerDescription.type,
    //     };

    //     await callDoc.set({ offer });

    //     // Listen for remote answer!!!

    //     callDoc.onSnapshot((snapshot) => {
    //       const data = snapshot.data();

    //       if (!pc.currentRemoteDescription && data?.answer) {
    //         const answerDescription = new RTCSessionDescription(data.answer);
    //         pc.setRemoteDescription(answerDescription);
    //       }
    //     });

    //     // When answered, add candidate to peer connection!!!

    //     answerCandidates.onSnapshot((snapshot) => {
    //       snapshot.docChanges().forEach((change) => {
    //         if (change.type === 'added') {
    //           const candidate = new RTCIceCandidate(change.doc.data());
    //           pc.addIceCandidate(candidate);
    //         }
    //       });
    //     });

    //     hangupButton.disabled = false;
    // }

    const startCamera = async () => {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        remoteStream = new MediaStream();

        localStream.getTracks().forEach((track: any) => {
            pc.addTrack(track, localStream);
        });

        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };

        if (webcamVideo.current && remoteVideo.current) {
            webcamVideo.current.srcObject = localStream;
            remoteVideo.current.srcObject = remoteStream;
        }

        if (mainId === id) {
            await setDoc(doc(firestore, `offer_for_${guestId}`, "mainId"), {
                mainId: mainId,
            });

            // createOffer();
        }

    }

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