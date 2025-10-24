import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const {
    tabs,
    currentTab,
    images,
    switchTab,
    addImages,
    deleteImage,
    clearCurrentTab,
  } = useSidebarState();
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(addImages);
  const { hasClipboardContent, handlePaste, handleQuickPaste } = useClipboard(
    addImages,
    isVisible
  );
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
      } else if (message.action === "addTextNote" && message.text) {
        // Adicionar nota de texto do menu de contexto
        const noteCard = {
          id: Date.now() + Math.random(),
          content: message.text.trim(),
          timestamp: Date.now(),
          type: "note",
        };
        addImages([noteCard]);
        // Abrir sidebar se estiver fechada
        if (!isVisible) {
          setIsVisible(true);
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible, addImages]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (
        newWidth >= SIDEBAR_CONFIG.MIN_WIDTH &&
        newWidth <= SIDEBAR_CONFIG.MAX_WIDTH
      ) {
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
    setIsVisible(false);
  };

  const handleNewNote = () => {
    if (window.createNoteViewer) {
      window.createNoteViewer(null, handleSaveNote);
    }
  };

  const handleEditNote = (note) => {
    if (window.createNoteViewer) {
      window.createNoteViewer(note, handleSaveNote);
    }
  };

  const handleUploadImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.style.display = "none";

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      const imagePromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              id: Date.now() + Math.random(),
              url: event.target.result,
              timestamp: Date.now(),
              type: "image",
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const newImages = await Promise.all(imagePromises);
      addImages(newImages);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  };

  const handleSaveNote = (note) => {
    // Verificar se é edição ou nova nota
    const existingNote = images.find((img) => img.id === note.id);

    if (existingNote) {
      // Atualizar nota existente
      const updatedImages = images.map((img) =>
        img.id === note.id ? note : img
      );
      const updatedTabs = {
        ...tabs,
        [currentTab]: {
          ...tabs[currentTab],
          images: updatedImages,
        },
      };
      chrome.storage.local.set({ sidebarTabs: updatedTabs });
    } else {
      // Adicionar nova nota
      addImages([note]);
    }
  };

  return (
    <motion.div
      className={`sidebar-container ${isVisible ? "visible" : ""} ${
        isDarkMode ? "dark" : "light"
      }`}
      initial={false}
      animate={{
        x: isVisible ? 0 : width + 10,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 500,
        mass: 0.5,
      }}
      style={{
        width: `${width}px`,
      }}
    >
      {isVisible && <ResizeHandle onMouseDown={handleResizeStart} />}

      <AnimatePresence mode="wait">
        {!isVisible ? (
          <ToggleButton show={showButton} onClick={() => setIsVisible(true)} />
        ) : (
          <motion.div
            key="menu"
            className="sidebar-menu"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <TabMenu
              tabs={tabs}
              currentTab={currentTab}
              onTabSwitch={switchTab}
            />
            <div className="menu-divider" />
            <ActionMenu
              hasClipboardContent={hasClipboardContent}
              onQuickPaste={handleQuickPaste}
              onNewNote={handleNewNote}
              onUploadImage={handleUploadImage}
              onClear={clearCurrentTab}
              onClose={handleClose}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sidebar-content" style={{ width: `${width}px` }}>
        <DropZone
          images={images}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onDeleteImage={deleteImage}
          onEditNote={handleEditNote}
          isVisible={isVisible}
        />
      </div>
    </motion.div>
  );
};

export default Sidebar;
