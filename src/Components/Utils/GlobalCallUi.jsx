// src/Utils/GlobalCallUi.jsx
// ✅ Props ki zaroorat nahi — context se seedha state milti hai

import React from "react";
import { useGlobalSocket } from "./useGlobalSocket";
import { faPhone, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
const formatTime = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [
    h > 0 ? String(h).padStart(2, "0") : null,
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");
};

function GlobalCallUI() {
  // ✅ Context se directly lo — koi props nahi chahiye
  const {
    incomingCall,
    callType,
    callActive,
    callerName,
    callSeconds,
    acceptCall,
    rejectCall,
    endCall,
    remoteAudioRef,
    remoteVideoRef,
    localVideoRef,
    ringtoneRef,
    calling
  } = useGlobalSocket();
 

  // Koi call nahi — kuch render mat karo
  if (!incomingCall && !callActive && !calling) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.65)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="call-modal"
          style={{
            zIndex: 100000,
            minWidth: 320,
            background: "#0f172a",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="call-header">
            <h4>
              {incomingCall ? "Incoming" : calling ? "Calling..." : "Ongoing"}{" "}
              <FontAwesomeIcon icon={callType === "video" ? faVideo : faPhone} />{" "}
              {callType} Call
            </h4>
            {callActive && (
              <span className="call-timer">⏱ {formatTime(callSeconds)}</span>
            )}
            <p>{callerName || "User"}</p>
          </div>

          {/* Body */}
          <div className="call-body">
            {callType === "video" ? (
              <>
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
              </>
            ) : (
              <div className="voice-call-ui">
                <img src="/profile.png" className="caller-avatar" alt="caller" />
                <div className="voice-wave"></div>
                <p>{incomingCall ? "Ringing..." : "Call in progress"}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="call-footer">
            {incomingCall ? (
              <>
                <button className="accpect-call-btn" onClick={acceptCall}>
                  Accept
                </button>
                <button className="reject-call-btn" onClick={rejectCall}>
                  Reject
                </button>
              </>
            ) : (
              <button className="reject-call-btn" onClick={() => endCall()}>
                End Call
              </button>
            )}
          </div>

          {/* Ringtone */}
          {incomingCall && (
            <audio ref={ringtoneRef} autoPlay loop src="/ringtone.mp3" />
          )}
        </div>
      </div>

      {/* Remote audio — always mounted */}
      <audio ref={remoteAudioRef} autoPlay />
    </>
  );
}

export default GlobalCallUI;