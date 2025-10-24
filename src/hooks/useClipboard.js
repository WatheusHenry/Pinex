import { useState, useEffect } from "react";
import { extractMediaFromClipboard } from "../utils/mediaExtractor";

export const useClipboard = (onImagesAdded, isVisible) => {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setHasClipboardContent(false);
      return;
    }

    const checkClipboard = async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();

        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              setHasClipboardContent(true);
              return;
            }
          }
        }

        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
          setHasClipboardContent(true);
          return;
        }

        setHasClipboardContent(false);
      } catch (err) {
        setHasClipboardContent(false);
      }
    };

    checkClipboard();
    const interval = setInterval(checkClipboard, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handlePaste = async (e) => {
    e.preventDefault();
    const newImages = await extractMediaFromClipboard(e.clipboardData);

    if (newImages.length > 0) {
      onImagesAdded(newImages);
      setHasClipboardContent(false);
    }
  };

  const handleQuickPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const newImages = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = (event) => {
                newImages.push({
                  id: Date.now() + Math.random(),
                  url: event.target.result,
                  timestamp: Date.now(),
                  type: "image",
                });
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          }
        }
      }

      if (newImages.length === 0) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
          newImages.push({
            id: Date.now() + Math.random(),
            url: text,
            timestamp: Date.now(),
            type: "image",
          });
        }
      }

      if (newImages.length > 0) {
        onImagesAdded(newImages);
        setHasClipboardContent(false);
      }
    } catch (err) {
      console.error("Erro ao colar:", err);
    }
  };

  return {
    hasClipboardContent,
    handlePaste,
    handleQuickPaste,
  };
};
