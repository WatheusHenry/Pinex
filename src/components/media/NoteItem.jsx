import { motion } from "framer-motion";

const NoteItem = ({ note, onEdit, onDelete, isVisible }) => {
  const handleClick = () => {
    if (isVisible) {
      onEdit(note);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Hoje";
    } else if (days === 1) {
      return "Ontem";
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <motion.div
      className="note-item"
      onTap={handleClick}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <p className="note-item-content">{note.content}</p>

      <div className="note-item-footer">
        <span className="note-item-date">{formatDate(note.timestamp)}</span>
      </div>

      <button
        className="note-item-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
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
            stroke-width="5.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default NoteItem;
