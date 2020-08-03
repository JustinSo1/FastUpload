const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "GUpload",
    type: "normal",
    contexts: ["image"],
  });
};
chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  setUpContextMenus();
});
