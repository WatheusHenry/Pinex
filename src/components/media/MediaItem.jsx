import { motion } from "framer-motion";
import { createFloatingViewerWindow } from "../../utils/windowManager";

const MediaItem = ({ image, onDelete, isVisible }) => {
  const handleClick = () => {
    if (isVisible) {
      createFloatingViewerWindow(image.url, image.type);
    }
  };

  return (
    <motion.div
      className="image-item"
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      {image.type === "video" ? (
        <video
          src={image.url}
          style={{
            cursor: isVisible ? "pointer" : "default",
            width: "100%",
            height: "auto",
            display: "block",
            pointerEvents: "none",
          }}
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={image.url}
          alt="Saved"
          style={{ 
            cursor: isVisible ? "pointer" : "default",
            pointerEvents: "none",
          }}
        />
      )}
      <button
        className="image-delete"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(image.id);
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.5 5.5L11 11M11 11L5.5 16.5M11 11L16.5 16.5M11 11L5.5 5.5"
            stroke="white"
            strokeWidth="5.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default MediaItem;
