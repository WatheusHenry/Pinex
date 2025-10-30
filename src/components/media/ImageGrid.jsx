import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import MediaItem from "./MediaItem";
import NoteItem from "./NoteItem";

const ImageGrid = ({ images, onDeleteImage, onEditNote, isVisible }) => {
  const gridRef = useRef(null);
  const lastItemRef = useRef(null);
  const prevImagesLength = useRef(images.length);

  useEffect(() => {
    // Detectar quando um novo item foi adicionado
    if (images.length > prevImagesLength.current && lastItemRef.current) {
      // Pequeno delay para garantir que o item foi renderizado
      setTimeout(() => {
        lastItemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
    prevImagesLength.current = images.length;
  }, [images.length]);

  return (
    <div className="image-grid" ref={gridRef}>
      <AnimatePresence mode="popLayout">
        {images.map((image, index) => {
          const isLastItem = index === images.length - 1;
          return image.type === "note" ? (
            <div key={image.id} ref={isLastItem ? lastItemRef : null}>
              <NoteItem
                note={image}
                onEdit={onEditNote}
                onDelete={onDeleteImage}
                isVisible={isVisible}
              />
            </div>
          ) : (
            <div key={image.id} ref={isLastItem ? lastItemRef : null}>
              <MediaItem
                image={image}
                onDelete={onDeleteImage}
                isVisible={isVisible}
              />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ImageGrid;
