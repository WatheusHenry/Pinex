import { useState, useEffect, useRef } from "react";
import { DEFAULT_TABS, STORAGE_KEYS } from "../constants";
import { createSyncChannel } from "../db";

export const useSidebarState = () => {
  const [currentTab, setCurrentTab] = useState("tab1");
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [images, setImages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const syncChannelRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const initPromiseRef = useRef(null);

  useEffect(() => {
    // Criar canal de sincronização
    syncChannelRef.current = createSyncChannel();

    const initializeExtension = async () => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          setIsInitialized(true);
          return;
        }

        chrome.storage.local.get([STORAGE_KEYS.SIDEBAR_TABS, STORAGE_KEYS.CURRENT_TAB], (result) => {
          if (chrome.runtime.lastError) {
            console.warn("Chrome storage error:", chrome.runtime.lastError);
            setIsInitialized(true);
            return;
          }
          
          const loadedTabs = result[STORAGE_KEYS.SIDEBAR_TABS] || DEFAULT_TABS;
          const loadedCurrentTab = result[STORAGE_KEYS.CURRENT_TAB] || "tab1";

          // Se não há dados salvos, salvar dados padrão
          if (!result[STORAGE_KEYS.SIDEBAR_TABS]) {
            chrome.storage.local.set({ 
              [STORAGE_KEYS.SIDEBAR_TABS]: DEFAULT_TABS,
              [STORAGE_KEYS.CURRENT_TAB]: "tab1"
            });
          }

          setTabs(loadedTabs);
          setCurrentTab(loadedCurrentTab);
          setImages(loadedTabs[loadedCurrentTab]?.images || []);
          setIsInitialized(true);
        });
      } catch (error) {
        console.warn("Error initializing extension:", error);
        setIsInitialized(true);
      }
    };

    const loadData = () => {
      try {
        if (!chrome.runtime?.id) {
          console.warn("Extension context invalidated");
          return;
        }
        
        chrome.storage.local.get([STORAGE_KEYS.SIDEBAR_TABS, STORAGE_KEYS.CURRENT_TAB], (result) => {
          if (chrome.runtime.lastError) {
            console.warn("Chrome storage error:", chrome.runtime.lastError);
            return;
          }
          
          const loadedTabs = result[STORAGE_KEYS.SIDEBAR_TABS] || DEFAULT_TABS;
          const loadedCurrentTab = result[STORAGE_KEYS.CURRENT_TAB] || "tab1";

          setTabs(loadedTabs);
          setCurrentTab(loadedCurrentTab);
          setImages(loadedTabs[loadedCurrentTab]?.images || []);
        });
      } catch (error) {
        console.warn("Error loading data:", error);
      }
    };

    // Inicializar apenas uma vez
    if (!initPromiseRef.current) {
      initPromiseRef.current = initializeExtension();
    }

    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn("Initialization timeout, forcing initialization");
        setIsInitialized(true);
      }
    }, 2000);

    const handleVisibilityChange = () => {
      if (!document.hidden && isInitialized) {
        loadData();
      }
    };

    const handleFocus = () => {
      if (isInitialized) {
        loadData();
      }
    };

    // Listener para mudanças no storage
    const storageListener = (changes, area) => {
      try {
        if (area === "local" && changes[STORAGE_KEYS.SIDEBAR_TABS]) {
          const newTabs = changes[STORAGE_KEYS.SIDEBAR_TABS].newValue;
          if (newTabs && !isUpdatingRef.current) {
            setTabs(newTabs);
            setImages(newTabs[currentTab]?.images || []);
          }
        }
      } catch (error) {
        console.warn("Error in storage listener:", error);
      }
    };

    // Listener para sincronização entre abas via BroadcastChannel
    const syncListener = (event) => {
      if (isUpdatingRef.current) return;

      const { type, data } = event.data;

      switch (type) {
        case "TABS_UPDATED":
          setTabs(data.tabs);
          setImages(data.tabs[currentTab]?.images || []);
          break;
        case "TAB_SWITCHED":
          setCurrentTab(data.tabId);
          setImages(data.tabs[data.tabId]?.images || []);
          break;
        case "IMAGES_ADDED":
        case "IMAGE_DELETED":
        case "TAB_CLEARED":
        case "NOTE_UPDATED":
        case "IMAGES_REORDERED":
          setTabs(data.tabs);
          if (data.affectedTab === currentTab) {
            setImages(data.tabs[data.affectedTab]?.images || []);
          }
          break;
        default:
          break;
      }
    };

    syncChannelRef.current.addEventListener("message", syncListener);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    try {
      chrome.storage.onChanged.addListener(storageListener);
    } catch (error) {
      console.warn("Error adding storage listener:", error);
    }

    return () => {
      clearTimeout(safetyTimeout);
      syncChannelRef.current?.removeEventListener("message", syncListener);
      syncChannelRef.current?.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      try {
        chrome.storage.onChanged.removeListener(storageListener);
      } catch (error) {
        // Silently ignore if extension context is invalidated
      }
    };
  }, [currentTab]);

  const addImages = (newImages) => {
    // Se não estiver inicializado, aguardar um pouco
    if (!isInitialized) {
      setTimeout(() => addImages(newImages), 100);
      return;
    }

    const updatedImages = [...images, ...newImages];
    const updatedTabs = {
      ...tabs,
      [currentTab]: {
        ...tabs[currentTab],
        images: updatedImages,
      },
    };

    isUpdatingRef.current = true;
    setImages(updatedImages);
    setTabs(updatedTabs);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs }, () => {
          // Notificar outras abas via BroadcastChannel
          syncChannelRef.current?.postMessage({
            type: "IMAGES_ADDED",
            data: {
              tabs: updatedTabs,
              affectedTab: currentTab,
            },
          });
          isUpdatingRef.current = false;
        });
      }
    } catch (error) {
      console.warn("Error saving images:", error);
      isUpdatingRef.current = false;
    }
  };

  const deleteImage = (id) => {
    const updatedImages = images.filter((img) => img.id !== id);
    const updatedTabs = {
      ...tabs,
      [currentTab]: {
        ...tabs[currentTab],
        images: updatedImages,
      },
    };

    isUpdatingRef.current = true;
    setImages(updatedImages);
    setTabs(updatedTabs);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs }, () => {
          // Notificar outras abas via BroadcastChannel
          syncChannelRef.current?.postMessage({
            type: "IMAGE_DELETED",
            data: {
              tabs: updatedTabs,
              affectedTab: currentTab,
            },
          });
          isUpdatingRef.current = false;
        });
      }
    } catch (error) {
      console.warn("Error deleting image:", error);
      isUpdatingRef.current = false;
    }
  };

  const switchTab = (tabId) => {
    if (tabId === currentTab) return;

    isUpdatingRef.current = true;
    setCurrentTab(tabId);
    setImages(tabs[tabId]?.images || []);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_TAB]: tabId }, () => {
          // Notificar outras abas via BroadcastChannel
          syncChannelRef.current?.postMessage({
            type: "TAB_SWITCHED",
            data: {
              tabId,
              tabs,
            },
          });
          isUpdatingRef.current = false;
        });
      }
    } catch (error) {
      console.warn("Error switching tab:", error);
      isUpdatingRef.current = false;
    }
  };

  const clearCurrentTab = () => {
    const updatedTabs = {
      ...tabs,
      [currentTab]: {
        ...tabs[currentTab],
        images: [],
      },
    };

    isUpdatingRef.current = true;
    setImages([]);
    setTabs(updatedTabs);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs }, () => {
          // Notificar outras abas via BroadcastChannel
          syncChannelRef.current?.postMessage({
            type: "TAB_CLEARED",
            data: {
              tabs: updatedTabs,
              affectedTab: currentTab,
            },
          });
          isUpdatingRef.current = false;
        });
      }
    } catch (error) {
      console.warn("Error clearing tab:", error);
      isUpdatingRef.current = false;
    }
  };

  const reorderImages = (reorderedImages) => {
    const updatedTabs = {
      ...tabs,
      [currentTab]: {
        ...tabs[currentTab],
        images: reorderedImages,
      },
    };

    isUpdatingRef.current = true;
    setImages(reorderedImages);
    setTabs(updatedTabs);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs }, () => {
          // Notificar outras abas via BroadcastChannel
          syncChannelRef.current?.postMessage({
            type: "IMAGES_REORDERED",
            data: {
              tabs: updatedTabs,
              affectedTab: currentTab,
            },
          });
          isUpdatingRef.current = false;
        });
      }
    } catch (error) {
      console.warn("Error reordering images:", error);
      isUpdatingRef.current = false;
    }
  };

  return {
    tabs,
    currentTab,
    images,
    isInitialized,
    switchTab,
    addImages,
    deleteImage,
    clearCurrentTab,
    reorderImages,
  };
};
