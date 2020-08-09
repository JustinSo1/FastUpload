const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "EzUpload",
    type: "normal",
    contexts: ["image"],
  });
};

function dataURItoBlob(dataURI) {
  var binary = window.atob(dataURI.split(",")[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
}

chrome.contextMenus.onClicked.addListener((info) => {
  console.log(info);

  srcUrl = info.srcUrl;
  mimeType = srcUrl.substring(srcUrl.indexOf(":") + 1, srcUrl.indexOf(";"));

  // const BASE64_MARKER = ";base64,";
  // const base64Index = srcUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  // const base64 = srcUrl.substring(base64Index);

  // console.log(base64);
  // const binaryData = window.atob(base64);
  // console.log(binaryData);
  binaryData = dataURItoBlob(srcUrl);
  const url = "https://photoslibrary.googleapis.com/v1/uploads";
  console.log(mimeType);

  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    // console.log(token);
    authorization = `Bearer ${token}`;

    headers = {
      Authorization: authorization,
      "Content-type": "application/octet-stream",
      "X-Goog-Upload-Content-Type": mimeType,
      "X-Goog-Upload-Protocol": "raw",
      // Accept: "application/octet-stream",
    };
    fetch(url, {
      method: "POST",
      headers: headers,
      body: binaryData,
    })
      .then((response) => response.text())
      .then((data) => {
        createURL =
          "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate";
        // console.log(data);
        body = {
          newMediaItems: [
            {
              description: "item-description",
              simpleMediaItem: {
                uploadToken: data,
              },
            },
          ],
        };
        headers = {
          "Content-Type": "application/json",
          Authorization: authorization,
        };
        fetch(createURL, {
          method: "POST",
          headers: headers,
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
