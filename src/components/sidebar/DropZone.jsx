import { useState, useRef } from "react";
import ImageGrid from "../media/ImageGrid";
import EmptyState from "../common/EmptyState";

const DropZone = ({
  images,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
  onDeleteImage,
  onEditNote,
  onReorder,
  isVisible,
}) => {
  const [isReordering, setIsReordering] = useState(false);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const isExternalDrag = (e) => {
    const hasFiles = e.dataTransfer.files && e.dataTransfer.files.length > 0;
    const hasImageUrl = e.dataTransfer.types.includes('text/uri-list');
    const hasText = e.dataTransfer.types.includes('text/plain');
    return hasFiles || hasImageUrl || hasText;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current++;
    
    if (isExternalDrag(e) && !isReordering) {
      setIsExternalDragOver(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    
    // Bloquear drop de novas imagens se estiver reorganizando
    if (isReordering) {
      e.stopPropagation();
      return;
    }
    
    if (isExternalDrag(e)) {
      setIsExternalDragOver(true);
    }
    
    onDragOver(e);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setIsExternalDragOver(false);
    }
    
    onDragLeave(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsExternalDragOver(false);
    
    // Bloquear drop de novas imagens se estiver reorganizando
    if (isReordering) {
      e.stopPropagation();
      return;
    }
    onDrop(e);
  };

  return (
    <div
      className={`drop-zone ${isDragging && !isReordering ? "dragging" : ""} ${isReordering ? "reordering" : ""} ${isExternalDragOver ? "external-drag-over" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={onPaste}
      tabIndex={0}
    >
      {images.length === 0 ? (
        <EmptyState />
      ) : (
        <ImageGrid 
          images={images} 
          onDeleteImage={onDeleteImage} 
          onEditNote={onEditNote}
          onReorder={onReorder}
          onReorderingChange={setIsReordering}
          onExternalDrop={handleDrop}
          isVisible={isVisible} 
        />
      )}
      
      {/* Overlay para capturar drops externos em qualquer lugar da sidebar */}
      {isExternalDragOver && !isReordering && (
        <div 
          className="external-drop-overlay"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
};

export default DropZone;
