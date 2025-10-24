import { useState, useEffect } from "react";
import { extractMediaFromDrop } from "../utils/mediaExtractor";

export const useDragAndDrop = (onImagesAdded) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageUrl, setDraggedImageUrl] = useState(null);
  const [draggedText, setDraggedText] = useState(null);

  useEffect(() => {
    const handleGlobalDragStart = (e) => {
      // Priorizar imagem sobre texto
      const imageUrl = findImageUrl(e.target);
      if (imageUrl) {
        setDraggedImageUrl(imageUrl);
        setDraggedText(null);
        return;
      }

      // Capturar texto selecionado apenas se não for imagem
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        setDraggedText(selectedText);
        e.dataTransfer.setData("text/plain", selectedText);
        return;
      }
    };

    document.addEventListener("dragstart", handleGlobalDragStart);

    return () => {
      document.removeEventListener("dragstart", handleGlobalDragStart);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Prioridade 1: Processar mídia (imagem/vídeo)
    const newImages = await extractMediaFromDrop(e, draggedImageUrl);
    
    if (newImages.length > 0) {
      onImagesAdded(newImages);
      setDraggedImageUrl(null);
      setDraggedText(null);
      return;
    }

    // Prioridade 2: Verificar se há texto arrastado explicitamente
    if (draggedText) {
      const noteCard = {
        id: Date.now() + Math.random(),
        content: draggedText,
        timestamp: Date.now(),
        type: "note",
      };
      onImagesAdded([noteCard]);
      setDraggedText(null);
      return;
    }

    // Prioridade 3: Verificar se há texto no dataTransfer (apenas se não for URL de imagem)
    const droppedText = e.dataTransfer.getData("text/plain");
    if (droppedText && droppedText.trim()) {
      // Ignorar se parecer uma URL de imagem
      const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(droppedText);
      if (!isImageUrl) {
        const noteCard = {
          id: Date.now() + Math.random(),
          content: droppedText.trim(),
          timestamp: Date.now(),
          type: "note",
        };
        onImagesAdded([noteCard]);
      }
    }

    setDraggedImageUrl(null);
    setDraggedText(null);
  };

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

const findImageUrl = (element) => {
  if (element.tagName === "IMG") {
    return element.src || element.currentSrc;
  }

  if (element.style.backgroundImage) {
    const match = element.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) return match[1];
  }

  const computedStyle = window.getComputedStyle(element);
  const bgImage = computedStyle.backgroundImage;
  if (bgImage && bgImage !== "none") {
    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) return match[1];
  }

  const allImages = element.querySelectorAll("img");
  for (const img of allImages) {
    const src = img.src || img.currentSrc;
    if (src && !src.includes("profile") && !src.includes("avatar")) {
      return src;
    }
  }

  if (allImages.length > 0) {
    return allImages[0].src || allImages[0].currentSrc;
  }

  let parent = element.parentElement;
  let depth = 0;
  while (parent && depth < 10) {
    const url = findImageUrl(parent);
    if (url) return url;
    parent = parent.parentElement;
    depth++;
  }

  return null;
};
