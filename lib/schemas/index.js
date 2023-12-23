// stores all the documents as their primary keys
let store = {};
// defines the properties of a document
let schema = null;

// set the factory function for the schema
module.exports = {
    // initalize a schema with a factory function
    init: (model) => {
        schema = model;
    },
    // insert a document, arguments after the primary key value must match the schema
    insert: (primaryKey, ...props) => {
        const document = schema.apply(null, props);
        store[primaryKey] = document;
    },
    // find all the documents that have a property matching a value
    findManyByProperty: (property, value) => {
        let found = [];
        for(let doc of store) {
            if(doc[property] == value)
                found.push(doc);
        }
        return found;
    },
    // find all the document primary keys whose documents have a property matching a value
    findManyKeysByProperty: (property, value) => {
        let found = []
        for(let key in store) {
            if(store[key][property] == value)
                found.push(key);
        }
        return found;
    },
    // find a document by its primary key
    findByKey: (primaryKey) => {
        return store[primaryKey];
    },
    // find a document by its primary key and update a property of the document
    findByKeyAndUpdate: (primaryKey, property, value) => {
        let doc = store[primaryKey];
        if(doc == null)
            return false;

        doc[property] = value;
        store[primaryKey] = doc;

        return true;
    },
    findManyByPropertyAndUpdate: (findProperty, findValue, updateProperty, updateValue) => {
        let updateCount = 0;
        for(let key in store) {
            if(store[key][findProperty] == findValue) {
                store[key][updateProperty] = updateValue;
                updateCount++;
            }
        }
        return updateCount;
    },
    // find a document by primary key and delete
    findByKeyAndDelete: (primaryKey) => {
        delete store[primaryKey];
    },
    // all the documents with a certain value are deleted, returns the number of documents deleted
    findManyByPropertyAndDelete: (property, value) => {
        let deletedCount = 0;
        for(let key in store) {
            if(store[key][property] == value) {
                delete store[key];
                deletedCount++;
            }
        }
        return deletedCount;
    }
}

