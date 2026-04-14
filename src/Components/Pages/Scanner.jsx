import React, { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

export default function Scanner({ onDetected, open }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);

  const [result, setResult] = useState("");

  useEffect(() => {
    if (open) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [open]);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await videoRef.current.play();
      startDecoding();
    } catch (err) {
       stopScanner();

    // Notify parent about error
    onDetected?.(null, "Camera not available or permission denied");
      console.error("Camera Start Error:", err);
    }
  };

  const startDecoding = () => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

    const reader = new BrowserMultiFormatReader(hints);
    readerRef.current = reader;

    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        const text = result.getText();
        setResult(text);
        onDetected?.(text);

        stopScanner();

        setTimeout(() => {
          window.location.href = `https://devphaneo.divanex.in/patient-view/${text}`;
        }, 300);
      }
    });
  };

  const stopScanner = () => {
    try {
      readerRef.current?.reset();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (err) {}
  };

  return (
    <>
      {open && (
        <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              height: 320,
              overflow: "hidden",
              borderRadius: 12,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {result && <p>Scanned: {result}</p>}
        </div>
      )}
    </>
  );
}
