// shared objects
let session = null;

// html elements
let settingsModal = null;

// settings data objects
const cookieVersion = '1.0';

const defaultSettings = {
    local: {
        usernameSetting: 'none',
        autorepeatDelay: 167,
        autorepeatSpeed: 33,
    },
    control: {
        moveLeft: 'ArrowLeft',
        moveRight: 'ArrowRight',
        rotLeft: 'z',
        rotRight: 'ArrowUp',
        rot180: 'a',
        softDrop: 'ArrowDown',
        hardDrop: ' ',
        hold: 'c',
    },
    global: {
        forceSettings: false,
        sevenBag: true,
        gravity: 5,
        softDropSpeed: 80,
        lockDelay: 500,
    }
}

let localSettingList = defaultSettings.local;       // local settings are set on the client side
let controlSettingList = defaultSettings.control;   // game controls
let globalSettingList = defaultSettings.global      // global settings are set for all players by the host

// settings ui html
let localSettingHTML = `
<p class="category">Local Settings</p>
    <label for="usernameSetting">Username: </label>
        <input type=text" id="usernameSetting" readonly> <input type="button" id="newUsernameButton" value="New"></input>
    <br>
    <label for="autorepeatDelay">Key Autorepeat Delay (ms):</label> 
        <input type="number" required minlength="1" id="autorepeatDelay"></input>
    <br>
    <label for="autorepeatSpeed">Key Autorepeat Speed (ms):</label> 
        <input type="number" required minlength="1" min="1" id="autorepeatSpeed"></input>
`;
let controlSettingHTML = `
<p class="category">Controls</p>
    <label for="moveLeft">Move Left:</label>
        <input type="text" id="moveLeft"></input>
    <br>
    <label for="moveRight">Move Right:</label>
        <input type="text" id="moveRight"></input>
    <br>
    <label for="rotLeft">Rotate Left:</label>
        <input type="text" id="rotLeft"></input>
    <br>
    <label for="rotRight">Rotate Right:</label>
        <input type="text" id="rotRight"></input>
    <br>
    <label for="rot180">Rotate 180:</label>
        <input type="text" id="rot180"></input>
    <br>
    <label for="softDrop">Soft Drop:</label>
        <input type="text" id="softDrop"></input>
    <br>
    <label for="hardDrop">Hard Drop:</label>
        <input type="text" id="hardDrop"></input>
    <br>
    <label for="hold">Hold:</label>
        <input type="text" id="hold"></input>
`
let globalSettingHTML = `
<p class="category">Global Settings</p>
    <label for="forceSettings">Enforce Local Settings</label>
        <input type="checkbox" id="forceSettings">
    <br>
    <label for="sevenBag">7-Bag RNG:</label>
        <input type="checkbox" id="sevenBag" checked="true">
    <br>
    <label for="gravity">Gravity cells per second</label>
        <input type="number" required minlength="1" id="gravity"></input>
    <br>
    <label for="softDropSpeed">Soft Drop cells per second</label>
        <input type="number" required minlength="1" id="softDropSpeed"></input>
    <br>
    <label for="lockDelay">Lock delay time in ms</label>
        <input type="number" required minlength="1" id="lockDelay"></input>
`

// settings menu methods
let settingMethods = {};
let controlSettingMethods = {};

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
            break;
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

// settings form submit button
const saveButton = (event) => {
    // keep form from refreshing page pt1
    event.preventDefault();

    for(let setting in localSettingList) {
        let value = getUISetting(setting);
        localSettingList[setting] = value;
    }
    for(let setting in controlSettingList) {
        let value = getUISetting(setting);
        controlSettingList[setting] = value;
    }
    if(session.isHost)
        for(let setting in globalSettingList) {
            let value = getUISetting(setting);
            globalSettingList[setting] = value;
        }

    setSettings();
    setCookieSettings();
    closeSettings();

    // keep form from refreshing page pt2
    return false;
}

// save settings and run relevant methods
const setSettings = () => {
    // set general settings
    for(let setting in localSettingList) {
        let value = localSettingList[setting];
        let method = settingMethods[setting];
        
        if(method)
            method(value);
    }

    // set controls
    for(let control in controlSettingList) {
        let value = controlSettingList[control];
        controlSettingMethods[control](value);
    }

    // final method that depends on multiple settings
    settingMethods.final(localSettingList.autorepeatDelay, localSettingList.autorepeatSpeed);
}

// set events for the controls settings
const setControlsEvents = () => {
    for(let setting in controlSettingList) {
        let control = document.getElementById(setting);

        control.addEventListener('keyup', (event) => {
            control.value = event.key;
            setUISetting(setting, event.key);
        });
    }
}

// set cookie
const setCookieSettings = () => {
    let cookieSettings = {};

    // set cookie object's properties to settings
    cookieSettings['version'] = cookieVersion;
    cookieSettings['local'] = localSettingList;
    cookieSettings['control'] = controlSettingList;
    if(session.isHost)
        cookieSettings['global'] = globalSettingList;

    // save cookie as JSON string
    document.cookie = `settings=${JSON.stringify(cookieSettings)}`
}

// read cookie
const getCookieSettings = () => {
    // extract cookie
    const cookieName = 'settings'
    let c = document.cookie.split(';').find( item => item.trim().startsWith(`${cookieName}=`) );

    // do nothing if the cookie does not exist
    if(!c)
        return false;

    // convert the JSON cookie string into an object
    let settingsCookie = JSON.parse(c.substring(`${cookieName}=`.length, c.length));

    // do nothing if the cookie is outdated
    if(settingsCookie.version != cookieVersion)
        return false;

    // set settings to the cookie's settings
    localSettingList = settingsCookie.local;
    controlSettingList = settingsCookie.control;
    if(session.isHost)
        globalSettingList = settingsCookie.global;

    return true;
}

// reset settings in form to defaults
const resetSettings = async (apply) => {
    let settingMethod = apply == true ? 
        (setting, destObject, srcObject) => {
            destObject[setting] = srcObject[setting];
        }
        :
        (setting, destObject, srcObject) => {
            setUISetting(setting, srcObject[setting]);
        };

    for(let setting in defaultSettings.local)
        settingMethod(setting, localSettingList, defaultSettings.local);
    
    for(let setting in defaultSettings.control)
        settingMethod(setting, controlSettingList, defaultSettings.control);
    
    if(session.isHost)
        for(let setting in defaultSettings.global)
            settingMethod(setting, globalSettingList, defaultSettings.global);

    // set settings that require server side data
    let newUsername = await session.getNewUsername();
    settingMethod('usernameSetting', localSettingList, { usernameSetting: newUsername });
}

// when the username button is clicked set the value of the button to the new username retrieved from the server
const usernameButton = async () => {
    await session.getNewUsername()
        .then((name) => {
            setUISetting('usernameSetting', name);
        });
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
            ${controlSettingHTML}
        <br>
            ${session.isHost ? globalSettingHTML : '<i>You must be host to change global settings</i>'}
        <br>
        <input class="buttons" id="resetButton" type="button" value="Reset Defaults">
        <input class="buttons" type="submit" value="Save">
        </form>
    `;

    settingsModal.appendChild(menuDiv);
    rootDiv.appendChild(settingsModal);

    // form buttons 
    document.getElementById('newUsernameButton').onclick = usernameButton;
    document.getElementById('resetButton').onclick = resetSettings;
    document.getElementById('settingsForm').addEventListener('submit', saveButton);

    // close the modal if the close button or if the page around the modal is clicked
    document.getElementsByClassName('close')[0].onclick = closeSettings;
    window.onclick = (event) => {
        if(event.target == settingsModal)
            closeSettings();
    }

    setControlsEvents();
}

// open settings menu
export const openSettings = () => {
    if(settingsModal == null)
        return;

    for(let setting in localSettingList)
        setUISetting(setting, localSettingList[setting]);
    for(let setting in controlSettingList)
        setUISetting(setting, controlSettingList[setting]);
    if(session.isHost)
        for(let setting in globalSettingList)
            setUISetting(setting, globalSettingList[setting]);

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
        softDropGravity: 1000 / globalSettingList.softDropSpeed,
        lockDelay: globalSettingList.lockDelay
    }
}

// set setting method
export const bindSetting = (setting, method, control) => {
    if(control)
        controlSettingMethods[setting] = method;
    else
        settingMethods[setting] = method;
}

// settings elements that depend on server side data
export const init = async (initSession) => {
    session = initSession;

    if(settingsModal)
        settingsModal.remove();

    newSettingsModal();

    if(!getCookieSettings())
        await resetSettings(true);

    setCookieSettings();
    setSettings();
}