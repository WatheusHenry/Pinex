import React from "react";
import MediaItem from "./MediaItem";

const ImageGrid = ({ images, onDeleteImage, isVisible }) => {
  return (
    <div className="image-grid">
      {images.map((image) => (
        <MediaItem
          key={image.id}
          image={image}
          onDelete={onDeleteImage}
          isVisible={isVisible}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
