import React from "react";
import ImageGrid from "./ImageGrid";
import EmptyState from "./EmptyState";

const DropZone = ({
  images,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
  onDeleteImage,
  isVisible,
}) => {
  return (
    <div
      className={`drop-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      tabIndex={0}
    >
      {images.length === 0 ? (
        <EmptyState />
      ) : (
        <ImageGrid images={images} onDeleteImage={onDeleteImage} isVisible={isVisible} />
      )}
    </div>
  );
};

export default DropZone;
