let session = null;
let boardsDiv = null
let boardCanvases = [];

export const init = (initSession) => {
    session = initSession;

    const root = document.getElementById('root');
    boardsDiv = document.createElement('div');
    root.appendChild(boardsDiv);
}

export const events = {
    update: (data) => {

    }
}