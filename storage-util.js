//Storage utilities
//

const Storage = {

    _pending: [],

    Mixin: StorageMixin,

    get isPending() { return this._pending.length > 0; },

    runNext() {
        this._pending.shift();

        if (this.isPending) {
            this._pending[0]();
        }
    },

    synchronizedGet(keys, callback) {
        const get = () => {
            chrome.storage.local.get(keys, data => {
                callback(data);
                this.runNext();
            });
        };

        const {isPending} = this;
        this._pending.push(get);
        if (!isPending) get();
    },

    synchronizedSet(data, callback) {
        const set = () => {
            chrome.storage.local.set(data, () => {
                callback();
                this.runNext();
            });
        };

        const {isPending} = this;
        this._pending.push(set);
        if (!isPending) set();
    }

};

function StorageMixin(defaults, convenienceMethods) {
    if (!_) return {};

    function log(...args) {
        if (StorageMixin.DEBUG) {
            console.log(...args);
        }
    }

    function load(keys, callback) {
        if (_.isFunction(arguments[0])) {
            callback = arguments[0];
            keys = null;
        }

        if (!_.isFunction(callback)) {
            if (_.isFunction(this.onLoad)) {
                callback = () => this.onLoad();
            } else {
                callback = _.noop;
            }
        }

        if (_.isString(keys) || _.isArray(keys)) {
            keys = _.pick(defaults, keys);

        } else if (!_.isObject(keys)) {
            keys = defaults;
        }

        Storage.synchronizedGet(keys, data => {
            log("Storage load:", data);
            callback(data);
        });
    }

    function save(data, callback) {
        if (_.isFunction(arguments[0])) {
            callback = arguments[0];
            data = null;
        }

        if (!_.isFunction(callback)) {
            if (_.isFunction(this.onSave)) {
                callback = data => this.onSave(data);
            } else {
                callback = _.noop;
            }
        }

        const getSaveData = () => {
            if (_.isFunction(this.getSaveData)) return this.getSaveData();
            if (_.isFunction(this.toJSON)) return this.toJSON();
            return _.clone(defaults);
        };

        if (_.isString(data) || _.isArray(data)) {
            const keys = data;
            data = getSaveData();
            data = _.pick(data, keys);

        } else if (!_.isObject(data)) {
            data = getSaveData();
        }

        Storage.synchronizedSet(data, () => {
            log("Storage save:", data);
            callback(data);
        });
    }

    function storageWrap(keys, method) {
        if (_.isFunction(arguments[0])) {
            method = arguments[0];
            keys = null;
        }

        if (!_.isFunction(method)) {
            method = _.noop;
        }

        let loadKeys = defaults;

        if (_.isString(keys) || _.isArray(keys)) {
            loadKeys = _.pick(defaults, keys);
        }

        const saveKeys = _.keys(loadKeys);

        method = method.bind(this);

        return (...args) => {
            this.load(loadKeys, () => {
                method(...args);
                this.save(saveKeys);
            });
        };
    }

    function buildConvenienceMethods(methodNames) {
        function createMethods(name, keys) {
            const methods = {
                load(callback) {
                    this.load(keys, callback);
                },

                save(callback) {
                    this.save(keys, callback);
                },

                storageWrap(method) {
                    return this.storageWrap(keys, method);
                }
            };

            const rename = (value, key) => key + _.upperFirst(name);
            return _.mapKeys(methods, rename);
        }

        const methods = {};
        for (let [name, keys] of _.entries(methodNames)) {
            _.assign(methods, createMethods(name, keys));
        }

        return methods;
    }

    const methods = buildConvenienceMethods(convenienceMethods);
    return _.assign(methods, {load, save, storageWrap});
}
