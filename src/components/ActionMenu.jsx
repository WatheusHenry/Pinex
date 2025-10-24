import { motion } from "framer-motion";

const ActionMenu = ({
  hasClipboardContent,
  onQuickPaste,
  onNewNote,
  onUploadImage,
  onClear,
  onClose,
}) => {
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <>
      <motion.button
        className="menu-item"
        onClick={onNewNote}
        title="Nova nota"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      <motion.button
        className={`menu-item quick-paste-menu-item ${
          !hasClipboardContent ? "disabled" : ""
        }`}
        onClick={hasClipboardContent ? onQuickPaste : undefined}
        title={
          hasClipboardContent
            ? "Colar da área de transferência"
            : "Nada para colar"
        }
        disabled={!hasClipboardContent}
        variants={buttonVariants}
        initial="initial"
        whileHover={hasClipboardContent ? "hover" : "initial"}
        whileTap={hasClipboardContent ? "tap" : "initial"}
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="8"
            y="2"
            width="8"
            height="4"
            rx="1"
            ry="1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      <motion.button
        className="menu-item"
        onClick={onUploadImage}
        title="Carregar imagem do dispositivo"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      <motion.button
        className="menu-item"
        onClick={onClear}
        title="Limpar imagens desta aba"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      <motion.button
        className="menu-item"
        onClick={onClose}
        title="Fechar"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </>
  );
};

export default ActionMenu;
