// shared objects
let session: any = null;

// html elements
let settingsModal: HTMLDivElement | null = null;

// settings data objects
const cookieVersion: string = '1.0.1';

const defaultSettings: any = {
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

let localSettingList: any = defaultSettings.local;       // local settings are set on the client side
let controlSettingList: any = defaultSettings.control;   // game controls
let globalSettingList: any = defaultSettings.global      // global settings are set for all players by the host

// settings ui html
let localSettingHTML: string = `
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
let controlSettingHTML: string = `
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
let globalSettingHTML: string = `
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
let settingMethods: any = {};
let controlSettingMethods: any = {};

const getUISetting = (setting: string): string | boolean => {
    const settingElement: HTMLInputElement | null = (document.getElementById(setting) as HTMLInputElement | null);

    if(!settingElement)
        return false;

    switch(settingElement.type) {
        case "text":
            return settingElement.value;
        case "number":
            return settingElement.value;
        case "checkbox":
            return settingElement.checked;
    }

    return false;
}

// set setting only in UI
const setUISetting = (setting: string, value: string | boolean) => {
    const settingElement: HTMLInputElement | null = (document.getElementById(setting) as HTMLInputElement | null);

    if(!settingElement)
        return;

    switch(settingElement.type) {
        case "text":
            settingElement.value = (value as string);
            break;
        case "number":
            settingElement.value = (value as string);
            break;
        case "checkbox":
            settingElement.checked = (value as boolean);
            break;
    }
}

// close settings menu
const closeSettings = () => {
    if(!settingsModal)
        return;

    settingsModal.style.display = 'none';
}

// settings form submit button
const saveButton = (event: Event): boolean => {
    // keep form from refreshing page pt1
    event.preventDefault();

    for(let setting in controlSettingList) {
        let value: string | boolean = getUISetting(setting);
        controlSettingList[setting] = value;
    }

    if(session.isHost || !globalSettingList.forceSettings)
        for(let setting in localSettingList) {
            let value: string | boolean = getUISetting(setting);
            localSettingList[setting] = value;
        }
    if(session.isHost)
        for(let setting in globalSettingList) {
            let value: string | boolean = getUISetting(setting);
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
        let value: string | boolean = localSettingList[setting];
        let method: Function | null = settingMethods[setting];
        
        if(method)
            method(value);
    }

    // set controls
    for(let control in controlSettingList) {
        let value: string | boolean = controlSettingList[control];
        controlSettingMethods[control](value);
    }

    // final method that depends on multiple settings
    settingMethods.final(localSettingList.autorepeatDelay, localSettingList.autorepeatSpeed);
}

// set events for the controls settings
const setControlsEvents = () => {
    for(let setting in controlSettingList) {
        let control: HTMLInputElement = (document.getElementById(setting) as HTMLInputElement);

        control.addEventListener('keyup', (event: KeyboardEvent) => {
            control.value = event.key;
            setUISetting(setting, event.key);
        });
    }
}

// set cookie
const setCookieSettings = () => {
    let cookieSettings: any = {};

    // set cookie object's properties to settings
    cookieSettings['version'] = cookieVersion;
    cookieSettings['local'] = localSettingList;
    cookieSettings['control'] = controlSettingList;
    cookieSettings['global'] = globalSettingList;

    // save cookie as JSON string
    document.cookie = `settings=${JSON.stringify(cookieSettings)}`
}

// read cookie
const getCookieSettings = (): boolean => {
    // extract cookie
    const cookieName: string = 'settings'
    let cookieString: string | undefined = document.cookie.split(';').find( item => item.trim().startsWith(`${cookieName}=`) );

    // do nothing if the cookie does not exist
    if(!cookieString)
        return false;

    // convert the JSON cookie string into an object
    let settingsCookie: any = JSON.parse(cookieString.substring(`${cookieName}=`.length, cookieString.length));

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
const resetSettings = async (apply?: boolean) => {
    let settingMethod = apply == true ? 
        (setting: string, destObject: any, srcObject: any) => {
            destObject[setting] = srcObject[setting];
        }
        :
        (setting: string, destObject: any, srcObject: any) => {
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
    await session.getNewUsername()
        .then((data: any) => {
            settingMethod('usernameSetting', localSettingList, { usernameSetting: data });
        });
}

// when the username button is clicked set the value of the button to the new username retrieved from the server
const usernameButtonMethod = async () => {
    await session.getNewUsername()
        .then((name: any) => {
            setUISetting('usernameSetting', name);
        });
}

const resetButtonMethod = async () => {
    await resetSettings();
}

// generate settings modal
const newSettingsModal = () => {
    let rootDiv: HTMLDivElement | null = (document.getElementById('root') as HTMLDivElement | null);
    if(!rootDiv)
        return;

    settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';

    let menuDiv: HTMLDivElement = document.createElement('div');
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
    let newUsernameButton: HTMLButtonElement | null = (document.getElementById('newUsernameButton') as HTMLButtonElement | null);
    let resetButton: HTMLButtonElement | null = (document.getElementById('resetButton') as HTMLButtonElement | null);
    let settingsForm: HTMLFormElement | null = (document.getElementById('settingsForm') as HTMLFormElement | null);

    if(!newUsernameButton || !resetButton || !settingsForm)
        return;

    newUsernameButton.onclick = usernameButtonMethod;
    resetButton.onclick = resetButtonMethod;
    settingsForm.addEventListener('submit', saveButton);

    // close the modal if the close button or if the page around the modal is clicked
    let closeButton: HTMLSpanElement | null = (document.getElementsByClassName('close')[0] as HTMLSpanElement | null);
    if(!closeButton)
        return;

    closeButton.onclick = closeSettings;
    window.onclick = (event: Event) => {
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
export const exportSettings = (): any => {
    return {
        local: localSettingList,
        global: globalSettingList,
    };
}

// apply settings received from server and return game settings object
export const applySettings = (remoteSettings: any): any => {
    // sync settings to host
    if(remoteSettings.global.forceSettings) {
        localSettingList.autorepeatDelay = remoteSettings.local.autorepeatDelay;
        localSettingList.autorepeatSpeed = remoteSettings.local.autorepeatSpeed;
    }
    globalSettingList = remoteSettings.global;

    setSettings();

    return {
        levelGravity: 1000 / globalSettingList.gravity,
        softDropGravity: 1000 / globalSettingList.softDropSpeed,
        lockDelay: globalSettingList.lockDelay
    }
}

// set setting method
export const bindSetting = (setting: string, method: Function, control: boolean) => {
    if(control)
        controlSettingMethods[setting] = method;
    else
        settingMethods[setting] = method;
}

// settings elements that depend on server side data
export const init = async (initSession: any) => {
    session = initSession;

    if(settingsModal)
        settingsModal.remove();

    newSettingsModal();

    if(!getCookieSettings()) {
        await resetSettings(true);
    }

    setCookieSettings();
    setSettings();
}