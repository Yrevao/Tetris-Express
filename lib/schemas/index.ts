// stores all the documents as their primary keys
let store = {};
// defines the properties of a document
let schema = null;

// initalize a schema with a factory function
module.exports.init = (model) => {
    schema = model;
}

// insert a document, arguments after the primary key value must match the schema
module.exports.insert = (primaryKey, ...props) => {
    const document = schema.apply(null, props);
    store[primaryKey] = document;
}

// find all the documents that have a property matching a value
module.exports.findManyByProperty = (property, value) => {
    let found = {};
    for(let key in store) {
        let doc = store[key];
        if(doc[property] == value)
            found[key] = doc;
    }
    return found;
}

// find all the document primary keys whose documents have a property matching a value
module.exports.findManyKeysByProperty = (property, value) => {
    let found = []
    for(let key in store) {
        if(store[key][property] == value)
            found.push(key);
    }
    return found;
}

// find a document by its primary key
module.exports.findByKey = (primaryKey) => {
    return store[primaryKey];
}

// find a document by its primary key and update a property of the document
module.exports.findByKeyAndUpdate = (primaryKey, property, value) => {
    let doc = store[primaryKey];
    if(doc == null)
        return false;

    doc[property] = value;
    store[primaryKey] = doc;

    return true;
}

module.exports.findManyByPropertyAndUpdate = (findProperty, findValue, updateProperty, updateValue) => {
    let updateCount = 0;
    for(let key in store) {
        if(store[key][findProperty] == findValue) {
            store[key][updateProperty] = updateValue;
            updateCount++;
        }
    }
    return updateCount;
}

module.exports.findByKeyAndOverwrite = (primaryKey, doc) => {
    store[primaryKey] = doc;
}

// find a document by primary key and delete
module.exports.findByKeyAndDelete = (primaryKey) => {
    delete store[primaryKey];
}

// all the documents with a certain value are deleted, returns the number of documents deleted
module.exports.findManyByPropertyAndDelete = (property, value) => {
    let deletedCount = 0;
    for(let key in store) {
        if(store[key][property] == value) {
            delete store[key];
            deletedCount++;
        }
    }
    return deletedCount;
}