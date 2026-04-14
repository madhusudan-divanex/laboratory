// src/Utils/useGlobalSocket.js
// ✅ Context-based — sirf EK instance, sab jagah same state

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import base_url from "../../../baseUrl";

// ─── Singleton socket ─────────────────────────────────────────
let globalSocket = null;
let listenersAttached = false;

// ─── Context ──────────────────────────────────────────────────
const SocketContext = createContext(null);

// ─── Provider — sirf App.js mein wrap karo ───────────────────
export function GlobalSocketProvider({ children }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callType, setCallType] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);
  const [calling, setCalling] = useState(false);
  const [socket, setSocket] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const ringtoneRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callTimerRef = useRef(null);

  // ─── Timer ──────────────────────────────────────────────────
  const startTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    let sec = 0;
    callTimerRef.current = setInterval(() => {
      sec += 1;
      setCallSeconds(sec);
    }, 1000);
  };

  const stopTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallSeconds(0);
  };

  // ─── Cleanup ────────────────────────────────────────────────
  const endCallCleanup = () => {
    stopTimer();
    setCalling(false);
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    setCallActive(false);
    setIncomingCall(null);
    setCallerName("");
  };

  // ─── PeerConnection ─────────────────────────────────────────
  const initPeerConnection = (toUserId) => {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate && globalSocket) {
        globalSocket.emit("ice-candidate", { toUserId, candidate: e.candidate });
      }
    };

    pcRef.current.ontrack = (e) => {
      const stream = e.streams[0];
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => { });
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
  };

  // ─── Socket init + listeners ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!globalSocket) {
      globalSocket = io(base_url, { auth: { token } });
      setSocket(globalSocket); // ✅ IMPORTANT
    }

    // ✅ Listeners sirf ek baar — is Provider ke saath
    if (!listenersAttached) {
      listenersAttached = true;

      globalSocket.on("incoming-call", ({ fromUserId, offer, callType }) => {
        console.log("📞 incoming-call", fromUserId);
        setIncomingCall({ fromUserId, offer });
        setCallType(callType);
      });

      globalSocket.on("incoming-group-call", ({ fromUserId, offer, callType, name = "Group" }) => {
        console.log("📞 incoming-group-call", fromUserId);
        setIncomingCall({ fromUserId, offer });
        setCallerName(name);
        setCallType(callType);
      });

      globalSocket.on("call-answered", async ({ answer }) => {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(answer);
          pendingCandidatesRef.current.forEach((c) => pcRef.current.addIceCandidate(c));
          pendingCandidatesRef.current = [];
        }
        setCallActive(true);
        startTimer();
        setCalling(false);
      });

      globalSocket.on("ice-candidate", async (candidate) => {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(candidate);
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
      });

      globalSocket.on("call-rejected", () => {
        endCallCleanup();
        toast.error("Call rejected by user");
      });

      globalSocket.on("call-ended", () => {
        endCallCleanup();
      });
    }

    // ✅ Cleanup mein sirf timer — socket/listeners hata nahi
    return () => {
      stopTimer();
    };
  }, []);

  // ─── Call actions ────────────────────────────────────────────
  const acceptCall = async () => {
    if (!incomingCall) return;
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    startTimer();
    initPeerConnection(incomingCall.fromUserId);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });

    if (callType === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    localStreamRef.current = stream;
    stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));

    await pcRef.current.setRemoteDescription(incomingCall.offer);
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    globalSocket.emit("answer-call", { toUserId: incomingCall.fromUserId, answer });
    setIncomingCall(null);
    setCallActive(true);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    globalSocket.emit("reject-call", { toUserId: incomingCall.fromUserId });
    endCallCleanup();
  };

  const endCall = (toUserId) => {
    if (toUserId) globalSocket.emit("end-call", { toUserId });
    endCallCleanup();
  };

  const startCall = async (type, selectedChat) => {
    if (!selectedChat || !globalSocket) return;
    setCallType(type);
    setCalling(true)
    initPeerConnection(selectedChat.participants[0]._id);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    if (type === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    localStreamRef.current = stream;
    stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    globalSocket.emit("call-user", {
      toUserId: selectedChat.participants[0]._id,
      callType: type,
      conversationId: selectedChat._id,
      isGroup: selectedChat?.type === "group",
      offer,
    });
  };
  const value = {
    socket,
    incomingCall,
    callType,
    callActive,
    callerName,
    callSeconds,
    acceptCall,
    rejectCall,
    endCall,
    startCall,
    remoteAudioRef,
    remoteVideoRef,
    localVideoRef,
    ringtoneRef,
    calling
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// ─── Hook — kisi bhi component mein use karo ─────────────────
export function useGlobalSocket() {
  return useContext(SocketContext);
}