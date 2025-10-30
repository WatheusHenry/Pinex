import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftArrowIcon from "/public/LeftArrow.png";
import NoteIcon from "/public/Note.png";
import ClipBoardIcon from "/public/ClipBoard.png";
import AddFromDeviceIcon from "/public/AddFromDevice.png";
import CleanerIcon from "/public/Cleaner.png";

const FloatingMenu = ({
  show,
  isVisible,
  onToggleSidebar,
  onQuickPaste,
  onNewNote,
  onUploadImage,
  onClear,
  onClose,
}) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(50);

  useEffect(() => {
    const savedPosition = localStorage.getItem("toggleButtonPosition");
    if (savedPosition) {
      setPosition(parseFloat(savedPosition));
    }
  }, []);

  useEffect(() => {
    // Abrir menu quando sidebar abre, fechar quando fecha
    if (isVisible) {
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(false);
    }
  }, [isVisible]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartPosition.current = position;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaY = e.clientY - dragStartY.current;
      const deltaPercent = (deltaY / window.innerHeight) * 100;
      const newPosition = Math.max(
        5,
        Math.min(95, dragStartPosition.current + deltaPercent)
      );
      setPosition(newPosition);
    };

    const handleMouseUp = (e) => {
      setIsDragging(false);
      localStorage.setItem("toggleButtonPosition", position.toString());

      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const clickDistance = Math.abs(e.clientY - dragStartY.current);
        if (clickDistance < 5) {
          if (isVisible) {
            // Se sidebar está aberta, fechar tudo
            setIsMenuOpen(false);
            onClose();
          } else {
            // Se sidebar está fechada, abrir sidebar (menu abrirá automaticamente via useEffect)
            onToggleSidebar();
          }
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position, isVisible, isMenuOpen, onToggleSidebar]);

  const menuButtons = [
    {
      icon: NoteIcon,
      onClick: onNewNote,
      title: "Nova nota",
      alt: "Nova nota",
    },
    {
      icon: ClipBoardIcon,
      onClick: onQuickPaste,
      title: "Colar",
      alt: "Colar",
      className: "quick-paste-menu-item",
    },
    {
      icon: AddFromDeviceIcon,
      onClick: onUploadImage,
      title: "Carregar imagem",
      alt: "Carregar imagem",
    },
    { icon: CleanerIcon, onClick: onClear, title: "Limpar", alt: "Limpar" },
  ];

  if (!show && !isVisible) return null;

  return (
    <AnimatePresence>
      {(show || isVisible) && (
        <motion.div
          ref={buttonRef}
          className={`floating-menu-container ${isDragging ? "dragging" : ""} ${
            isMenuOpen ? "open" : ""
          }`}
          style={{ top: `${position}%` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            opacity: { duration: 0.2 },
            x: { type: "spring", damping: 25, stiffness: 300 },
            height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          {/* Botão Principal */}
          <motion.button
            className="floating-menu-toggle"
            onMouseDown={handleMouseDown}
            whileHover={{ scale: isMenuOpen ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 400 }}
          >
            <motion.img
              src={LeftArrowIcon}
              alt="Menu"
              animate={{
                rotate: isMenuOpen ? 180 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          {/* Menu de Ações */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="floating-menu-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuButtons.map((button, index) => (
                  <motion.button
                    key={index}
                    className={`floating-menu-item ${button.className || ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      button.onClick();
                    }}
                    title={button.title}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={button.icon}
                      alt={button.alt}
                      width="20"
                      height="20"
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingMenu;
