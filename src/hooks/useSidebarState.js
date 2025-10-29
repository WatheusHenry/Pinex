import { useState, useEffect } from "react";
import { DEFAULT_TABS, STORAGE_KEYS } from "../constants";


export const useSidebarState = () => {
  const [currentTab, setCurrentTab] = useState("tab1");
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [images, setImages] = useState([]);

  useEffect(() => {
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

    loadData();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    const handleFocus = () => {
      loadData();
    };

    const storageListener = (changes, area) => {
      try {
        if (area === "local" && changes[STORAGE_KEYS.SIDEBAR_TABS]) {
          const newTabs = changes[STORAGE_KEYS.SIDEBAR_TABS].newValue;
          if (newTabs) {
            setTabs(newTabs);
          }
        }
      } catch (error) {
        console.warn("Error in storage listener:", error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    try {
      chrome.storage.onChanged.addListener(storageListener);
    } catch (error) {
      console.warn("Error adding storage listener:", error);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      try {
        chrome.storage.onChanged.removeListener(storageListener);
      } catch (error) {
        // Silently ignore if extension context is invalidated
      }
    };
  }, []);

  const addImages = (newImages) => {
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
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs });
      }
    } catch (error) {
      console.warn("Error saving images:", error);
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

    setImages(updatedImages);
    setTabs(updatedTabs);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs });
      }
    } catch (error) {
      console.warn("Error deleting image:", error);
    }
  };

  const switchTab = (tabId) => {
    if (tabId === currentTab) return;

    setCurrentTab(tabId);
    setImages(tabs[tabId]?.images || []);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_TAB]: tabId });
      }
    } catch (error) {
      console.warn("Error switching tab:", error);
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
    setImages([]);
    setTabs(updatedTabs);
    
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs });
      }
    } catch (error) {
      console.warn("Error clearing tab:", error);
    }
  };

  return {
    tabs,
    currentTab,
    images,
    switchTab,
    addImages,
    deleteImage,
    clearCurrentTab,
  };
};
