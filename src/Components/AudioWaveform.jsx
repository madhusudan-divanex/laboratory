import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioWaveform({ audioBlob }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (!audioBlob || !containerRef.current) return;

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#cbd5e1",
      progressColor: "#22c55e",
      cursorColor: "transparent",
      height: 50,
      barWidth: 2,
      barGap: 2,
      responsive: true,
    });

    waveRef.current.loadBlob(audioBlob);

    return () => {
      waveRef.current?.destroy();
    };
  }, [audioBlob]);

  return <div ref={containerRef} />;
}
