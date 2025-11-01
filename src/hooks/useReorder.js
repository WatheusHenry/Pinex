import { useState, useRef } from "react";

export const useReorder = (items, onReorder) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const draggedItemRef = useRef(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    draggedItemRef.current = items[index];
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    setDragOverIndex(index);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Adicionar feedback visual ao entrar na zona
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
      
      // Pequena vibração se a API estiver disponível
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Só limpa se realmente saiu do elemento
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove o item da posição original
    newItems.splice(draggedIndex, 1);
    
    // Insere na nova posição
    newItems.splice(dropIndex, 0, draggedItem);

    onReorder(newItems);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isReordering = draggedIndex !== null;

  return {
    draggedIndex,
    dragOverIndex,
    isReordering,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};
