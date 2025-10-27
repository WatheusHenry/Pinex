import { motion } from "framer-motion";
import NoteIcon from "/public/Note.png";
import ClipBoardIcon from "/public/ClipBoard.png";
import AddFromDeviceIcon from "/public/AddFromDevice.png";
import CleanerIcon from "/public/Cleaner.png";
import LeftArrowIcon from "/public/LeftArrow.png";

const ActionMenu = ({
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
        <img src={NoteIcon} alt="Nova nota" width="20" height="20" />
      </motion.button>

      <motion.button
        className="menu-item quick-paste-menu-item"
        onClick={onQuickPaste}
        title="Colar da área de transferência"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
      >
        <img src={ClipBoardIcon} alt="Colar" width="20" height="20" />
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
        <img src={AddFromDeviceIcon} alt="Carregar imagem" width="20" height="20" />
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
        <img src={CleanerIcon} alt="Limpar" width="20" height="20" />
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
        <img 
          src={LeftArrowIcon} 
          alt="Fechar" 
          width="20" 
          height="20"
          style={{ transform: "rotate(180deg)" }}
        />
      </motion.button>
    </>
  );
};

export default ActionMenu;
