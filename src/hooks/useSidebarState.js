import { useState, useEffect } from "react";
import { DEFAULT_TABS, STORAGE_KEYS } from "../constants";


export const useSidebarState = () => {
  const [currentTab, setCurrentTab] = useState("tab1");
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadData = () => {
      chrome.storage.local.get([STORAGE_KEYS.SIDEBAR_TABS, STORAGE_KEYS.CURRENT_TAB], (result) => {
        const loadedTabs = result[STORAGE_KEYS.SIDEBAR_TABS] || DEFAULT_TABS;
        const loadedCurrentTab = result[STORAGE_KEYS.CURRENT_TAB] || "tab1";

        setTabs(loadedTabs);
        setCurrentTab(loadedCurrentTab);
        setImages(loadedTabs[loadedCurrentTab]?.images || []);
      });
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
      if (area === "local" && changes[STORAGE_KEYS.SIDEBAR_TABS]) {
        const newTabs = changes[STORAGE_KEYS.SIDEBAR_TABS].newValue;
        if (newTabs) {
          setTabs(newTabs);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      chrome.storage.onChanged.removeListener(storageListener);
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
    chrome.storage.local.set({ sidebarTabs: updatedTabs });
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
    chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs });
  };

  const switchTab = (tabId) => {
    if (tabId === currentTab) return;

    setCurrentTab(tabId);
    setImages(tabs[tabId]?.images || []);
    chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_TAB]: tabId });
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
    chrome.storage.local.set({ [STORAGE_KEYS.SIDEBAR_TABS]: updatedTabs });
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
