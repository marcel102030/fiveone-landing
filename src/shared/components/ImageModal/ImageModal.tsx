import { useState, useEffect } from "react";
import "./ImageModal.css";
import { FaX } from "react-icons/fa6";

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  direction: "next" | "prev" | null;
}

const ImageModal = ({
  src,
  alt,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  direction,
}: ImageModalProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight" && hasNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        onPrev();
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [hasNext, hasPrev, onNext, onPrev]);

  const slideClass =
    direction === "next"
      ? "slide-left"
      : direction === "prev"
      ? "slide-right"
      : "";

  return (
    <div
      className={`modal-overlay ${isClosing ? "fade-out" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content ${isClosing ? "scale-out" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={handleClose}>
          <FaX />
        </button>
        <button
          className={`modal-nav prev ${!hasPrev ? "disabled" : ""}`}
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous image"
        >
          ‹
        </button>
        <div className="modal-image-container">
          <img
            key={`${src}-${direction}`}
            src={src}
            alt={alt}
            className={slideClass}
          />
        </div>
        <button
          className={`modal-nav next ${!hasNext ? "disabled" : ""}`}
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
