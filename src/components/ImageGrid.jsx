import React from "react";
import MediaItem from "./MediaItem";
import NoteItem from "./NoteItem";

const ImageGrid = ({ images, onDeleteImage, onEditNote, isVisible }) => {
  return (
    <div className="image-grid">
      {images.map((image) =>
        image.type === "note" ? (
          <NoteItem
            key={image.id}
            note={image}
            onEdit={onEditNote}
            onDelete={onDeleteImage}
            isVisible={isVisible}
          />
        ) : (
          <MediaItem
            key={image.id}
            image={image}
            onDelete={onDeleteImage}
            isVisible={isVisible}
          />
        )
      )}
    </div>
  );
};

export default ImageGrid;
