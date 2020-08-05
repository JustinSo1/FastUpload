const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "EzUpload",
    type: "normal",
    contexts: ["image"],
  });
};
chrome.contextMenus.onClicked.addListener(() => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token);
  });
});
chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  setUpContextMenus();
});
