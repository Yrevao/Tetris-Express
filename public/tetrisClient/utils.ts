// send formatted post request with json data
export const request = (data: any, url: string, get?: boolean): Promise<any> => {
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
export const newButton = (text: string, method: Function, id: string, parentNode: any): HTMLButtonElement => {
    let oldButton: HTMLElement | null = document.getElementById(id);
    if(oldButton)
        oldButton.remove();

    let clickMethod = method as ((this: GlobalEventHandlers, ev: MouseEvent) => any)
    let button: HTMLButtonElement = document.createElement('button');

    button.className = 'buttons';
    button.id = id;
    button.textContent = text;
    button.onclick = clickMethod;
    parentNode.appendChild(button);

    return button;
}