chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
});

// Sincronizar imagens entre todas as abas
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notifySync") {
    // Enviar mensagem para todas as abas
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "syncImages" }).catch(() => {
          // Ignorar erros de abas que não têm content script
        });
      });
    });
  }
});
