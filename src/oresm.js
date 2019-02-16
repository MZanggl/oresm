const JSONFetch = require("fetch-me-json");
const OresmHelper = require("./helper");

const helper = new OresmHelper();

class Model {
    constructor(entity = null) {
        this._dirty = []
        helper.setEntity(this, entity);
    }
    
    get host() {
        return "";
    }
    
    get prefix() {
        return "";
    }
    
    get resource() {
        return helper.getResource(this);
    }
    
    get key() {
        return "id";
    }

    clearDirty() {
        this._dirty = []
    }
    
    static async find(id, parameters = {}) {
        const self = new this();
        const entity = await self._get(id, parameters);
        helper.setEntity(self, entity);
        return self;
    }
    
    static async get(parameters = {}) {
        const self = new this();
        const body = await self._get(null, parameters);
        return helper.collect(self, body);
    }
    
    async _get(id = null, parameters = {}) {
        const endpoint = helper.constructEndpoint(this, id);
        return await JSONFetch.get(endpoint, parameters);
    }
    
    async delete() {
        helper.checkAction(this);
        const endpoint = helper.constructEndpointWithKey(this);
        await JSONFetch.delete(endpoint);
        helper.destroy(this);
    }
    
    async save(data = {}) {
        helper.updateEntity(this, data);
        
        return helper.isNew(this) ? this._store() : this._update("put", this._entity);
    }
    
    async _store() {
        const endpoint = helper.constructEndpoint(this);
        const entity = await JSONFetch.post(endpoint, this._entity);
        helper.setEntity(this, entity);
        this.clearDirty()

        return this;
    }
    
    async _update(method, parameters) {
        helper.checkAction(this);
        if (!this[this.key]) {
            throw new Error('field can not be updated because it is missing the key')
        }
        const endpoint = helper.constructEndpointWithKey(this);
        const body = await JSONFetch[method](endpoint, parameters);
        await helper.updateEntity(this, body);
        this.clearDirty()
    }
    
    patch(data = {}) {
        helper.updateEntity(this, data);
        const parameters = this._dirty.reduce(( parameters, key ) => {
            parameters[key] = this[key]
            return parameters
        }, {})
        return this._update("patch", parameters);
    }
    
    getEntity() {
        return Object.assign({}, this._entity);
    }
}

function configureFetch(configurations) {
    JSONFetch.config(configurations)
}

module.exports = {
    Model,
    configureFetch,
}
