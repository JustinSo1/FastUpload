const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "GUpload",
    type: "normal",
    contexts: ["image"],
  });
};
chrome.contextMenus.onClicked.addListener(() => {
  $.ajax({
    url: "https://jsonplaceholder.typicode.com/todos/1",
    type: "GET",
    success: function (result) {
      console.log(result);
    },
    error: function (error) {
      console.log(`Error ${error}`);
    },
  });
});
chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  setUpContextMenus();
});
