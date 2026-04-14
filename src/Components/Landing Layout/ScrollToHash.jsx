import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
  if (hash) {
    const element = document.querySelector(hash);
    if (element) {
      const yOffset = -80; // adjust based on your header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }
}, [hash]);

  return null;
}

export default ScrollToHash;