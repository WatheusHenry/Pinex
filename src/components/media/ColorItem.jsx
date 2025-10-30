import { motion } from "framer-motion";
import { useState } from "react";

const ColorItem = ({ color, onDelete, isVisible }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (isVisible) {
      navigator.clipboard.writeText(color.color);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className="color-item"
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div
        className="color-preview"
        style={{ background: color.color }}
      />
      <div className="color-info">
        <div className="color-hex">{color.color}</div>
        <div className="color-rgb">{color.rgb}</div>
        {copied && <div className="color-copied">Copiado!</div>}
      </div>
      <button
        className="color-delete"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(color.id);
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.5 5.5L11 11M11 11L5.5 16.5M11 11L16.5 16.5M11 11L5.5 5.5"
            stroke="white"
            strokeWidth="5.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default ColorItem;
