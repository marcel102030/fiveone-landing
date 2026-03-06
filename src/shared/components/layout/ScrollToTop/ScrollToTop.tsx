import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./ScrollToTop.css";

const ScrollToTop = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls past first section (400px)
      const show = window.scrollY > 400;
      setShowScrollTop(show);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {showScrollTop && (
        <button
          className="scroll-top-floating"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
        >
          <FaArrowUp size={24} color="var(--navy)" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
