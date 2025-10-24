import { VIEWER_CONFIG } from "../constants";

const viewers = new Map();
let viewerCounter = 0;

export function createFloatingViewer(mediaUrl, mediaType = "image") {
  const viewerId = `viewer-${Date.now()}-${viewerCounter++}`;

  const createViewer = (width, height) => {
    const container = document.createElement("div");
    container.id = viewerId;
    container.className = "floating-viewer";
    container.style.cssText = `
      all: initial;
      position: fixed;
      width: ${width}px;
      height: ${height}px;
      top: ${100 + viewerCounter * 30}px;
      left: ${100 + viewerCounter * 30}px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      cursor: move;
    `;

    let mediaElement;
    if (mediaType === "video") {
      mediaElement = document.createElement("video");
      mediaElement.src = mediaUrl;
      mediaElement.controls = true;
      mediaElement.loop = true;
      mediaElement.style.cssText = "max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px; pointer-events: auto;";
    } else {
      mediaElement = document.createElement("img");
      mediaElement.src = mediaUrl;
      mediaElement.style.cssText = "max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px; pointer-events: none;";
    }
    container.appendChild(mediaElement);

    let isMinimized = false;
    let savedWidth = width;
    let savedHeight = height;
    let savedLeft = 100 + viewerCounter * 30;
    let savedTop = 100 + viewerCounter * 30;

    const actions = document.createElement("div");
    actions.style.cssText = "position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; z-index: 20;";

    const minimizeBtn = createButton(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      (e, resizeHandleElements) => {
        e.stopPropagation();
        if (!isMinimized) {
          savedWidth = parseInt(container.style.width);
          savedHeight = parseInt(container.style.height);
          savedLeft = parseInt(container.style.left);
          savedTop = parseInt(container.style.top);

          container.style.width = `${VIEWER_CONFIG.MINIMIZED_SIZE}px`;
          container.style.height = `${VIEWER_CONFIG.MINIMIZED_SIZE}px`;
          container.style.bottom = "20px";
          container.style.right = "20px";
          container.style.top = "auto";
          container.style.left = "auto";
          container.style.cursor = "pointer";

          Object.values(resizeHandleElements).forEach((handle) => {
            handle.style.display = "none";
          });

          minimizeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          isMinimized = true;
        } else {
          container.style.width = `${savedWidth}px`;
          container.style.height = `${savedHeight}px`;
          container.style.left = `${savedLeft}px`;
          container.style.top = `${savedTop}px`;
          container.style.bottom = "auto";
          container.style.right = "auto";
          container.style.cursor = "move";

          Object.values(resizeHandleElements).forEach((handle) => {
            handle.style.display = "block";
          });

          minimizeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          isMinimized = false;
        }
      }
    );

    const closeBtn = createButton(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      (e) => {
        e.stopPropagation();
        container.remove();
        viewers.delete(viewerId);
      }
    );

    const resizeHandleElements = createResizeHandles(container);

    actions.appendChild(minimizeBtn);
    actions.appendChild(closeBtn);
    container.appendChild(actions);

    minimizeBtn.onclick = (e) => minimizeBtn._handler(e, resizeHandleElements);

    container.onmouseenter = () => {
      actions.style.opacity = "1";
      Object.values(resizeHandleElements).forEach((handle) => (handle.style.opacity = "1"));
    };
    container.onmouseleave = () => {
      actions.style.opacity = "0";
      Object.values(resizeHandleElements).forEach((handle) => (handle.style.opacity = "0"));
    };

    document.body.appendChild(container);

    setupDragFunctionality(container, isMinimized);
    setupResizeFunctionality(container, resizeHandleElements, isMinimized);

    viewers.set(viewerId, container);
  };

  if (mediaType === "video") {
    const tempVideo = document.createElement("video");
    tempVideo.src = mediaUrl;
    tempVideo.onloadedmetadata = () => {
      const { width, height } = calculateDimensions(tempVideo.videoWidth || 640, tempVideo.videoHeight || 480);
      createViewer(width, height);
    };
    tempVideo.onerror = () => createViewer(640, 480);
  } else {
    const tempImg = new Image();
    tempImg.src = mediaUrl;
    tempImg.onload = () => {
      const { width, height } = calculateDimensions(tempImg.naturalWidth, tempImg.naturalHeight);
      createViewer(width, height);
    };
    tempImg.onerror = () => createViewer(400, 300);
  }

  return viewerId;
}

function createButton(innerHTML, handler) {
  const btn = document.createElement("button");
  btn.innerHTML = innerHTML;
  btn.style.cssText = "width: 24px; height: 24px; border: none; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); color: white; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;";
  btn.onmouseenter = () => (btn.style.background = "rgba(0,0,0,0.9)");
  btn.onmouseleave = () => (btn.style.background = "rgba(0,0,0,0.7)");
  btn._handler = handler;
  btn.onclick = handler;
  return btn;
}

function createResizeHandles(container) {
  const resizeHandles = {
    se: { cursor: "nwse-resize", position: "bottom: 0; right: 0;" },
    sw: { cursor: "nesw-resize", position: "bottom: 0; left: 0;" },
    ne: { cursor: "nesw-resize", position: "top: 0; right: 0;" },
    nw: { cursor: "nwse-resize", position: "top: 0; left: 0;" },
    n: { cursor: "ns-resize", position: "top: 0; left: 50%; transform: translateX(-50%);" },
    s: { cursor: "ns-resize", position: "bottom: 0; left: 50%; transform: translateX(-50%);" },
    e: { cursor: "ew-resize", position: "right: 0; top: 50%; transform: translateY(-50%);" },
    w: { cursor: "ew-resize", position: "left: 0; top: 50%; transform: translateY(-50%);" },
  };

  const resizeHandleElements = {};

  Object.entries(resizeHandles).forEach(([direction, config]) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle-${direction}`;
    const size = ["n", "s", "e", "w"].includes(direction) ? "100%" : "20px";
    const width = ["n", "s"].includes(direction) ? "100%" : ["e", "w"].includes(direction) ? "8px" : size;
    const height = ["e", "w"].includes(direction) ? "100%" : ["n", "s"].includes(direction) ? "8px" : size;

    handle.style.cssText = `
      position: absolute;
      ${config.position}
      width: ${width};
      height: ${height};
      cursor: ${config.cursor};
      background: ${["n", "s", "e", "w"].includes(direction) ? "transparent" : "rgba(255,255,255,0.2)"};
      border-radius: ${direction === "se" ? "0 0 8px 0" : direction === "sw" ? "0 0 0 8px" : direction === "ne" ? "0 8px 0 0" : direction === "nw" ? "8px 0 0 0" : "0"};
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
    `;
    container.appendChild(handle);
    resizeHandleElements[direction] = handle;
  });

  return resizeHandleElements;
}

function setupDragFunctionality(container, isMinimized) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  container.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON" || e.target.className.startsWith("resize-handle-") || e.target.closest("button")) {
      return;
    }
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = container.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging && !isMinimized) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      container.style.left = `${startLeft + deltaX}px`;
      container.style.top = `${startTop + deltaY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function setupResizeFunctionality(container, resizeHandleElements, isMinimized) {
  let isResizing = false;
  let resizeDirection = null;
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  Object.entries(resizeHandleElements).forEach(([direction, handle]) => {
    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      isResizing = true;
      resizeDirection = direction;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (isResizing && resizeDirection && !isMinimized) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      if (resizeDirection.includes("e")) {
        newWidth = Math.max(VIEWER_CONFIG.MIN_WIDTH, startWidth + deltaX);
      }
      if (resizeDirection.includes("w")) {
        newWidth = Math.max(VIEWER_CONFIG.MIN_WIDTH, startWidth - deltaX);
        if (newWidth > VIEWER_CONFIG.MIN_WIDTH) newLeft = startLeft + deltaX;
      }
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(VIEWER_CONFIG.MIN_HEIGHT, startHeight + deltaY);
      }
      if (resizeDirection.includes("n")) {
        newHeight = Math.max(VIEWER_CONFIG.MIN_HEIGHT, startHeight - deltaY);
        if (newHeight > VIEWER_CONFIG.MIN_HEIGHT) newTop = startTop + deltaY;
      }

      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
      container.style.left = `${newLeft}px`;
      container.style.top = `${newTop}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    resizeDirection = null;
  });
}

function calculateDimensions(naturalWidth, naturalHeight) {
  const maxWidth = window.innerWidth * VIEWER_CONFIG.MAX_SCREEN_RATIO;
  const maxHeight = window.innerHeight * VIEWER_CONFIG.MAX_SCREEN_RATIO;
  let width = naturalWidth;
  let height = naturalHeight;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = width * ratio;
    height = height * ratio;
  }

  width = Math.max(VIEWER_CONFIG.MIN_WIDTH, width);
  height = Math.max(VIEWER_CONFIG.MIN_HEIGHT, height);

  return { width, height };
}
