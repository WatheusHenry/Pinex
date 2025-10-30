import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { VIEWER_CONFIG } from '../../constants';

const FloatingViewerWindow = ({ mediaUrl, mediaType = 'image', onClose, viewerId }) => {
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const [position, setPosition] = useState({
    x: 100 + (parseInt(viewerId?.split('-')[2] || 0) % 10) * 30,
    y: 100 + (parseInt(viewerId?.split('-')[2] || 0) % 10) * 30,
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [savedState, setSavedState] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [showControls, setShowControls] = useState(false);
  
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 });
  const aspectRatioRef = useRef(1);

  useEffect(() => {
    const loadMedia = () => {
      if (mediaType === 'video') {
        const video = document.createElement('video');
        video.src = mediaUrl;
        video.onloadedmetadata = () => {
          const dims = calculateDimensions(video.videoWidth || 640, video.videoHeight || 480);
          setDimensions(dims);
          aspectRatioRef.current = dims.width / dims.height;
        };
        video.onerror = () => {
          setDimensions({ width: 640, height: 480 });
          aspectRatioRef.current = 640 / 480;
        };
      } else {
        const img = new Image();
        img.src = mediaUrl;
        img.onload = () => {
          const dims = calculateDimensions(img.naturalWidth, img.naturalHeight);
          setDimensions(dims);
          aspectRatioRef.current = dims.width / dims.height;
        };
        img.onerror = () => {
          setDimensions({ width: 400, height: 300 });
          aspectRatioRef.current = 400 / 300;
        };
      }
    };

    loadMedia();
  }, [mediaUrl, mediaType]);

  const calculateDimensions = (naturalWidth, naturalHeight) => {
    const maxWidth = window.innerWidth * (VIEWER_CONFIG?.MAX_SCREEN_RATIO || 0.8);
    const maxHeight = window.innerHeight * (VIEWER_CONFIG?.MAX_SCREEN_RATIO || 0.8);
    let width = naturalWidth;
    let height = naturalHeight;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    width = Math.max(VIEWER_CONFIG?.MIN_WIDTH || 200, width);
    height = Math.max(VIEWER_CONFIG?.MIN_HEIGHT || 150, height);

    return { width, height };
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.className?.includes('resize-handle')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height,
      startLeft: position.x,
      startTop: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging && !isMinimized) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        
        setPosition({
          x: dragRef.current.startPosX + deltaX,
          y: dragRef.current.startPosY + deltaY,
        });
      }

      if (isResizing && resizeDirection && !isMinimized) {
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;

        let newWidth = resizeRef.current.startWidth;
        let newHeight = resizeRef.current.startHeight;
        let newX = resizeRef.current.startLeft;
        let newY = resizeRef.current.startTop;

        const aspectRatio = aspectRatioRef.current;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(VIEWER_CONFIG?.MIN_WIDTH || 200, resizeRef.current.startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(VIEWER_CONFIG?.MIN_WIDTH || 200, resizeRef.current.startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = resizeRef.current.startLeft + resizeRef.current.startWidth - newWidth;
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(VIEWER_CONFIG?.MIN_HEIGHT || 150, resizeRef.current.startHeight + deltaY);
          newWidth = newHeight * aspectRatio;
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(VIEWER_CONFIG?.MIN_HEIGHT || 150, resizeRef.current.startHeight - deltaY);
          newWidth = newHeight * aspectRatio;
          newY = resizeRef.current.startTop + resizeRef.current.startHeight - newHeight;
        }

        setDimensions({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDirection, isMinimized]);

  const handleMinimize = () => {
    if (!isMinimized) {
      setSavedState({ dimensions, position });
      setDimensions({ width: VIEWER_CONFIG?.MINIMIZED_SIZE || 100, height: VIEWER_CONFIG?.MINIMIZED_SIZE || 100 });
      setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
      setIsMinimized(true);
    } else {
      if (savedState) {
        setDimensions(savedState.dimensions);
        setPosition(savedState.position);
      }
      setIsMinimized(false);
    }
  };

  const resizeHandles = ['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w'];
  const getHandleStyle = (direction) => {
    const baseStyle = {
      position: 'absolute',
      opacity: showControls && !isMinimized ? 1 : 0,
      transition: 'opacity 0.2s',
      zIndex: 10,
    };

    const cursors = {
      se: 'nwse-resize', sw: 'nesw-resize', ne: 'nesw-resize', nw: 'nwse-resize',
      n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
    };

    const positions = {
      se: { bottom: 0, right: 0, width: '20px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '0 0 8px 0' },
      sw: { bottom: 0, left: 0, width: '20px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '0 0 0 8px' },
      ne: { top: 0, right: 0, width: '20px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '0 8px 0 0' },
      nw: { top: 0, left: 0, width: '20px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px 0 0 0' },
      n: { top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '8px', background: 'transparent' },
      s: { bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '8px', background: 'transparent' },
      e: { right: 0, top: '50%', transform: 'translateY(-50%)', width: '8px', height: '100%', background: 'transparent' },
      w: { left: 0, top: '50%', transform: 'translateY(-50%)', width: '8px', height: '100%', background: 'transparent' },
    };

    return { ...baseStyle, ...positions[direction], cursor: cursors[direction] };
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
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 999998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : isMinimized ? 'pointer' : 'move',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Media Element */}
      {mediaType === 'video' ? (
        <video
          src={mediaUrl}
          controls
          loop
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            pointerEvents: 'auto',
          }}
        />
      ) : (
        <img
          src={mediaUrl}
          alt="Floating viewer"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.2s',
          zIndex: 20,
        }}
      >
        <button
          onClick={handleMinimize}
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        >
          {isMinimized ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        >
          <svg
            width="14"
            height="14"
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
      </div>

      {/* Resize Handles */}
      {!isMinimized && resizeHandles.map((direction) => (
        <div
          key={direction}
          className={`resize-handle-${direction}`}
          style={getHandleStyle(direction)}
          onMouseDown={(e) => handleResizeStart(e, direction)}
        />
      ))}
    </motion.div>
  );
};

export default FloatingViewerWindow;
