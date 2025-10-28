import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const NoteViewerWindow = ({ note, onSave, onClose, viewerId }) => {
  const [content, setContent] = useState(note?.content || '');
  const [position, setPosition] = useState({
    x: 100 + (parseInt(viewerId?.split('-')[2] || 0) % 10) * 30,
    y: 100 + (parseInt(viewerId?.split('-')[2] || 0) % 10) * 30,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.tagName === 'TEXTAREA') return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: dragRef.current.startPosX + deltaX,
        y: dragRef.current.startPosY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleClose = () => {
    const trimmedContent = content.trim();
    if (trimmedContent) {
      const noteData = {
        id: note?.id || Date.now() + Math.random(),
        content: trimmedContent,
        timestamp: note?.timestamp || Date.now(),
        type: 'note',
      };
      onSave?.(noteData);
    }
    onClose?.();
  };

  const handleSave = () => {
    const trimmedContent = content.trim();
    if (trimmedContent) {
      const noteData = {
        id: note?.id || Date.now() + Math.random(),
        content: trimmedContent,
        timestamp: note?.timestamp || Date.now(),
        type: 'note',
      };
      onSave?.(noteData);
      onClose?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        minHeight: '300px',
        background: 'rgba(26, 26, 26, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          cursor: 'move',
        }}
      >
        <h3
          style={{
            margin: 0,
            marginLeft: '10px',
            fontSize: '18px',
            fontWeight: 600,
            color: '#e0e0e0',
          }}
        >
          {note ? 'Editar Nota' : 'Nova Nota'}
        </h3>
        <button
          onClick={handleClose}
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            color: '#999',
            fontSize: '24px',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#999';
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua nota aqui..."
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '0 12px 12px 12px',
            border: 'none',
            borderRadius: '0 0 1rem 1rem',
            background: 'rgba(0,0,0,0.02)',
            color: '#e9e9e9',
            fontSize: '14px',
            lineHeight: 1.6,
            fontFamily: 'inherit',
            outline: 'none',
            resize: 'vertical',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </motion.div>
  );
};

export default NoteViewerWindow;
