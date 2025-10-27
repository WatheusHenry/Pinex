import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftArrowIcon from "/public/LeftArrow.png";

const ToggleButton = ({ show, onClick }) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(50);

  useEffect(() => {
    const savedPosition = localStorage.getItem("toggleButtonPosition");
    if (savedPosition) {
      setPosition(parseFloat(savedPosition));
    }
  }, []);

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
          onClick();
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position, onClick]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          ref={buttonRef}
          className={`sidebar-toggle show ${isDragging ? "dragging" : ""}`}
          onMouseDown={handleMouseDown}
          style={{ top: `${position}%` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
        >
          <img src={LeftArrowIcon} alt="leftArrow" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ToggleButton;
