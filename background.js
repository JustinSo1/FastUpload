const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "EzUpload",
    type: "normal",
    contexts: ["image"],
  });
};

function dataURItoBlob(dataURI) {
  const binary = window.atob(dataURI.split(",")[1]);
  let array = [];
  for (let i = 0; i < binary.length; ++i) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
}

chrome.contextMenus.onClicked.addListener((info) => {
  const srcUrl = info.srcUrl;
  const mimeType = srcUrl.substring(
    srcUrl.indexOf(":") + 1,
    srcUrl.indexOf(";")
  );
  const binaryData = dataURItoBlob(srcUrl);
  const url = "https://photoslibrary.googleapis.com/v1/uploads";

  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    authorization = `Bearer ${token}`;

    const uploadHeaders = {
      Authorization: authorization,
      "Content-type": "application/octet-stream",
      "X-Goog-Upload-Content-Type": mimeType,
      "X-Goog-Upload-Protocol": "raw",
    };
    fetch(url, {
      method: "POST",
      headers: uploadHeaders,
      body: binaryData,
    })
      .then((response) => response.text())
      .then((data) => {
        createURL =
          "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate";
        const body = {
          newMediaItems: [
            {
              description: "item-description",
              simpleMediaItem: {
                uploadToken: data,
              },
            },
          ],
        };
        const createHeaders = {
          "Content-Type": "application/json",
          Authorization: authorization,
        };
        fetch(createURL, {
          method: "POST",
          headers: createHeaders,
          body: JSON.stringify(body),
        })
          .then((response) => response.text())
          .then((data) => console.log(data));
      });
  });
});
chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  setUpContextMenus();
});
