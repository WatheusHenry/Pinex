import React from 'react';
import { createRoot } from 'react-dom/client';
import NoteViewerWindow from '../components/windows/NoteViewerWindow';
import FloatingViewerWindow from '../components/windows/FloatingViewerWindow';

const activeWindows = new Map();
let windowCounter = 0;

export function createNoteViewerWindow(note = null, onSave, onClose) {
  const viewerId = `note-viewer-${Date.now()}-${windowCounter++}`;
  
  const container = document.createElement('div');
  container.id = viewerId;
  document.body.appendChild(container);

  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
    activeWindows.delete(viewerId);
    onClose?.();
  };

  root.render(
    React.createElement(NoteViewerWindow, {
      note,
      onSave,
      onClose: handleClose,
      viewerId
    })
  );

  activeWindows.set(viewerId, { root, container });
  return viewerId;
}

export function createFloatingViewerWindow(mediaUrl, mediaType = 'image') {
  const viewerId = `viewer-${Date.now()}-${windowCounter++}`;
  
  const container = document.createElement('div');
  container.id = viewerId;
  document.body.appendChild(container);

  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
    activeWindows.delete(viewerId);
  };

  root.render(
    React.createElement(FloatingViewerWindow, {
      mediaUrl,
      mediaType,
      onClose: handleClose,
      viewerId
    })
  );

  activeWindows.set(viewerId, { root, container });
  return viewerId;
}

export function closeWindow(viewerId) {
  const window = activeWindows.get(viewerId);
  if (window) {
    window.root.unmount();
    window.container.remove();
    activeWindows.delete(viewerId);
  }
}

export function closeAllWindows() {
  activeWindows.forEach((window, viewerId) => {
    window.root.unmount();
    window.container.remove();
  });
  activeWindows.clear();
}
