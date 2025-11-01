import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TabMenu from "./TabMenu";
import { FLOATING_MENU_CONFIG } from "../../constants";
import LeftArrowIcon from "/public/LeftArrow.png";
import NoteIcon from "/public/Note.png";
import ClipBoardIcon from "/public/ClipBoard.png";
import AddFromDeviceIcon from "/public/AddFromDevice.png";
import ColorPickerIcon from "/public/ColorPicker.png";
import CleanerIcon from "/public/Cleaner.png";

const FloatingMenu = ({
  show,
  isVisible,
  onToggleSidebar,
  onQuickPaste,
  onNewNote,
  onUploadImage,
  onColorPicker,
  onClear,
  onClose,
  tabs,
  currentTab,
  onTabSwitch,
}) => {
  const [position, setPosition] = useState(FLOATING_MENU_CONFIG.DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const [isAtLimit, setIsAtLimit] = useState(false);
  const buttonRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(FLOATING_MENU_CONFIG.DEFAULT_POSITION);
  const limitTimeoutRef = useRef(null);

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

  useEffect(() => {
    // Atualizar altura do menu quando ele abre/fecha
    if (buttonRef.current) {
      const height = buttonRef.current.offsetHeight;
      setMenuHeight(height);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    // Ajustar posição quando a janela é redimensionada
    const handleResize = () => {
      if (buttonRef.current) {
        const height = buttonRef.current.offsetHeight;
        setMenuHeight(height);
        
        // Recalcular limites
        const menuHeightPercent = (height / window.innerHeight) * 100;
        const topMarginPercent = (FLOATING_MENU_CONFIG.MIN_MARGIN_TOP / window.innerHeight) * 100;
        const bottomMarginPercent = (FLOATING_MENU_CONFIG.MIN_MARGIN_BOTTOM / window.innerHeight) * 100;
        
        const minPosition = Math.max(topMarginPercent, menuHeightPercent / 2);
        const maxPosition = Math.min(100 - bottomMarginPercent, 100 - menuHeightPercent / 2);
        
        // Ajustar posição se estiver fora dos limites
        setPosition((prev) => Math.max(minPosition, Math.min(maxPosition, prev)));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (limitTimeoutRef.current) clearTimeout(limitTimeoutRef.current);
    };
  }, [menuHeight]);

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
      
      // Calcular limites dinâmicos baseados na altura do menu e margens
      const menuHeightPercent = (menuHeight / window.innerHeight) * 100;
      const topMarginPercent = (FLOATING_MENU_CONFIG.MIN_MARGIN_TOP / window.innerHeight) * 100;
      const bottomMarginPercent = (FLOATING_MENU_CONFIG.MIN_MARGIN_BOTTOM / window.innerHeight) * 100;
      
      const minPosition = Math.max(topMarginPercent, menuHeightPercent / 2);
      const maxPosition = Math.min(100 - bottomMarginPercent, 100 - menuHeightPercent / 2);
      
      const desiredPosition = dragStartPosition.current + deltaPercent;
      const newPosition = Math.max(minPosition, Math.min(maxPosition, desiredPosition));
      
      // Detectar se atingiu um limite
      const hitLimit = desiredPosition < minPosition || desiredPosition > maxPosition;
      if (hitLimit && !isAtLimit) {
        setIsAtLimit(true);
        if (limitTimeoutRef.current) clearTimeout(limitTimeoutRef.current);
        limitTimeoutRef.current = setTimeout(() => setIsAtLimit(false), 300);
      }
      
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
            setIsMenuOpen(false);       
            setTimeout(() => onClose(), 200); 
          } else {
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
    {
      icon: ColorPickerIcon,
      onClick: onColorPicker,
      title: "Selecionar cor",
      alt: "Selecionar cor",
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
          } ${isAtLimit ? "at-limit" : ""}`}
          style={{ top: `${position}%` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: isMenuOpen ? 1 : (show && !isVisible) ? 1 : 0,
            x: 0,
            right: isVisible ? "calc(15rem + 2rem)" : "1rem",
          }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.2,
            opacity: {
              duration: 0.2,
              ease: "easeOut",
            },
            right: {
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
            },
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  height: {
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  opacity: {
                    duration: 0.2,
                  },
                }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: {
                        duration: 0.15,
                      },
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

          {/* Divisor */}
          {isMenuOpen && <div className="menu-divider"></div>}

          {/* Menu de Abas */}
          <AnimatePresence>
            {isMenuOpen && tabs && (
              <motion.div
                className="floating-menu-tabs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  height: {
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  },
                  opacity: {
                    duration: 0.2,
                  },
                }}
              >
                <TabMenu
                  tabs={tabs}
                  currentTab={currentTab}
                  onTabSwitch={onTabSwitch}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingMenu;
