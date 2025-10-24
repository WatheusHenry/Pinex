chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notifySync") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "syncImages" }).catch(() => {
          // Ignorar erros de abas que não têm content script
        });
      });
    });
  }
});
