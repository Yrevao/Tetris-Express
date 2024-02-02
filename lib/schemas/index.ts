export class Schema<model> {
    // stores all documents as their primary keys
    #store: Map<string, model> = new Map();

    // function used to create a new document
    #newDoc: model | any = () => {};

    constructor(newDoc: any) {
        this.#newDoc = newDoc;
    }

    // insert a document at a certain private key
    insert(primaryKey: string, ...props: any): boolean {
        if(this.#newDoc == undefined)
            return false;

        const doc = this.#newDoc.apply(null, props);
        this.#store.set(primaryKey, doc);
        
        return true;
    }

    // find all documents that have a property matching a value
    findManyByProperty<prop extends keyof model>(property: prop, value: any): Map<string, model> {
        let found: Map<string, model> = new Map();

        this.#store.forEach((doc, key) => {
            if(doc[property] == value)
                found.set(key, doc);
        });

        return found;
    }

    // find all the document primary keys whose documents have a property matching a value
    findManyKeysByProperty<prop extends keyof model>(property: prop, value: any): string[] {
        let found: string[] = [];

        this.#store.forEach((doc, key) => {
            if(doc[property] == value)
                found.push(key);
        });

        return found;
    }

    // find a document by its primary key
    findByKey(primaryKey: string): any {
        return this.#store.get(primaryKey);
    }

    // find a document by its primary key and update a property of the document
    findByKeyAndUpdate<prop extends keyof model>(primaryKey: string, property: prop, value: any): boolean {
        let doc = this.#store.get(primaryKey);

        if(doc == undefined)
            return false;

        doc[property] = value;
        this.#store.set(primaryKey, doc);

        return true;
    }

    // find all documents with a certain value and update another value
    findManyByPropertyAndUpdate<prop extends keyof model>(findProperty: prop, findValue: any, updateProperty: prop, updateValue: any): number {
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
    findByKeyAndOverwrite(primaryKey: string, doc: model): boolean {
        if(!this.#store.has(primaryKey))
            return false;

        this.#store.set(primaryKey, doc);
        return true;
    }

    // find a document by primary key and delete
    findByKeyAndDelete(primaryKey: string): boolean {
        return this.#store.delete(primaryKey);
    }

    // all the documents with a certain value are deleted, returns the number of documents deleted
    findManyByPropertyAndDelete<prop extends keyof model>(property: prop, value: any): number {
        let deleted: number = 0;

        this.#store.forEach((doc, key) => {
            if(doc[property] == value)
                this.#store.delete(key);
        });

        return deleted;
    }
}