import React, { useState, useEffect } from "react";
import TabMenu from "./TabMenu";
import ActionMenu from "./ActionMenu";
import DropZone from "./DropZone";
import ToggleButton from "./ToggleButton";
import ResizeHandle from "./ResizeHandle";
import { useSidebarState } from "../hooks/useSidebarState";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useClipboard } from "../hooks/useClipboard";
import { useDarkMode } from "../hooks/useDarkMode";
import { SIDEBAR_CONFIG, STORAGE_KEYS, MESSAGES } from "../constants";
import "../content.css";

const Sidebar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [width, setWidth] = useState(SIDEBAR_CONFIG.DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { tabs, currentTab, images, switchTab, addImages, deleteImage, clearCurrentTab } = useSidebarState();
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop(addImages);
  const { hasClipboardContent, handlePaste, handleQuickPaste } = useClipboard(addImages, isVisible);
  const isDarkMode = useDarkMode();

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEYS.SIDEBAR_WIDTH], (result) => {
      if (result[STORAGE_KEYS.SIDEBAR_WIDTH]) {
        setWidth(result[STORAGE_KEYS.SIDEBAR_WIDTH]);
      }
    });

    const handleMouseMove = (e) => {
      const distanceFromRight = window.innerWidth - e.clientX;
      setShowButton(distanceFromRight < SIDEBAR_CONFIG.EDGE_TRIGGER_DISTANCE);
    };

    const messageListener = (message) => {
      if (message.action === MESSAGES.TOGGLE_SIDEBAR) {
        setIsVisible((prev) => !prev);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= SIDEBAR_CONFIG.MIN_WIDTH && newWidth <= SIDEBAR_CONFIG.MAX_WIDTH) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_WIDTH]: width });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, width]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 100);
  };

  return (
    <div
      className={`sidebar-container ${isVisible ? "visible" : ""} ${isDarkMode ? "dark" : "light"}`}
      style={{
        transform: isVisible ? "translateX(0)" : `translateX(${width + 10}px)`,
        width: `${width}px`,
      }}
    >
      {isVisible && <ResizeHandle onMouseDown={handleResizeStart} />}

      {!isVisible ? (
        <ToggleButton show={showButton} onClick={() => setIsVisible(true)} />
      ) : (
        <div className={`sidebar-menu ${isClosing ? "closing" : ""}`}>
          <TabMenu tabs={tabs} currentTab={currentTab} onTabSwitch={switchTab} />
          <div className="menu-divider" />
          <ActionMenu
            hasClipboardContent={hasClipboardContent}
            onQuickPaste={handleQuickPaste}
            onClear={clearCurrentTab}
            onClose={handleClose}
          />
        </div>
      )}

      <div className="sidebar-content" style={{ width: `${width}px` }}>
        <DropZone
          images={images}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onDeleteImage={deleteImage}
          isVisible={isVisible}
        />
      </div>
    </div>
  );
};

export default Sidebar;
