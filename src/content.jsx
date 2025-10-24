import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./content.css";

const Sidebar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageUrl, setDraggedImageUrl] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [width, setWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [hasClipboardContent, setHasClipboardContent] = useState(false);
  const [clipboardPreview, setClipboardPreview] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [currentTab, setCurrentTab] = useState("tab1");
  const [tabs, setTabs] = useState({
    tab1: { name: "🎨 Aba 1", images: [] },
    tab2: { name: "📸 Aba 2", images: [] },
    tab3: { name: "🌟 Aba 3", images: [] },
  });

  useEffect(() => {
    // Carregar abas e imagens do chrome.storage
    const loadData = () => {
      chrome.storage.local.get(["sidebarTabs", "currentTab"], (result) => {
        const loadedTabs = result.sidebarTabs || {
          tab1: { name: "🎨 Aba 1", images: [] },
          tab2: { name: "📸 Aba 2", images: [] },
          tab3: { name: "🌟 Aba 3", images: [] },
        };
        const loadedCurrentTab = result.currentTab || "tab1";

        setTabs(loadedTabs);
        setCurrentTab(loadedCurrentTab);
        setImages(loadedTabs[loadedCurrentTab]?.images || []);

        console.log("Dados carregados - Aba atual:", loadedCurrentTab);
      });
    };

    loadData();

    // Recarregar quando a aba fica visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Aba ficou visível, recarregando dados");
        loadData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Recarregar quando a janela ganha foco
    const handleFocus = () => {
      console.log("Janela ganhou foco, recarregando dados");
      loadData();
    };

    window.addEventListener("focus", handleFocus);

    // Listener para mudanças no storage (sincronização automática)
    const storageListener = (changes, area) => {
      if (area === "local" && changes.sidebarTabs) {
        console.log("Storage atualizado externamente");
        const newTabs = changes.sidebarTabs.newValue;
        if (newTabs) {
          setTabs(newTabs);
        }
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    // Listener para mensagens
    const messageListener = (message) => {
      if (message.action === "toggleSidebar") {
        setIsVisible((prev) => !prev);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Detectar se o site usa modo escuro
    const detectDarkMode = () => {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const htmlBg = window.getComputedStyle(
        document.documentElement
      ).backgroundColor;

      const getBrightness = (color) => {
        const rgb = color.match(/\d+/g);
        if (!rgb) return 255;
        const [r, g, b] = rgb.map(Number);
        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      const bodyBrightness = getBrightness(bodyBg);
      const htmlBrightness = getBrightness(htmlBg);
      const brightness = Math.min(bodyBrightness, htmlBrightness);

      setIsDarkMode(brightness < 128);
    };

    detectDarkMode();

    // Observar mudanças no tema
    const observer = new MutationObserver(detectDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    // Capturar elemento sendo arrastado globalmente
    const handleGlobalDragStart = (e) => {
      const target = e.target;
      let imageUrl = null;

      const findImageUrl = (element) => {
        // Caso 1: Elemento <img>
        if (element.tagName === "IMG") {
          return element.src || element.currentSrc;
        }

        // Caso 2: Elemento com background-image inline
        if (element.style.backgroundImage) {
          const match = element.style.backgroundImage.match(
            /url\(["']?([^"')]+)["']?\)/
          );
          if (match) return match[1];
        }

        // Caso 3: Verificar computed styles para background-image
        const computedStyle = window.getComputedStyle(element);
        const bgImage = computedStyle.backgroundImage;
        if (bgImage && bgImage !== "none") {
          const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
          if (match) return match[1];
        }

        // Caso 4: Procurar todas as imagens dentro do elemento (incluindo nested)
        const allImages = element.querySelectorAll("img");
        for (const img of allImages) {
          const src = img.src || img.currentSrc;
          // Filtrar imagens pequenas (ícones, avatares) e pegar a maior
          if (src && !src.includes("profile") && !src.includes("avatar")) {
            return src;
          }
        }

        // Caso 5: Se ainda não achou, pegar qualquer imagem
        if (allImages.length > 0) {
          return allImages[0].src || allImages[0].currentSrc;
        }

        return null;
      };

      // Tentar no elemento clicado
      imageUrl = findImageUrl(target);

      // Se não achou, procurar nos pais (até 10 níveis para Twitter)
      if (!imageUrl) {
        let parent = target.parentElement;
        let depth = 0;
        while (parent && depth < 10) {
          imageUrl = findImageUrl(parent);
          if (imageUrl) break;
          parent = parent.parentElement;
          depth++;
        }
      }

      if (imageUrl) {
        console.log("Imagem capturada:", imageUrl);
        setDraggedImageUrl(imageUrl);
      }
    };

    document.addEventListener("dragstart", handleGlobalDragStart);

    // Carregar largura salva
    chrome.storage.local.get(["sidebarWidth"], (result) => {
      if (result.sidebarWidth) {
        setWidth(result.sidebarWidth);
      }
    });

    // Detectar proximidade do mouse na lateral direita
    const handleMouseMove = (e) => {
      const distanceFromRight = window.innerWidth - e.clientX;
      // Mostrar botão quando o mouse está a menos de 50px da borda direita
      setShowButton(distanceFromRight < 80);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      observer.disconnect();
      document.removeEventListener("dragstart", handleGlobalDragStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("mousemove", handleMouseMove);
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  // Verificar clipboard quando a sidebar é aberta
  useEffect(() => {
    if (isVisible) {
      checkClipboard();

      // Verificar periodicamente enquanto a sidebar está aberta
      const interval = setInterval(checkClipboard, 2000);
      return () => clearInterval(interval);
    } else {
      setHasClipboardContent(false);
      setClipboardPreview(null);
    }
  }, [isVisible]);

  // Resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      chrome.storage.local.set({ sidebarWidth: width });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, width]);

  const addNewImages = (newImages) => {
    const updatedImages = [...newImages, ...images];
    const updatedTabs = {
      ...tabs,
      [currentTab]: {
        ...tabs[currentTab],
        images: updatedImages,
      },
    };

    setImages(updatedImages);
    setTabs(updatedTabs);
    chrome.storage.local.set({ sidebarTabs: updatedTabs }, () => {
      console.log("Imagens salvas na aba:", currentTab, updatedImages.length);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const newImages = [];

    // Prioridade 1: Usar a URL capturada no dragstart
    if (draggedImageUrl) {
      const isVideo = draggedImageUrl.match(/\.(mp4|webm|mov|avi)(\?|$)/i);

      // Aceitar qualquer URL capturada do dragstart (já foi validada como imagem/vídeo)
      newImages.push({
        id: Date.now() + Math.random(),
        url: draggedImageUrl,
        timestamp: Date.now(),
        type: isVideo ? "video" : "image",
      });
      setDraggedImageUrl(null);
    }

    // Prioridade 2: Tentar pegar URL de mídia do dataTransfer
    if (newImages.length === 0) {
      const mediaUrl =
        e.dataTransfer.getData("text/uri-list") ||
        e.dataTransfer.getData("text/html") ||
        e.dataTransfer.getData("text/plain");

      if (mediaUrl) {
        let url = mediaUrl;

        // Extrair URL do HTML se necessário
        if (mediaUrl.includes("<img") || mediaUrl.includes("<video")) {
          const match = mediaUrl.match(/src=["']([^"']+)["']/);
          if (match) url = match[1];
        }

        // Verificar se é uma URL válida
        if (
          url &&
          (url.startsWith("http") ||
            url.startsWith("data:") ||
            url.startsWith("blob:"))
        ) {
          const isVideo = url.match(/\.(mp4|webm|mov|avi)(\?|$)/i);

          // Se veio de um elemento img/video ou é data/blob, aceitar
          // Se tem extensão de vídeo, marcar como vídeo
          newImages.push({
            id: Date.now() + Math.random(),
            url: url,
            timestamp: Date.now(),
            type: isVideo ? "video" : "image",
          });
        }
      }
    }

    // Prioridade 3: Tentar pegar arquivos de mídia
    if (newImages.length === 0) {
      const items = Array.from(e.dataTransfer.items);
      for (const item of items) {
        if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();

            await new Promise((resolve) => {
              reader.onload = (event) => {
                newImages.push({
                  id: Date.now() + Math.random(),
                  url: event.target.result,
                  timestamp: Date.now(),
                  type: item.type.startsWith("video/") ? "video" : "image",
                });
                resolve();
              };
              reader.readAsDataURL(file);
            });
          }
        }
      }
    }

    if (newImages.length > 0) {
      console.log("Adicionando novas imagens:", newImages.length);
      addNewImages(newImages);
    }
  };

  const handleDeleteImage = (id) => {
    const updatedImages = images.filter((img) => img.id !== id);
    const updatedTabs = {
      ...tabs,
      [currentTab]: {
        ...tabs[currentTab],
        images: updatedImages,
      },
    };

    setImages(updatedImages);
    setTabs(updatedTabs);
    chrome.storage.local.set({ sidebarTabs: updatedTabs }, () => {
      console.log("Imagem deletada, total:", updatedImages.length);
    });
  };

  const switchTab = (tabId) => {
    if (tabId === currentTab) return;

    console.log("Trocando para aba:", tabId);
    setCurrentTab(tabId);
    setImages(tabs[tabId]?.images || []);
    chrome.storage.local.set({ currentTab: tabId });
  };

  const handlePaste = async (e) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    const newImages = [];

    // Tentar pegar texto (URL) da área de transferência
    const text = clipboardData.getData("text");
    if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
      // Verificar se é uma URL de mídia (imagem, vídeo ou GIF)
      const mediaExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".bmp",
        ".mp4",
        ".webm",
        ".mov",
        ".avi",
      ];
      const isMediaUrl = mediaExtensions.some((ext) =>
        text.toLowerCase().includes(ext)
      );

      // Detectar tipo de mídia
      const isVideo = text.match(/\.(mp4|webm|mov|avi)(\?|$)/i);

      // Se tem extensão de mídia conhecida, adicionar
      if (isMediaUrl) {
        newImages.push({
          id: Date.now() + Math.random(),
          url: text,
          timestamp: Date.now(),
          type: isVideo ? "video" : "image",
        });
      }
    }

    // Tentar pegar arquivos de mídia da área de transferência
    if (newImages.length === 0) {
      const items = Array.from(clipboardData.items);
      for (const item of items) {
        if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = (event) => {
                newImages.push({
                  id: Date.now() + Math.random(),
                  url: event.target.result,
                  timestamp: Date.now(),
                  type: item.type.startsWith("video/") ? "video" : "image",
                });
                resolve();
              };
              reader.readAsDataURL(file);
            });
          }
        }
      }
    }

    if (newImages.length > 0) {
      console.log("Imagens coladas:", newImages.length);
      addNewImages(newImages);
      setHasClipboardContent(false);
      setClipboardPreview(null);
    }
  };

  const checkClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        // Verificar se tem imagem
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const url = URL.createObjectURL(blob);
            setHasClipboardContent(true);
            setClipboardPreview(url);
            return;
          }
        }
      }

      // Verificar se tem texto (URL)
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
        setHasClipboardContent(true);
        setClipboardPreview(text);
        return;
      }

      setHasClipboardContent(false);
      setClipboardPreview(null);
    } catch (err) {
      // Permissão negada ou erro
      console.log("Não foi possível acessar clipboard:", err);
      setHasClipboardContent(false);
      setClipboardPreview(null);
    }
  };

  const handleQuickPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const newImages = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = (event) => {
                newImages.push({
                  id: Date.now() + Math.random(),
                  url: event.target.result,
                  timestamp: Date.now(),
                });
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          }
        }
      }

      // Se não encontrou imagem, tentar texto
      if (newImages.length === 0) {
        const text = await navigator.clipboard.readText();
        if (
          text &&
          (text.startsWith("http://") || text.startsWith("https://"))
        ) {
          newImages.push({
            id: Date.now() + Math.random(),
            url: text,
            timestamp: Date.now(),
          });
        }
      }

      if (newImages.length > 0) {
        console.log("Colagem rápida:", newImages.length);
        addNewImages(newImages);
        setHasClipboardContent(false);
        setClipboardPreview(null);
      }
    } catch (err) {
      console.error("Erro ao colar:", err);
    }
  };

  return (
    <div
      className={`sidebar-container ${isVisible ? "visible" : ""} ${
        isDarkMode ? "dark" : "light"
      }`}
      style={{
        transform: isVisible ? "translateX(0)" : `translateX(${width + 10}px)`,
        width: `${width}px`,
      }}
    >
      {isVisible && (
        <div className="resize-handle" onMouseDown={handleResizeStart} />
      )}

      {!isVisible ? (
        <button
          className={`sidebar-toggle ${showButton ? "show" : ""}`}
          onClick={() => setIsVisible(true)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className={`sidebar-menu ${isClosing ? "closing" : ""}`}>
          {Object.entries(tabs).map(([tabId, tab]) => (
            <button
              key={tabId}
              className={`menu-item tab-menu-item ${
                currentTab === tabId ? "active" : ""
              }`}
              onClick={() => switchTab(tabId)}
              title={tab.name}
            >
              <span style={{ fontSize: "20px" }}>{tab.name.split(" ")[0]}</span>
            </button>
          ))}

          <div className="menu-divider"></div>

          <button
            className={`menu-item quick-paste-menu-item ${
              !hasClipboardContent ? "disabled" : ""
            }`}
            onClick={hasClipboardContent ? handleQuickPaste : undefined}
            title={
              hasClipboardContent
                ? "Colar da área de transferência"
                : "Nada para colar"
            }
            disabled={!hasClipboardContent}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
          </button>

          <button
            className="menu-item"
            onClick={() => {
              const updatedTabs = {
                ...tabs,
                [currentTab]: {
                  ...tabs[currentTab],
                  images: [],
                },
              };
              setImages([]);
              setTabs(updatedTabs);
              chrome.storage.local.set({ sidebarTabs: updatedTabs });
            }}
            title="Limpar imagens desta aba"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className="menu-item"
            onClick={() => {
              setIsClosing(true);
              setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
              }, 100);
            }}
            title="Fechar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="sidebar-content" style={{ width: `${width}px` }}>
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
        >
          {images.length === 0 ? (
            <div className="empty-state">
              <svg
                className="empty-state-icon"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path
                  d="M21 15L16 10L5 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L17 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>Arraste imagens, vídeos ou GIFs aqui</p>
            </div>
          ) : (
            <div className="image-grid">
              {images.map((image) => (
                <div key={image.id} className="image-item">
                  {image.type === "video" ? (
                    <video
                      src={image.url}
                      onClick={() =>
                        isVisible &&
                        window.createFloatingViewer(image.url, image.type)
                      }
                      style={{
                        cursor: isVisible ? "pointer" : "default",
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={image.url}
                      alt="Saved"
                      onClick={() =>
                        isVisible &&
                        window.createFloatingViewer(image.url, image.type)
                      }
                      style={{ cursor: isVisible ? "pointer" : "default" }}
                    />
                  )}
                  <button
                    className="image-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <div
          className="image-preview-modal"
          onClick={() => setPreviewImage(null)}
        >
          <div className="image-preview-actions">
            <button
              className="image-preview-action"
              onClick={(e) => {
                e.stopPropagation();
                window.open(previewImage, "_blank");
              }}
              title="Abrir em nova aba"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="image-preview-action"
              onClick={() => setPreviewImage(null)}
              title="Fechar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="image-preview-content">
            <img
              src={previewImage}
              alt="Preview"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Sistema de viewers flutuantes (direto no DOM)
const viewers = new Map();
let viewerCounter = 0;

function createFloatingViewer(mediaUrl, mediaType = "image") {
  const viewerId = `viewer-${Date.now()}-${viewerCounter++}`;

  const createViewer = (width, height) => {
    // Criar container
    const container = document.createElement("div");
    container.id = viewerId;
    container.className = "floating-viewer";
    container.style.cssText = `
      all: initial;
      position: fixed;
      width: ${width}px;
      height: ${height}px;
      top: ${100 + viewerCounter * 30}px;
      left: ${100 + viewerCounter * 30}px;
      background: rgba(20, 20, 20, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      cursor: move;
    `;

    // Mídia (imagem ou vídeo)
    let mediaElement;
    if (mediaType === "video") {
      mediaElement = document.createElement("video");
      mediaElement.src = mediaUrl;
      mediaElement.controls = true;
      mediaElement.loop = true;
      mediaElement.style.cssText =
        "max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px; pointer-events: auto;";
    } else {
      mediaElement = document.createElement("img");
      mediaElement.src = mediaUrl;
      mediaElement.style.cssText =
        "max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px; pointer-events: none;";
    }
    container.appendChild(mediaElement);

    // Estado de minimização
    let isMinimized = false;
    let savedWidth = width;
    let savedHeight = height;
    let savedLeft = 100 + viewerCounter * 30;
    let savedTop = 100 + viewerCounter * 30;

    // Botões flutuantes
    const actions = document.createElement("div");
    actions.style.cssText =
      "position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.2s; z-index: 20;";

    const minimizeBtn = document.createElement("button");
    minimizeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    minimizeBtn.style.cssText =
      "width: 24px; height: 24px; border: none; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); color: white; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;";
    minimizeBtn.onmouseenter = () =>
      (minimizeBtn.style.background = "rgba(0,0,0,0.9)");
    minimizeBtn.onmouseleave = () =>
      (minimizeBtn.style.background = "rgba(0,0,0,0.7)");
    minimizeBtn.onclick = (e) => {
      e.stopPropagation();

      if (!isMinimized) {
        // Salvar estado atual
        savedWidth = parseInt(container.style.width);
        savedHeight = parseInt(container.style.height);
        savedLeft = parseInt(container.style.left);
        savedTop = parseInt(container.style.top);

        // Minimizar
        container.style.width = "120px";
        container.style.height = "120px";
        container.style.bottom = "20px";
        container.style.right = "20px";
        container.style.top = "auto";
        container.style.left = "auto";
        container.style.cursor = "pointer";

        // Esconder resize handles
        Object.values(resizeHandleElements).forEach((handle) => {
          handle.style.display = "none";
        });

        minimizeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        isMinimized = true;
      } else {
        // Restaurar
        container.style.width = `${savedWidth}px`;
        container.style.height = `${savedHeight}px`;
        container.style.left = `${savedLeft}px`;
        container.style.top = `${savedTop}px`;
        container.style.bottom = "auto";
        container.style.right = "auto";
        container.style.cursor = "move";

        // Mostrar resize handles
        Object.values(resizeHandleElements).forEach((handle) => {
          handle.style.display = "block";
        });

        minimizeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        isMinimized = false;
      }
    };

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    closeBtn.style.cssText =
      "width: 24px; height: 24px; border: none; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); color: white; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;";
    closeBtn.onmouseenter = () =>
      (closeBtn.style.background = "rgba(0,0,0,0.9)");
    closeBtn.onmouseleave = () =>
      (closeBtn.style.background = "rgba(0,0,0,0.7)");
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      container.remove();
      viewers.delete(viewerId);
    };

    actions.appendChild(minimizeBtn);
    actions.appendChild(closeBtn);
    container.appendChild(actions);

    // Mostrar botões ao passar o mouse
    container.onmouseenter = () => (actions.style.opacity = "1");
    container.onmouseleave = () => (actions.style.opacity = "0");

    // Resize handles (8 direções)
    const resizeHandles = {
      se: { cursor: "nwse-resize", position: "bottom: 0; right: 0;" },
      sw: { cursor: "nesw-resize", position: "bottom: 0; left: 0;" },
      ne: { cursor: "nesw-resize", position: "top: 0; right: 0;" },
      nw: { cursor: "nwse-resize", position: "top: 0; left: 0;" },
      n: {
        cursor: "ns-resize",
        position: "top: 0; left: 50%; transform: translateX(-50%);",
      },
      s: {
        cursor: "ns-resize",
        position: "bottom: 0; left: 50%; transform: translateX(-50%);",
      },
      e: {
        cursor: "ew-resize",
        position: "right: 0; top: 50%; transform: translateY(-50%);",
      },
      w: {
        cursor: "ew-resize",
        position: "left: 0; top: 50%; transform: translateY(-50%);",
      },
    };

    const resizeHandleElements = {};

    Object.entries(resizeHandles).forEach(([direction, config]) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle-${direction}`;
      const size = ["n", "s", "e", "w"].includes(direction) ? "100%" : "20px";
      const width = ["n", "s"].includes(direction)
        ? "100%"
        : ["e", "w"].includes(direction)
        ? "8px"
        : size;
      const height = ["e", "w"].includes(direction)
        ? "100%"
        : ["n", "s"].includes(direction)
        ? "8px"
        : size;

      handle.style.cssText = `
      position: absolute;
      ${config.position}
      width: ${width};
      height: ${height};
      cursor: ${config.cursor};
      background: ${
        ["n", "s", "e", "w"].includes(direction)
          ? "transparent"
          : "rgba(255,255,255,0.2)"
      };
      border-radius: ${
        direction === "se"
          ? "0 0 8px 0"
          : direction === "sw"
          ? "0 0 0 8px"
          : direction === "ne"
          ? "0 8px 0 0"
          : direction === "nw"
          ? "8px 0 0 0"
          : "0"
      };
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
    `;
      container.appendChild(handle);
      resizeHandleElements[direction] = handle;
    });

    // Mostrar resize handles ao passar o mouse
    container.onmouseenter = () => {
      actions.style.opacity = "1";
      Object.values(resizeHandleElements).forEach(
        (handle) => (handle.style.opacity = "1")
      );
    };
    container.onmouseleave = () => {
      actions.style.opacity = "0";
      Object.values(resizeHandleElements).forEach(
        (handle) => (handle.style.opacity = "0")
      );
    };

    document.body.appendChild(container);

    // Drag functionality
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    container.addEventListener("mousedown", (e) => {
      // Não arrastar se clicar nos botões ou resize handles
      if (
        e.target.tagName === "BUTTON" ||
        e.target.className.startsWith("resize-handle-") ||
        e.target.closest("button")
      ) {
        return;
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging && !isMinimized) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        container.style.left = `${startLeft + deltaX}px`;
        container.style.top = `${startTop + deltaY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Resize functionality para todas as direções
    let isResizing = false;
    let resizeDirection = null;
    let startWidth, startHeight;

    Object.entries(resizeHandleElements).forEach(([direction, handle]) => {
      handle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        isResizing = true;
        resizeDirection = direction;
        startX = e.clientX;
        startY = e.clientY;
        const rect = container.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
      });
    });

    document.addEventListener("mousemove", (e) => {
      if (isResizing && resizeDirection && !isMinimized) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        // Calcular novas dimensões baseado na direção
        if (resizeDirection.includes("e")) {
          newWidth = Math.max(200, startWidth + deltaX);
        }
        if (resizeDirection.includes("w")) {
          newWidth = Math.max(200, startWidth - deltaX);
          if (newWidth > 200) newLeft = startLeft + deltaX;
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(150, startHeight + deltaY);
        }
        if (resizeDirection.includes("n")) {
          newHeight = Math.max(150, startHeight - deltaY);
          if (newHeight > 150) newTop = startTop + deltaY;
        }

        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isResizing = false;
      resizeDirection = null;
    });

    viewers.set(viewerId, container);
  };

  // Obter dimensões baseado no tipo de mídia
  if (mediaType === "video") {
    const tempVideo = document.createElement("video");
    tempVideo.src = mediaUrl;
    tempVideo.onloadedmetadata = () => {
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      let width = tempVideo.videoWidth || 640;
      let height = tempVideo.videoHeight || 480;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      width = Math.max(400, width);
      height = Math.max(300, height);

      createViewer(width, height);
    };
    tempVideo.onerror = () => {
      createViewer(640, 480);
    };
  } else {
    const tempImg = new Image();
    tempImg.src = mediaUrl;
    tempImg.onload = () => {
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      let width = tempImg.naturalWidth;
      let height = tempImg.naturalHeight;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      width = Math.max(200, width);
      height = Math.max(150, height);

      createViewer(width, height);
    };
    tempImg.onerror = () => {
      createViewer(400, 300);
    };
  }

  return viewerId;
}

const init = () => {
  const container = document.createElement("div");
  container.id = "chrome-sidebar-root";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<Sidebar />);

  // Expor função globalmente para criar viewers
  window.createFloatingViewer = createFloatingViewer;
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
