import { motion } from "framer-motion";
import Tooltip from "../common/Tooltip";
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
      <Tooltip text="Nova nota" position="right">
        <motion.button
          className="floating-menu-item"
          onClick={onNewNote}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
        >
          <img src={NoteIcon} alt="Nova nota" width="20" height="20" />
        </motion.button>
      </Tooltip>

      <Tooltip text="Colar da área de transferência" position="right">
        <motion.button
          className="floating-menu-item quick-paste-menu-item"
          onClick={onQuickPaste}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
        >
          <img src={ClipBoardIcon} alt="Colar" width="20" height="20" />
        </motion.button>
      </Tooltip>

      <Tooltip text="Carregar imagem do dispositivo" position="right">
        <motion.button
          className="floating-menu-item"
          onClick={onUploadImage}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
        >
          <img src={AddFromDeviceIcon} alt="Carregar imagem" width="20" height="20" />
        </motion.button>
      </Tooltip>

      <Tooltip text="Limpar imagens desta aba" position="right">
        <motion.button
          className="floating-menu-item"
          onClick={onClear}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
        >
          <img src={CleanerIcon} alt="Limpar" width="20" height="20" />
        </motion.button>
      </Tooltip>

      <Tooltip text="Fechar" position="right">
        <motion.button
          className="floating-menu-item"
          onClick={onClose}
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
      </Tooltip>
    </>
  );
};

export default ActionMenu;
