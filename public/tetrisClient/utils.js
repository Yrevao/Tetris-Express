// send formatted post request with json data
export const request = (data, url) => {
    return new Promise((resolve, reject) => {
        const params = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        };
    
        fetch(url, params)
            .then(response => {
            if(response.ok) {
                resolve(response.json());
            }
            else
                reject('Error on POST Request');
            });
    });
}