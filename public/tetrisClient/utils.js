// send formatted post request with json data
export const request = (data, url, get) => {
    return new Promise((resolve, reject) => {
        const params = {
            method: get ? 'GET' : 'POST',
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

// create button and add it as a child to another DOM element
export const newButton = (text, method, id, parentNode) => {
    let oldButton = document.getElementById(id);
    if(oldButton)
        oldButton.remove();

    let button = document.createElement('button');

    button.id = id;
    button.textContent = text;
    button.onclick = method;
    parentNode.appendChild(button);

    return button;
}