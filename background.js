const setUpContextMenus = () => {
  chrome.contextMenus.create({
    id: "Upload",
    title: "EzUpload",
    type: "normal",
    contexts: ["image"],
  });
};

chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  setUpContextMenus();
});

chrome.contextMenus.onClicked.addListener((info) => {
  const mimeType = getMIMEType(info.srcUrl);
  const binaryData = dataURItoBlob(info.srcUrl, mimeType);
  uploadImage(binaryData);
});

const uploadImage = (binaryData) => {
  chrome.identity.getAuthToken({ interactive: true }, async (token) => {
    const authorization = `Bearer ${token}`;
    const uploadToken = await uploadRawBytes(binaryData, authorization);
    const response = await createMediaItem(authorization, uploadToken);
    console.log(response);
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

const uploadRawBytes = async (binaryData, authorization) => {
  const url = "https://photoslibrary.googleapis.com/v1/uploads";
  const uploadHeaders = {
    Authorization: authorization,
    "Content-type": "application/octet-stream",
    "X-Goog-Upload-Content-Type": binaryData.type,
    "X-Goog-Upload-Protocol": "raw",
  };
  const response = await fetch(url, {
    method: "POST",
    headers: uploadHeaders,
    body: binaryData,
  });
  return response.text();
};

const createMediaItem = async (authorization, uploadToken) => {
  const createURL =
    "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate";
  const createHeaders = {
    "Content-Type": "application/json",
    Authorization: authorization,
  };
  const body = {
    newMediaItems: [
      {
        description: "item-description",
        simpleMediaItem: {
          uploadToken: uploadToken,
        },
      },
    ],
  };

  const response = await fetch(createURL, {
    method: "POST",
    headers: createHeaders,
    body: JSON.stringify(body),
  });

  return response.text();
};
