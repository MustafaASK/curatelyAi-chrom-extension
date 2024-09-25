//Downloads
//

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
function createDataURL(blob, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(blob);
}

function getExtension(filename) {
    return _.chain(filename)
        .split(".")
        .last()
        .trim()
        .toLower()
        .value();
}

//----

const DownloadChange = {

    _validExtensions: [],

    get validExtensions() { return this._validExtensions; },
    set validExtensions(extensions) {
        if (_.isString(extensions)) {
            extensions = extensions.split(" ");
        }

        if (!_.isArray(extensions)) return;

        this._validExtensions = _(extensions)
            .filter()
            .map(getExtension)
            .value();
    },

    get allExtensionsEnabled() {
        return this.validExtensions.length === 0;
    },

    enableAllExtensions() {
        this.validExtensions = [];
    },

    getFilename(downloadDelta, validExtensions) {
        let { filename } = downloadDelta || {};
        if (!_.isObject(filename)) return null;

        filename = filename.current;
        if (!this.hasValidExtension(filename, validExtensions)) return null;

        return filename;
    },

    getEndTime(downloadDelta) {
        let { endTime } = downloadDelta || {};
        if (!_.isObject(endTime)) return null;

        return endTime.current || null;
    },

    isComplete(downloadDelta) {
        let { state } = downloadDelta || {};
        if (!_.isObject(state)) return false;

        state = state.current;
        return state === "complete";
    },

    hasValidExtension(filename, validExtensions) {
        this.validExtensions = validExtensions;

        if (!_.isString(filename)) return false;
        if (filename.length === 0) return false;

        if (this.allExtensionsEnabled) return true;

        const extension = getExtension(filename);
        return _.includes(this.validExtensions, extension);
    }

};

const Downloads = {

    //----
    //State

    _list: [],
    _active: {
        id: null,
        startTime: null,
        endTime: null,
        filename: "",
        dataURL: ""
    },

    _onFetch: _.noop,

    //----
    //Logging

    DEBUG: false,

    log(...args) {
        if (this.DEBUG) {
            console.log(...args);
        }
    },

    //----
    //Storage

    ...StorageMixin({
        downloads: [],
        activeDownload: {}
    }, {
        list: "downloads",
        active: "activeDownload"
    }),

    onLoad(data) {
        console.log("onLoad", data);

        const { downloads, activeDownload } = data || {};

        if (_.isArray(downloads)) {
            this._list = downloads;
        }
        if (_.isObject(activeDownload)) {
            this._active = activeDownload;
        }
    },

    onSave(data) {
        console.log("onSave", data);
    },

    toJSON() {
        return {
            downloads: this._list.slice(),
            activeDownload: _.clone(this._active)
        };
    },

    //----
    //Properties

    get validExtensions() { return DownloadChange.validExtensions; },
    set validExtensions(extensions) {
        DownloadChange.validExtensions = extensions;
    },

    get isActiveDownloadComplete() {
        const {
            id,
            filename,
            dataURL
        } = this._active;

        if (!_.isFinite(id)) return false;
        if (!_.isString(filename)) return false;
        if (!_.isString(dataURL)) return false;
        if (filename.length === 0) return false;
        if (dataURL.length === 0) return false;

        return true;
    },

    //----
    //Initialization

    init(callback) {
        if (!_.isFunction(callback)) {
            callback = _.noop;
        }

        chrome.extension.isAllowedFileSchemeAccess(allowed => {
            if (!allowed) {
                console.log("File scheme access is not allowed");
                return;
            }

            const onFetch = this.storageWrap(this.setDataURL);
            this.onFetch(onFetch);

            callback();
        });
    },

    //----
    //Fetch

    onFetch(callback) {
        if (_.isFunction(callback)) {
            this._onFetch = callback;
        }
    },

    fetchActiveDownload(callback) {
        const { filename } = this._active;
        const url = "file:///" + filename;

        console.log("Fetching: " + url);

        fetch(url).then(response => {
            console.log("Fetch response:", response);

            if (!response.ok) {
                throw new Error("Network response error");
            }
            return response.blob();
        })
            .then(blob => {
                console.log("Blob:", blob);

                createDataURL(blob, dataURL => {
                    console.log({ dataURL });

                    sendData({
                        localDataURL: true,
                        dataURL: dataURL
                    })

                    this._onFetch(dataURL);

                    if (_.isFunction(callback)) {
                        callback(dataURL);
                    }
                });
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    },

    //----
    //Modifiers

    setDataURL(dataURL) {
        if (!_.isString(dataURL)) return;
        if (dataURL.length === 0) return;

        this._active.dataURL = dataURL;

        if (this.isActiveDownloadComplete) {
            const newDownload = _.clone(this._active);
            this._list.push(newDownload);

            console.log("Saving new download", newDownload);
        }
    },

    create(downloadItem) {
        const { id } = downloadItem || {};

        console.log("Download created:", downloadItem);

        if (!_.isFinite(id)) return;

        let { startTime } = downloadItem;
        if (!_.isString(startTime)) {
            startTime = (new Date()).toISOString();
        }

        this._active = {
            id,
            startTime,
            endTime: null,
            filename: "",
            dataURL: ""
        };

        console.log("Saving active id: " + id);
    },

    isActiveDownload(downloadDelta) {
        const { id } = downloadDelta || {};
        if (!_.isFinite(id)) return false;

        return id === this._active.id;
    },

    change(downloadDelta) {
        console.log("Download changed:", downloadDelta);

        if (!this.isActiveDownload(downloadDelta)) return;

        console.log("Download changed: is active");

        const filename = DownloadChange.getFilename(downloadDelta);
        if (_.isString(filename) && filename.length > 0) {
            this._active.filename = filename;
            console.log("Saving active filename: " + filename);
            return;
        }

        if (!DownloadChange.isComplete(downloadDelta)) return;

        console.log("Download complete");

        let endTime = DownloadChange.getEndTime(downloadDelta);
        if (!_.isString(endTime)) {
            endTime = (new Date()).toISOString();
        }
        this._active.endTime = endTime;

        this.fetchActiveDownload();
    },

    //----
    //Listeners

    onCreatedListener(downloadItem) {
        if (downloadItem.finalUrl.startsWith("https://www.linkedin.com") || !downloadItem.finalUrl.startsWith("https://ovastorage.s3.us-west-2")) {
            const create = this.storageWrapActive(this.create);
            this.init(() => create(downloadItem));
        }
    },

    onChangedListener(downloadDelta) {
        const change = this.storageWrapActive(this.change);
        this.init(() => change(downloadDelta));
    }

};

// chrome.runtime.onMessageExternal.addListener(
//     function (request, sender, sendResponse) {
//         if (request.isLinkedinCurately) {
//             sendData({
//                 loadData: true
//             });
//         }
//     }
// );
