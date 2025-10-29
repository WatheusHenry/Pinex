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
      onTap={handleClick}
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
          onDelete(image.id);
        }}
      >
        ×
      </button>
    </motion.div>
  );
};

export default MediaItem;
