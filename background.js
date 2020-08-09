const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "EzUpload",
    type: "normal",
    contexts: ["image"],
  });
};

const dataURItoBlob = (dataURI, mimeType) => {
  const binary = window.atob(dataURI.split(",")[1]);
  const byteArray = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; ++i) {
    byteArray[i] = binary.charCodeAt(i);
  }
  return new Blob([byteArray], { type: mimeType });
};

const getMIMEType = (dataURI) => {
  return dataURI.substring(dataURI.indexOf(":") + 1, dataURI.indexOf(";"));
};

const uploadRawBytes = (binaryData) => {
  const url = "https://photoslibrary.googleapis.com/v1/uploads";
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    const authorization = `Bearer ${token}`;

    const uploadHeaders = {
      Authorization: authorization,
      "Content-type": "application/octet-stream",
      "X-Goog-Upload-Content-Type": binaryData.type,
      "X-Goog-Upload-Protocol": "raw",
    };
    fetch(url, {
      method: "POST",
      headers: uploadHeaders,
      body: binaryData,
    })
      .then((response) => response.text())
      .then((data) => {
        const createURL =
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
};

chrome.contextMenus.onClicked.addListener((info) => {
  const mimeType = getMIMEType(info.srcUrl);
  const binaryData = dataURItoBlob(info.srcUrl, mimeType);
  uploadRawBytes(binaryData);
});
chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  setUpContextMenus();
});
