import { motion, AnimatePresence } from "framer-motion";
import MediaItem from "./MediaItem";
import NoteItem from "./NoteItem";

const ImageGrid = ({ images, onDeleteImage, onEditNote, isVisible }) => {
  return (
    <div className="image-grid">
      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
    </div>
  );
};

export default ImageGrid;
