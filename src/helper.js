const Collection = require("./collection");
const pluralize = require("pluralize");

class OresmHelper {
    checkAction(model) {
        if (Object.isFrozen(model)) {
            throw new Error("action not allowed");
        }
    }
    
    updateEntity(model, data) {
        Object.keys(data).forEach(key => {
            if (key !== model.key || !model._entity[key]) {
                if (!model._entity.hasOwnProperty(key)) {
                    const property = this.getPropertyDefinition(model, key)
                    Object.defineProperty(model, key, property)
                }
                model[key] = data[key]
            }
        })
    }
    
    setEntity(model, entity) {
        model._entity = entity;
        if (!model._entity) return;
        
        model._dirty = Object.keys(model._entity)
        const properties = model._dirty.reduce((props, key) => {
            props[key] = this.getPropertyDefinition(model, key)
            return props;
        }, {});
        Object.defineProperties(model, properties);
        Object.defineProperty(model, "_entity", {
            enumerable: false,
            configurable: true
        });
    }
    
    getPropertyDefinition(model, key) {
        return {
            enumerable: true,
            configurable: true,
            get() {
                return model._entity[key];
            },
            set(value) {
                if (key === model.key && model._entity[key]) {
                    throw new Error('cannot update key')
                }
                model._entity[key] = value;
                model._dirty.push(key)
            }
        }
    }
    
    constructEndpoint(model, ...parts) {
        parts.unshift(model.resource);
        parts.unshift(model.prefix);
        parts = parts.filter(Boolean);
        return model.host + "/" + parts.join("/");
    }
    
    constructEndpointWithKey(model) {
        return this.constructEndpoint(model, model._entity[model.key]);
    }
    
    collect(resourceMapper, documents) {
        if (!Array.isArray(documents)) {
            throw new Error("documents is not an array");
        }
        
        const models = documents.map(doc => new resourceMapper(doc));
        return new Collection(models);
    }
    
    getResource(model) {
        const noun = model.constructor.name.toLowerCase();
        return pluralize(noun);
    }
    
    isNew(model) {
        return !Boolean(model._entity[model.key]);
    }
    
    destroy(model) {
        Object.freeze(model);
    }
}

module.exports = OresmHelper