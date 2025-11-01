import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    reorderImages,
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
          chrome.storage.local.set({
            [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs,
          }, () => {
            // Notificar outras abas via BroadcastChannel
            const syncChannel = new BroadcastChannel('sidebar-sync');
            syncChannel.postMessage({
              type: "NOTE_UPDATED",
              data: {
                tabs: updatedTabs,
                affectedTab: currentTab,
              },
            });
            syncChannel.close();
          });
        }
      } catch (error) {
        console.warn("Error saving note:", error);
      }
    } else {
      addImages([note]);
    }
  };

  const handleColorPicker = async () => {
    try {
      // Verifica se o navegador suporta EyeDropper API
      if (!window.EyeDropper) {
        alert('Seu navegador não suporta o seletor de cores. Use o Chrome 95+ ou Edge 95+');
        return;
      }

      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      if (result?.sRGBHex) {
        // Converte hex para RGB
        const hex = result.sRGBHex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        const colorCard = {
          id: Date.now() + Math.random(),
          color: hex,
          rgb: `rgb(${r}, ${g}, ${b})`,
          timestamp: Date.now(),
          type: "color",
        };
        
        addImages([colorCard]);
      }
    } catch (error) {
      // Usuário cancelou ou erro
      console.log('Color picker cancelled or error:', error);
    }
  };

  return (
    <motion.div
      className={`sidebar-container ${isVisible ? "visible" : ""}`}
      initial={false}
      animate={{
        x: isVisible ? 0 : "100%",
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      style={{
        width: `${SIDEBAR_CONFIG.DEFAULT_WIDTH}px`,
      }}
    >
      {/* Floating Menu - Botão + Abas + Menu de Ações */}
      <FloatingMenu
        show={showButton}
        isVisible={isVisible}
        onToggleSidebar={() => setIsVisible(true)}
        onQuickPaste={handleQuickPaste}
        onNewNote={handleNewNote}
        onUploadImage={handleUploadImage}
        onColorPicker={handleColorPicker}
        onClear={clearCurrentTab}
        onClose={handleClose}
        tabs={tabs}
        currentTab={currentTab}
        onTabSwitch={switchTab}
      />



      <div
        className="sidebar-content"
        style={{ width: `${SIDEBAR_CONFIG.DEFAULT_WIDTH}px` }}
      >
        <DropZone
          images={images}
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onDeleteImage={deleteImage}
          onEditNote={handleEditNote}
          onReorder={reorderImages}
          isVisible={isVisible}
        />
      </div>
    </motion.div>
  );
};

export default Sidebar;
