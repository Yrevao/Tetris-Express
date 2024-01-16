// html elements
let settingsModal = null;

// settings data
let isHost = false;

let localSettingList = {    // local settings are set on the client side
    usernameSetting: null,
    autorepeatDelay: 167,
    autorepeatSpeed: 33,
}
let globalSettingList = {   // global settings are set for all players by the host
    forceSettings: false,
    sevenBag: true,
    gravity: 5,
    softDrop: 80,
    lockDelay: 500,
}

// settings ui html
let localSettingHTML = `
<p>Local Settings</p>
    <label for="usernameSetting">Username: </label>
        <input type="text" required minlength="1" id="usernameSetting"></input>
    <br>
    <label for="autorepeatDelay">Key Autorepeat Delay (ms):</label> 
        <input type="number" required minlength="1" value=167 id="autorepeatDelay"></input>
    <br>
    <label for="autorepeatSpeed">Key Autorepeat Speed (ms):</label> 
        <input type="number" required minlength="1" min="1" value=33 id="autorepeatSpeed"></input>
<p>Controls</p>
    <label for="moveLeft">Move Left:</label>
`;
let globalSettingHTML = `
<p>Global Settings</p>
    <label for="forceSettings">Enforce Local Settings</label>
        <input type="checkbox" id="forceSettings">
    <br>
    <label for="sevenBag">7-Bag RNG:</label>
        <input type="checkbox" id="sevenBag" checked="true">
    <br>
    <label for="gravity">Gravity cells per second</label>
        <input type="number" required minlength="1" value=5 id="gravity"></input>
    <br>
    <label for="softDrop">Soft Drop cells per second</label>
        <input type="number" required minlength="1" value=80 id="softDrop"></input>
    <br>
    <label for="lockDelay">Lock delay time in ms</label>
        <input type="number" required minlength="1" value=500 id="lockDelay"></input>
`

// settings menu methods
let settingMethods = {}

const getUISetting = (setting) => {
    const settingElement = document.getElementById(setting);

    switch(settingElement.type) {
        case "text":
            return settingElement.value;
        case "number":
            return settingElement.value;
        case "checkbox":
            return settingElement.checked;
    }
}

// set setting only in UI
const setUISetting = (setting, value) => {
    const settingElement = document.getElementById(setting);

    switch(settingElement.type) {
        case "text":
            settingElement.value = value;
        case "number":
            settingElement.value = value;
            break;
        case "checkbox":
            settingElement.checked = value;
            break;
    }
}

// close settings menu
const closeSettings = () => {
    settingsModal.style.display = 'none';
}

const saveSettings = (event) => {
    // keep form from refreshing page pt1
    event.preventDefault();

    for(let setting in localSettingList) {
        let value = getUISetting(setting);
        localSettingList[setting] = value;
    }
    if(isHost)
        for(let setting in globalSettingList) {
            let value = getUISetting(setting);
            globalSettingList[setting] = value;
        }

    setSettings();
    closeSettings();

    // keep form from refreshing page pt2
    return false;
}

// save settings and run relevant methods
const setSettings = () => {
    for(let setting in localSettingList) {
        let value = localSettingList[setting];
        let method = settingMethods[setting];
        
        if(method)
            method(value);
    }

    settingMethods.final(localSettingList.autorepeatDelay, localSettingList.autorepeatSpeed);
}

// generate settings modal
const newSettingsModal = () => {
    let rootDiv = document.getElementById('root');

    settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';

    let menuDiv = document.createElement('div');
    menuDiv.id = 'settingsMenu';

    // add menu elements
    menuDiv.innerHTML = `
        <span class="close">&times;</span>
        <form id="settingsForm">
            ${localSettingHTML}
        <br>
            ${isHost ? globalSettingHTML : '<i>You must be host to change global settings</i>'}
        <br>
        <input type="submit" value="Save">
        </form>
    `;

    settingsModal.appendChild(menuDiv);
    rootDiv.appendChild(settingsModal);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);

    // close the modal if the close button or if the page around the modal is clicked
    document.getElementsByClassName('close')[0].onclick = closeSettings;
    window.onclick = (event) => {
        if(event.target == settingsModal)
            closeSettings();
    }
}

// open settings menu
export const openSettings = () => {
    if(settingsModal == null)
        return;

    for(let setting in localSettingList) {
        setUISetting(setting, localSettingList[setting]);
    }

    settingsModal.style.display = 'block';
}

// get settings object to send to server
export const exportSettings = () => {
    return {
        local: localSettingList,
        global: globalSettingList,
    };
}

// apply settings received from server and return game settings object
export const applySettings = (server) => {
    // sync settings to host
    if(server.global.forceSettings) {
        localSettingList.autorepeatDelay = server.local.autorepeatDelay;
        localSettingList.autorepeatSpeed = server.local.autorepeatSpeed;
    }
    globalSettingList = server.global;

    setSettings();

    return {
        levelGravity: 1000 / globalSettingList.gravity,
        softDropGravity: 1000 / globalSettingList.softDrop,
        lockDelay: globalSettingList.lockDelay
    }
}

// set setting method
export const bindSetting = (setting, method) => {
    settingMethods[setting] = method;
}

// settings elements that depend on server side data
export const init = (username, host) => {
    if(settingsModal)
        settingsModal.remove();

    isHost = host;
    newSettingsModal();

    localSettingList.usernameSetting = username;
    document.getElementById('usernameSetting').value = username;
}