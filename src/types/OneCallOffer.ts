export interface IOneCallOffer {
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