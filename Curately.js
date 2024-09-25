var isFromLinkedin = false;
var sendData = (params) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                params,
                function (response) {
                    console.log('ext send message: ' + new Date().getMilliseconds());
                    console.log(response);
                    // window.close();
                }
            );
        }
    });
}
// chrome.downloads.onChanged.addListener(function (downloadDelta) {
//     var window = window ?? self;

//     if (!window.filePathNameTemparoryChrome) {
//         window.filePathNameTemparoryChrome = "";
//     }

//     if (window.isFileReadyToBeLoaded != "notLoaded" && window.isFileReadyToBeLoaded != "loaded") {
//         window.isFileReadyToBeLoaded = "notLoaded";
//     }

//     console.log(downloadDelta);
//     // console.log(downloadDelta.filename.current);
//     if (downloadDelta?.filename?.current) {
//         console.log('pdf loaded');
//         if (!window.filePathNameTemparoryChrome) {
//             window.filePathNameTemparoryChrome = downloadDelta?.filename?.current;
//             if (window.isFileReadyToBeLoaded == "notLoaded") {
//                 if (window) {
//                     window.isFileReadyToBeLoaded = "loaded";
//                     sendData({
//                         localPathOfFile: filePathNameTemparoryChrome
//                     })
//                 }
//             }
//         }

//         // readTextFile(downloadDelta.filename.current);
//         // ;
//     }
//     if (downloadDelta.state && downloadDelta.state.current === "complete") {
//         console.log('pdf called');
//         // A PDF file has been downloaded, send a message to content script

//         // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

//         //     chrome.tabs.sendMessage(tabs[0].id, { action: "openPDF", url: downloadDelta.filename });

//         // });

//     }

// });

// let downloadId;
// chrome.downloads.onCreated.addListener(function (downloadItem) {
//     console.log("filename with absolute local path ", downloadItem.filename);
//     // Just FYI, you won't get downloadItem.filename here. So store the downloadId
//     downloadId = downloadItem.id;
//     // 2. Get the filename by using following api. Use downloadId acquired from above step
//     chrome.downloads.search({ id: downloadId }, function (downloadItem) {
//         console.log("filename with absolute local path ", downloadItem[0]?.filename);
//         // Now use <input type="file" > in your popup.html
//         // and access the file which match with your filename acquired from step 2.

//     });
// });

// chrome.webRequest.onCompleted.addListener(
//     function (details) {
//         // console.log(details.url);
//         if (details?.url.startsWith('https://www.linkedin.com/ambry/?x-li-ambry-ep=') && details?.url.endsWith("Profile.pdf")) {
//             // console.clear();
//             console.log(details.url);
//             isFromLinkedin = true;
//             // showUrl(details);
//             sendData({
//                 allUrlData: true,
//                 dataOfAllUrl: details
//             });
//         }
//     },
//     { urls: ["https://www.linkedin.com/*"] }
// );

var showUrl = (params) => {
    console.log('showUrl');
    console.log(params);
}




//Popup
//

function getDownloads(data) {
    if (_.isArray(data)) return data;

    const { downloads } = data || {};
    if (!_.isArray(downloads)) return [];

    return downloads;
}

function loadDownloads(callback) {
    if (!Downloads) return;

    Downloads.loadList(data => {
        callback(getDownloads(data));
    });
}

function saveDownloads(downloads, callback) {
    if (!Downloads) return;

    Downloads.save({ downloads }, callback);
}

function deleteDownload(id, callback) {
    console.log("deleteDownload " + id);

    loadDownloads(downloads => {
        downloads = _.reject(downloads, { id });
        saveDownloads(downloads, callback);
    });
}

//----------

// const downloadsDiv = document.getElementById("downloads");

function getFileName(path) {
    if (!_.isString(path)) return "";
    return _.last(path.split(/[\\/]/));
}

function renderDownloads(downloads) {
    // downloadsDiv.innerHTML = "";

    // let html = "";
    // for (const download of downloads) {
    //     html += renderDownload(download);
    // }
    // downloadsDiv.innerHTML = html;

    // const deleteHandler = id => () => deleteDownload(id);

    // const deleteButtons = downloadsDiv.querySelectorAll(".delete");
    // for (const button of deleteButtons) {
    //     const id = Number(button.parentElement.id.split("-")[1]);
    //     button.addEventListener("click", deleteHandler(id));
    // }
}

function renderDownload(download) {
    let {
        id,
        endTime,
        filename,
        dataURL
    } = download || {};

    filename = getFileName(filename);
    const downloadFilename = "extension copy - " + filename;
    if (isFromLinkedin) {
        // showUrl(details);
        sendData({
            loadData: true,
            dataOfAllUrl: dataURL
        });
        console.log(dataURL);
    }
    return ``;
    // <div id="download-${id}" class="download">
    //     <button class="delete">&times;</button>
    //     <div class="download-info">
    //         <p>
    //             <a class="open-link"
    //                 download="${downloadFilename}"
    //                 href="${dataURL}">
    //                 ${filename}
    //             </a>
    //         </p>
    //         <p>${endTime}</p>
    //     </div>
    // </div>
}

function render() {
    loadDownloads(renderDownloads);
}

chrome.storage.onChanged.addListener(render);

render();
// chrome.browserAction.setPopup({ popup: "" });