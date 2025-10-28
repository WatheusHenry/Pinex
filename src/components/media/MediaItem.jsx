import { createFloatingViewerWindow } from "../../utils/windowManager";

const MediaItem = ({ image, onDelete, isVisible }) => {
  const handleClick = () => {
    if (isVisible) {
      createFloatingViewerWindow(image.url, image.type);
    }
  };

  return (
    <div className="image-item">
      {image.type === "video" ? (
        <video
          src={image.url}
          onClick={handleClick}
          style={{
            cursor: isVisible ? "pointer" : "default",
            width: "100%",
            height: "auto",
            display: "block",
          }}
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={image.url}
          alt="Saved"
          onClick={handleClick}
          style={{ cursor: isVisible ? "pointer" : "default" }}
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
    </div>
  );
};

export default MediaItem;
