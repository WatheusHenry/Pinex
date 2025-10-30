import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabMenu from "./TabMenu";
import DropZone from "./DropZone";
import FloatingMenu from "./FloatingMenu";
import { useSidebarState } from "../../hooks/useSidebarState";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useClipboard } from "../../hooks/useClipboard";
import { SIDEBAR_CONFIG, STORAGE_KEYS, MESSAGES } from "../../constants";
import { createNoteViewerWindow } from "../../utils/windowManager";

const Sidebar = () => {
  const [isVisible, setIsVisible] = useState(false);
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
  const { handlePaste, handleQuickPaste } = useClipboard(addImages);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const distanceFromRight = window.innerWidth - e.clientX;
      setShowButton(distanceFromRight < SIDEBAR_CONFIG.EDGE_TRIGGER_DISTANCE);
    };

    const messageListener = (message) => {
      if (message.action === MESSAGES.TOGGLE_SIDEBAR) {
        setIsVisible((prev) => !prev);
      } else if (message.action === "addTextNote" && message.text) {
        const noteCard = {
          id: Date.now() + Math.random(),
          content: message.text.trim(),
          timestamp: Date.now(),
          type: "note",
        };
        addImages([noteCard]);
        if (!isVisible) {
          setIsVisible(true);
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    try {
      if (chrome.runtime?.id) {
        chrome.runtime.onMessage.addListener(messageListener);
      }
    } catch (error) {
      console.warn("Error adding message listener:", error);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible, addImages]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNewNote = () => {
    createNoteViewerWindow(null, handleSaveNote);
  };

  const handleEditNote = (note) => {
    createNoteViewerWindow(note, handleSaveNote);
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
    const existingNote = images.find((img) => img.id === note.id);

    if (existingNote) {
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
      try {
        if (chrome.runtime?.id) {
          chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs });
        }
      } catch (error) {
        console.warn("Error saving note:", error);
      }
    } else {
      addImages([note]);
    }
  };

  return (
    <motion.div
      className={`sidebar-container ${isVisible ? "visible" : ""}`}
      initial={false}
      animate={{
        x: isVisible ? 0 : SIDEBAR_CONFIG.DEFAULT_WIDTH + 10,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 500,
        mass: 0.5,
      }}
      style={{
        width: `${SIDEBAR_CONFIG.DEFAULT_WIDTH}px`,
      }}
    >

      {/* Floating Menu - Botão + Menu de Ações */}
      <FloatingMenu
        show={showButton}
        isVisible={isVisible}
        onToggleSidebar={() => setIsVisible(true)}
        onQuickPaste={handleQuickPaste}
        onNewNote={handleNewNote}
        onUploadImage={handleUploadImage}
        onClear={clearCurrentTab}
        onClose={handleClose}
      />

      {/* Menu de Abas (quando sidebar está aberta) */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="tab-menu"
            className="sidebar-tab-menu"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <TabMenu
              tabs={tabs}
              currentTab={currentTab}
              onTabSwitch={switchTab}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sidebar-content" style={{ width: `${SIDEBAR_CONFIG.DEFAULT_WIDTH}px` }}>
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
