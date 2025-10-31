export const DEFAULT_TABS = {
  tab1: { name: "Seus pins", images: [] },
};

export const SIDEBAR_CONFIG = {
  MIN_WIDTH: 200,
  MAX_WIDTH: 600,
  DEFAULT_WIDTH: 240,
  EDGE_TRIGGER_DISTANCE: 80,
};

export const VIEWER_CONFIG = {
  MIN_WIDTH: 200,
  MIN_HEIGHT: 150,
  MINIMIZED_SIZE: 120,
  MAX_SCREEN_RATIO: 0.8,
};

export const MEDIA_EXTENSIONS = {
  IMAGE: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"],
  VIDEO: [".mp4", ".webm", ".mov", ".avi"],
};

export const STORAGE_KEYS = {
  SIDEBAR_TABS: "sidebarTabs",
  CURRENT_TAB: "currentTab",
  SIDEBAR_WIDTH: "sidebarWidth",
};

export const MESSAGES = {
  TOGGLE_SIDEBAR: "toggleSidebar",
  NOTIFY_SYNC: "notifySync",
  SYNC_IMAGES: "syncImages",
};
