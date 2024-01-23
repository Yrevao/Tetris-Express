export class Schema<model> {
    // stores all documents as their primary keys
    #store: Map<string, model> = new Map();

    // function used to create a new document
    #newDoc: model | undefined = undefined;

    // insert a document at a certain private key
    insert(primaryKey, doc) {
        this.#store.set(primaryKey, doc);
    }

    // find all documents that have a property matching a value
    findManyByProperty<property extends keyof model, value>(property, value): Map<string, model> {
        let found: Map<string, model> = new Map();

        this.#store.forEach((doc, key) => {
            if(doc[property] == value)
                found.set(key, doc);
        });

        return found;
    }

    // find all the document primary keys whose documents have a property matching a value
    findManyKeysByProperty<property extends keyof model, value>(property, value): string[] {
        let found: string[] = [];

        this.#store.forEach((doc, key) => {
            if(doc[property] == value)
                found.push(key);
        });

        return found;
    }

    // find a document by its primary key
    findByKey(primaryKey): any {
        return this.#store.get(primaryKey);
    }

    // find a document by its primary key and update a property of the document
    findByKeyAndUpdate<primaryKey, property extends keyof model, value>(primaryKey, property, value): boolean {
        let doc = this.#store.get(primaryKey);

        if(doc == undefined)
            return false;

        doc[property] = value;
        this.#store.set(primaryKey, doc);

        return true;
    }

    // find all documents with a certain value and update another value
    findManyByPropertyAndUpdate<findProperty extends keyof model, findValue, updateProperty extends keyof model, updateValue>(findProperty, findValue, updateProperty, updateValue): number {
        let updated: number = 0;

        this.#store.forEach((doc, key) => {
            if(doc[findProperty] != findValue) {
                doc[updateProperty] = updateValue;
                this.#store.set(key, doc);
                updated++;
            }
        });

        return updated;
    }

    // find a document by primary key and overwrite it with another document and return true, otherwise return false
    findByKeyAndOverwrite(primaryKey, doc): boolean {
        if(!this.#store.has(primaryKey))
            return false;

        this.#store.set(primaryKey, doc);
        return true;
    }

    // find a document by primary key and delete
    findByKeyAndDelete(primaryKey): boolean {
        return this.#store.delete(primaryKey);
    }

    // all the documents with a certain value are deleted, returns the number of documents deleted
    findManyByPropertyAndDelete<property extends keyof model, value>(property, value): number {
        let deleted: number = 0;

        this.#store.forEach((doc, key) => {
            if(doc[property] == value)
                this.#store.delete(key);
        });

        return deleted;
    }
}