chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleSidebar" });
});

// Criar menu de contexto para copiar texto selecionado
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveTextToSidebar",
    title: "Salvar texto no Pinex",
    contexts: ["selection"],
  });
});

// Lidar com clique no menu de contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveTextToSidebar" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "addTextNote",
      text: info.selectionText,
    });
  }
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
