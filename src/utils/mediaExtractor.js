import { MEDIA_EXTENSIONS } from "../constants";

const isVideoUrl = (url) => {
  return MEDIA_EXTENSIONS.VIDEO.some((ext) => url.toLowerCase().includes(ext));
};

const isMediaUrl = (url) => {
  const allExtensions = [...MEDIA_EXTENSIONS.IMAGE, ...MEDIA_EXTENSIONS.VIDEO];
  return allExtensions.some((ext) => url.toLowerCase().includes(ext));
};

export const extractMediaFromDrop = async (event, draggedImageUrl) => {
  const newImages = [];

  if (draggedImageUrl) {
    const isVideo = isVideoUrl(draggedImageUrl);
    newImages.push({
      id: Date.now() + Math.random(),
      url: draggedImageUrl,
      timestamp: Date.now(),
      type: isVideo ? "video" : "image",
    });
    return newImages;
  }

  const mediaUrl =
    event.dataTransfer.getData("text/uri-list") ||
    event.dataTransfer.getData("text/html") ||
    event.dataTransfer.getData("text/plain");

  if (mediaUrl) {
    let url = mediaUrl;

    if (mediaUrl.includes("<img") || mediaUrl.includes("<video")) {
      const match = mediaUrl.match(/src=["']([^"']+)["']/);
      if (match) url = match[1];
    }

    if (url && (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:"))) {
      const isVideo = isVideoUrl(url);
      newImages.push({
        id: Date.now() + Math.random(),
        url: url,
        timestamp: Date.now(),
        type: isVideo ? "video" : "image",
      });
      return newImages;
    }
  }

  const items = Array.from(event.dataTransfer.items);
  for (const item of items) {
    if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (event) => {
            newImages.push({
              id: Date.now() + Math.random(),
              url: event.target.result,
              timestamp: Date.now(),
              type: item.type.startsWith("video/") ? "video" : "image",
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }
  }

  return newImages;
};

export const extractMediaFromClipboard = async (clipboardData) => {
  const newImages = [];

  const text = clipboardData.getData("text");
  if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
    if (isMediaUrl(text)) {
      const isVideo = isVideoUrl(text);
      newImages.push({
        id: Date.now() + Math.random(),
        url: text,
        timestamp: Date.now(),
        type: isVideo ? "video" : "image",
      });
      return newImages;
    }
  }

  const items = Array.from(clipboardData.items);
  for (const item of items) {
    if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (event) => {
            newImages.push({
              id: Date.now() + Math.random(),
              url: event.target.result,
              timestamp: Date.now(),
              type: item.type.startsWith("video/") ? "video" : "image",
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }
  }

  return newImages;
};
