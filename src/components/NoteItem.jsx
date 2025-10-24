import React from "react";

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
    <div className="note-item" onClick={handleClick}>
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
        ×
      </button>
    </div>
  );
};

export default NoteItem;
