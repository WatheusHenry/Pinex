const noteViewers = new Map();
let noteViewerCounter = 0;

export function createNoteViewer(note = null, onSave, onClose) {
  const viewerId = `note-viewer-${Date.now()}-${noteViewerCounter++}`;

  const container = document.createElement("div");
  container.id = viewerId;
  container.className = "floating-note-viewer";
  container.style.cssText = `
    all: initial;
    position: fixed;
    width: 400px;
    min-height: 300px;
    top: ${100 + noteViewerCounter * 30}px;
    left: ${100 + noteViewerCounter * 30}px;
    background: rgba(26, 26, 26, 0.98);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    cursor: move;
    opacity: 0;
    transform: scale(0.95) translateY(10px);
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  // Sempre usar modo escuro
  const isDarkMode = true;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    cursor: move;
  `;

  const title = document.createElement("h3");
  title.textContent = note ? "Editar Nota" : "Nova Nota";
  title.style.cssText = `
    margin: 0;
    margin-left: 10px;
    font-size: 18px;
    font-weight: 600;
    color: ${isDarkMode ? "#e0e0e0" : "#1a1a1a"};
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.style.cssText = `
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: ${isDarkMode ? "#999" : "#666"};
    font-size: 24px;
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.background = isDarkMode
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.05)";
    closeBtn.style.color = isDarkMode ? "#e0e0e0" : "#1a1a1a";
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = "transparent";
    closeBtn.style.color = isDarkMode ? "#999" : "#666";
  };
  const handleClose = () => {
    // Auto-salvar se houver conteúdo
    const content = contentTextarea.value.trim();
    if (content) {
      const noteData = {
        id: note?.id || Date.now() + Math.random(),
        title: "", // Sem título
        content: content,
        timestamp: note?.timestamp || Date.now(),
        type: "note",
      };
      if (onSave) onSave(noteData);
    }
    container.style.opacity = '0';
    container.style.transform = 'scale(0.95) translateY(10px)';
    setTimeout(() => {
      container.remove();
      noteViewers.delete(viewerId);
      if (onClose) onClose();
    }, 200);
  };

  closeBtn.onclick = handleClose;

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement("div");
  body.style.cssText = `
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
  `;

  // Content Textarea
  const contentTextarea = document.createElement("textarea");
  contentTextarea.placeholder = "Escreva sua nota aqui...";
  contentTextarea.value = note?.content || "";
  contentTextarea.style.cssText = `
    width: 100%;
    min-height: 300px;
    padding: 0 12px 12px 12px;
    border: none;
    border-radius: 0 0 1rem 1rem;
    background: rgba(0,0,0,0.02);
    color: #e9e9e9ff;
    font-size: 14px;
    line-height: 1.6;
    font-family: inherit;
    outline: none;
    resize: vertical;
    transition: all 0.2s ease;
    box-sizing: border-box;
  `;

  // Remover campo de título - apenas conteúdo
  body.appendChild(contentTextarea);

  // Função para salvar imediatamente
  const handleSave = () => {
    const content = contentTextarea.value.trim();
    if (content) {
      const noteData = {
        id: note?.id || Date.now() + Math.random(),
        title: "", // Sem título
        content: content,
        timestamp: note?.timestamp || Date.now(),
        type: "note",
      };
      if (onSave) onSave(noteData);
      container.style.opacity = '0';
      container.style.transform = 'scale(0.95) translateY(10px)';
      setTimeout(() => {
        container.remove();
        noteViewers.delete(viewerId);
      }, 200);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.ctrlKey && e.key === "Enter") {
      handleSave();
    }
  };

  contentTextarea.addEventListener("keydown", handleKeyDown);

  // Assemble
  container.appendChild(header);
  container.appendChild(body);
  // container.appendChild(footer);

  // Drag functionality
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  header.addEventListener("mousedown", (e) => {
    if (e.target === closeBtn || e.target.closest("button")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = container.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    container.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      container.style.left = `${startLeft + deltaX}px`;
      container.style.top = `${startTop + deltaY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      container.style.cursor = "move";
    }
  });

  // Add to DOM
  document.body.appendChild(container);
  
  // Trigger animation after DOM insertion
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.style.opacity = '1';
      container.style.transform = 'scale(1) translateY(0)';
    });
  });

  // Focus on content
  setTimeout(() => contentTextarea.focus(), 100);

  noteViewers.set(viewerId, container);

  return viewerId;
}
