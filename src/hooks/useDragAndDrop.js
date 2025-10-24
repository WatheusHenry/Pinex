import { useState, useEffect } from "react";
import { extractMediaFromDrop } from "../utils/mediaExtractor";

export const useDragAndDrop = (onImagesAdded) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageUrl, setDraggedImageUrl] = useState(null);

  useEffect(() => {
    const handleGlobalDragStart = (e) => {
      const imageUrl = findImageUrl(e.target);
      if (imageUrl) {
        setDraggedImageUrl(imageUrl);
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

    const newImages = await extractMediaFromDrop(e, draggedImageUrl);
    
    if (newImages.length > 0) {
      onImagesAdded(newImages);
    }

    setDraggedImageUrl(null);
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
