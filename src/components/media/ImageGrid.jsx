import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MediaItem from "./MediaItem";
import NoteItem from "./NoteItem";
import ColorItem from "./ColorItem";
import { useReorder } from "../../hooks/useReorder";

const ImageGrid = ({ images, onDeleteImage, onEditNote, onReorder, onReorderingChange, onExternalDrop, isVisible }) => {
  const gridRef = useRef(null);
  const lastItemRef = useRef(null);
  const prevImagesLength = useRef(images.length);

  const {
    draggedIndex,
    dragOverIndex,
    isReordering,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useReorder(images, onReorder);

  // Função para detectar se o drag vem de fora da extensão
  const isExternalDrag = (e) => {
    // Se estamos reorganizando internamente, não é drag externo
    if (isReordering || draggedIndex !== null) {
      return false;
    }
    
    // Verifica se há arquivos ou dados externos
    const hasFiles = e.dataTransfer.files && e.dataTransfer.files.length > 0;
    const hasImageUrl = e.dataTransfer.types.includes('text/uri-list');
    const hasText = e.dataTransfer.types.includes('text/plain');
    
    return hasFiles || hasImageUrl || hasText;
  };

  useEffect(() => {
    // Notificar o componente pai quando o estado de reorganização mudar
    if (onReorderingChange) {
      onReorderingChange(isReordering);
    }
  }, [isReordering, onReorderingChange]);

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
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          
          // Calcular se este item será empurrado para cima ou para baixo
          const willMoveUp = draggedIndex !== null && dragOverIndex !== null && 
                            index === dragOverIndex && draggedIndex > dragOverIndex;
          const willMoveDown = draggedIndex !== null && dragOverIndex !== null && 
                              index === dragOverIndex && draggedIndex < dragOverIndex;
          
          const itemProps = {
            draggable: true,
            onDragStart: (e) => handleDragStart(e, index),
            onDragOver: (e) => {
              // Se for drag externo, permitir que o DropZone pai capture
              if (isExternalDrag(e)) {
                return; // Não prevenir, deixar borbulhar para o DropZone
              }
              handleDragOver(e, index);
            },
            onDragEnter: (e) => {
              // Se for drag externo, permitir que o DropZone pai capture
              if (isExternalDrag(e)) {
                return; // Não prevenir, deixar borbulhar para o DropZone
              }
              handleDragEnter(e, index);
            },
            onDragLeave: (e) => {
              // Se for drag externo, permitir que o DropZone pai capture
              if (isExternalDrag(e)) {
                return; // Não prevenir, deixar borbulhar para o DropZone
              }
              handleDragLeave(e);
            },
            onDrop: (e) => {
              // Se for drag externo, delegar para o DropZone pai
              if (isExternalDrag(e)) {
                if (onExternalDrop) {
                  onExternalDrop(e);
                }
                return;
              }
              handleDrop(e, index);
            },
            onDragEnd: handleDragEnd,
          };

          const motionProps = {
            layout: true,
            initial: { opacity: 0, scale: 0.8 },
            animate: { 
              opacity: isDragging ? 0.4 : 1,
              scale: isDragging ? 0.95 : 1,
              y: willMoveUp ? -8 : willMoveDown ? 8 : 0,
              rotate: isDragging ? 2 : 0,
              transition: {
                layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
                y: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                rotate: { duration: 0.2 },
              }
            },
            exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
            className: `draggable-item ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""}`,
          };
          
          if (image.type === "note") {
            return (
              <motion.div key={image.id} ref={isLastItem ? lastItemRef : null} {...itemProps} {...motionProps}>
                <NoteItem
                  note={image}
                  onEdit={onEditNote}
                  onDelete={onDeleteImage}
                  isVisible={isVisible}
                />
              </motion.div>
            );
          } else if (image.type === "color") {
            return (
              <motion.div key={image.id} ref={isLastItem ? lastItemRef : null} {...itemProps} {...motionProps}>
                <ColorItem
                  color={image}
                  onDelete={onDeleteImage}
                  isVisible={isVisible}
                />
              </motion.div>
            );
          } else {
            return (
              <motion.div key={image.id} ref={isLastItem ? lastItemRef : null} {...itemProps} {...motionProps}>
                <MediaItem
                  image={image}
                  onDelete={onDeleteImage}
                  isVisible={isVisible}
                />
              </motion.div>
            );
          }
        })}
      </AnimatePresence>
    </div>
  );
};

export default ImageGrid;
