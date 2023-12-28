module.exports = {
    // returns the base object with only the properties from the props array
    reprop: (base, props) => {
        let newBase = {};
        for(let prop in base) {
            newBase[prop] = {}
            
            for(key of props)
                newBase[prop][key] = base[prop][key];
        }
        return newBase;
    } 
}