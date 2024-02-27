// external modules
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import SettingsMenu from '../components/settingsMenu.tsx';

// shared objects
let session: any = null;

// html elements
let settingsModal: HTMLDivElement | null = null;

// settings data objects
const cookieName: string = 'settings';
const cookieVersion: string = '1.0.2';

// types
type SettingValue = string | number | boolean;          // type for the value of settings when saved to maps
type CookieValue = string | [string, SettingValue][];   // type used to convert from setting maps to JSON cookie string and back
type SettingConfig = {
    setting: string,
    label: string,
    type: string,
    minlength: number,
    readonly: boolean,
    onClick: Function | undefined,
}

// default settings
const defaultLocalSettings: Map<string, SettingValue> = new Map([   // local settings are set on the client side
    ['uernameSetting', 'none'],
    ['autorepeatDelay', 167],
    ['autorepeatSpeed', 33],
] as [string, SettingValue][]);

const defaultControlSettings: Map<string, SettingValue> = new Map([ // game keyboard controls
    ['moveLeft', 'ArrowLeft'],
    ['moveRight', 'ArrowRight'],
    ['rotLeft', 'z'],
    ['rotRight', 'ArrowUp'],
    ['rot180', 'a'],
    ['softDrop', 'ArrowDown'],
    ['hardDrop', ' '],
    ['hold', 'c'],
] as [string, SettingValue][]);

const defaultGlobalSettings: Map<string, SettingValue> = new Map([  // global settings are set for all players by the host
    ['forceSettings', false],
    ['sevenBag', true],
    ['gravity', 5],
    ['softDropSpeed', 80],
    ['lockDelay', 500],
] as [string, SettingValue][]);

// UI configuration
const localSettingConfig: SettingConfig[] = [   // local settings are set on the client side
    {
        setting: 'uernameSetting',
        label: 'Username:',
        type: 'text',
        minlength: 0,
        readonly: true,
        onClick: ()=>{},
    },
    {
        setting: 'autorepeatDelay',
        label: 'Key Autorepeat Delay (ms):',
        type: 'number',
        minlength: 1,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'autorepeatSpeed',
        label: 'Key Autorepeat Speed (ms):',
        type: 'number',
        minlength: 1,
        readonly: false,
        onClick: ()=>{},
    }
];

const controlSettingConfig: SettingConfig[] = [
    {
        setting: 'moveLeft',
        label: 'Move Left:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'moveRight',
        label: 'Move Right:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'rotLeft',
        label: 'Rotate Left:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'rotRight',
        label: 'Rotate Right:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'rot180',
        label: 'Rotate 180:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'softDrop',
        label: 'Soft Drop:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'hardDrop',
        label: 'Hard Drop:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'hold',
        label: 'Hold:',
        type: 'text',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    }
];

const globalSettingConfig: SettingConfig[] = [
    {
        setting: 'forceSettings',
        label: 'Enforce Local Settings:',
        type: 'checkbox',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'sevenBag',
        label: '7-Bag RNG:',
        type: 'checkbox',
        minlength: 0,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'gravity',
        label: 'Gravity cells per second:',
        type: 'number',
        minlength: 1,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'softDropSpeed',
        label: 'Soft Drop cells per second',
        type: 'number',
        minlength: 1,
        readonly: false,
        onClick: ()=>{},
    },
    {
        setting: 'lockDelay',
        label: 'Lock delay time (ms):',
        type: 'number',
        minlength: 1,
        readonly: false,
        onClick: ()=>{},
    }
];

const settingCategoryConfig: Map<string, SettingConfig[]> = new Map([
    ['Local Settings', localSettingConfig],
    ['Controls', controlSettingConfig],
    ['Global Settings', globalSettingConfig],
]);

// current settings
let localSettingList: Map<string, SettingValue> = new Map(defaultLocalSettings);
let controlSettingList: Map<string, SettingValue> = new Map(defaultControlSettings);
let globalSettingList: Map<string, SettingValue> = new Map(defaultGlobalSettings);

// settings menu methods
let settingMethods: Map<string, Function> = new Map();
let controlSettingMethods: Map<string, Function> = new Map();

// get value of a setting in the UI
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
const setUISetting = (setting: string, value: SettingValue): boolean => {
    let settingElement: HTMLInputElement | null = (document.getElementById(setting) as HTMLInputElement | null);

    if(!settingElement)
        return false;

    switch(settingElement.type) {
        case "text":
            settingElement.value = value.toString();
            break;
        case "number":
            settingElement.value = value.toString();
            break;
        case "checkbox":
            settingElement.checked = value as boolean;
            break;
    }

    return true;
}

// save a value from the srcMap to the destMap
const syncMap = (key: string, destMap: Map<string, SettingValue>, srcMap: Map<string, SettingValue>): boolean => {
    let value: SettingValue | undefined = srcMap.get(key);
    if(!value)
        return false;

    destMap.set(key, value);
    return true;
}

// lookup setting value and set it in the UI, return false if the setting dosen't exist
const syncUISetting = (setting: string, srcMap: Map<string, SettingValue>): boolean => {
    let value: SettingValue | undefined = srcMap.get(setting);
    if(!value)
        return false;

    return setUISetting(setting, value);
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

    for(let setting of controlSettingList.keys()) {
        let value: string | boolean = getUISetting(setting);
        controlSettingList.set(setting, value);
    }

    if(session.isHost || !globalSettingList.get('forceSettings'))
        for(let setting of localSettingList.keys()) {
            let value: string | boolean = getUISetting(setting);
            localSettingList.set(setting, value);
        }
    if(session.isHost)
        for(let setting of globalSettingList.keys()) {
            let value: string | boolean = getUISetting(setting);
            globalSettingList.set(setting, value);
        }

    setSettings();
    setCookieSettings();
    closeSettings();

    // keep form from refreshing page pt2
    return false;
}

// run all mapped setting methods for a given setting map
const runSettings = (settingMap: Map<string, SettingValue>, methodMap) => {
    for(let [setting, value] of settingMap) {
        let method: Function | undefined = methodMap.get(setting);
        if(method)
            method(value);
    }
}

// save settings and run relevant methods
const setSettings = () => {
    // a method run before the settings are set; is set to clear all keybinds before settings new ones in lobby.ts
    let beforeMethod: Function | undefined = settingMethods.get('before');
    if(beforeMethod)
        beforeMethod();

    // run local and control setting methods
    runSettings(localSettingList, settingMethods);
    runSettings(controlSettingList, controlSettingMethods);
}

// set events for the controls settings
const setControlsEvents = () => {
    for(let setting of controlSettingList.keys()) {
        let control: HTMLInputElement | null = document.getElementById(setting) as HTMLInputElement;
        if(!control)
            continue;

        control.addEventListener('keyup', (event: KeyboardEvent) => {
            setUISetting(setting, event.key);
        });
    }
}

// set cookie
const setCookieSettings = () => {
    let cookieSettings: Map<string, CookieValue> = new Map([
        ['version', cookieVersion],
        ['local', Array.from(localSettingList.entries())],
        ['control', Array.from(controlSettingList.entries())],
        ['global', Array.from(globalSettingList.entries())],
    ] as [string, CookieValue][]);

    // save cookie as JSON string
    document.cookie = `settings=${JSON.stringify(Array.from(cookieSettings.entries()))}`
}

// read cookie
const getCookieSettings = (): boolean => {
    // extract settings cookie from cookie string
    let cookieString: string | undefined = document.cookie.split(';').find( item => item.trim().startsWith(`${cookieName}=`) );

    // do nothing if the settings cookie does not exist
    if(!cookieString)
        return false;

    // convert the JSON cookie string into an object
    let settingsCookie: Map<string, CookieValue> = new Map(JSON.parse(cookieString.substring(`${cookieName}=`.length, cookieString.length)));

    // do nothing if the cookie is outdated
    if(settingsCookie.get('version') != cookieVersion)
        return false;

    // ensure all settings are in the cookie
    let localSettings: CookieValue | undefined = settingsCookie.get('local');
    let controlSettings: CookieValue | undefined = settingsCookie.get('control');
    let globalSettings: CookieValue | undefined = settingsCookie.get('global');
    if(!localSettings || !controlSettings || !globalSettings)
        return false;

    // set settings to the cookie's settings
    localSettingList = new Map(localSettings as [string, SettingValue][]);
    controlSettingList = new Map(controlSettings as [string, SettingValue][]);
    if(session.isHost)
        globalSettingList = new Map(globalSettings as [string, SettingValue][]);

    return true;
}

// reset settings in form to defaults
const resetSettings = async (apply?: boolean) => {
    let settingMethod = apply ? 
        (setting: string, destMap: Map<string, SettingValue>, srcMap: Map<string, SettingValue>): boolean =>
            syncMap(setting, destMap, srcMap)
        :
        (setting: string, destMap: Map<string, SettingValue>, srcMap: Map<string, SettingValue>): boolean =>
            syncUISetting(setting, srcMap);

    for(let setting of defaultLocalSettings.keys())
        settingMethod(setting, localSettingList, defaultLocalSettings);
    
    for(let setting of defaultControlSettings.keys())
        settingMethod(setting, controlSettingList, defaultControlSettings);
    
    if(session.isHost)
        for(let setting of defaultGlobalSettings.keys())
            settingMethod(setting, globalSettingList, defaultGlobalSettings);

    // set settings that require server side data
    await session.getNewUsername()
        .then((data: string) => {
            settingMethod('usernameSetting', localSettingList, new Map([['usernameSetting', data]]));
        });
}

// when the username button is clicked set the value of the button to the new username retrieved from the server
var usernameButtonMethod = async () => {
    await session.getNewUsername()
        .then((name: string) => {
            setUISetting('usernameSetting', name);
        });
}

const resetButtonMethod = async () => {
    await resetSettings();
}

// add menu options to the settings modal
const addMenuElements = (menuDiv: HTMLElement) => {
    // add menu elements
    const reactRoot = ReactDOM.createRoot(menuDiv);
    reactRoot.render(
        <SettingsMenu 
            categoryMap={settingCategoryConfig} 
            onSubmit={saveButton} 
            onReset={resetButtonMethod} 
            onClose={closeSettings} 
        />
    );

    // form buttons
    let newUsernameButton: HTMLButtonElement | null = document.getElementById('newusernameButton') as HTMLButtonElement | null;

    if(!newUsernameButton)
        return;

    newUsernameButton.onclick = usernameButtonMethod;

    window.onclick = (event: Event) => {
        if(event.target == settingsModal)
            closeSettings();
    }

    setControlsEvents();
}

// generate settings modal
const newSettingsModal = () => {
    // null check
    let rootDiv: HTMLDivElement | null = document.getElementById('root') as HTMLDivElement | null;
    if(!rootDiv)
        return;

    // create modal HTML elements
    settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';

    let menuDiv: HTMLDivElement = document.createElement('div');
    menuDiv.id = 'settingsMenu';

    // add modal to DOM
    settingsModal.appendChild(menuDiv);
    rootDiv.appendChild(settingsModal);

    // finish UI
    addMenuElements(menuDiv);
}

// open settings menu
export const openSettings = () => {
    if(settingsModal == null)
        return;

    for(let setting of localSettingList.keys())
        syncUISetting(setting, localSettingList);
    for(let setting of controlSettingList.keys())
        syncUISetting(setting, controlSettingList);
    if(session.isHost)
        for(let setting of globalSettingList.keys())
            syncUISetting(setting, globalSettingList);

    settingsModal.style.display = 'block';
}

// get settings object to send to server
export const exportSettings = (): any => {
    return {
        local: Array.from(localSettingList.entries()),
        global: Array.from(globalSettingList.entries()),
    };
}

// apply settings received from server and return game settings object
export const applySettings = (remoteSettings: any): any => {
    // return default settings if remoteSettings object is missing properties
    let fallbackSettings: any = {
        levelGravity: 1000 / 5,
        softDropGravity: 1000 / 80,
        lockDelay: 500,
    }

    // null checks
    if(!remoteSettings || !remoteSettings.local || !remoteSettings.global)
        return fallbackSettings;

    // generate objects from remote settings
    let remoteLocalSettings: Map<string, SettingValue> = new Map(remoteSettings.local as [string, SettingValue][]);
    globalSettingList = new Map(remoteSettings.global as [string, SettingValue][]);

    // sync to settings from host if host has force local settings enabled
    if(globalSettingList.get('forceSettings')) {
        let autorepeatDelay: SettingValue | undefined = remoteLocalSettings.get('autorepeatDelay');
        let autorepeatSpeed: SettingValue | undefined = remoteLocalSettings.get('autorepeatSpeed');

        if(autorepeatDelay && autorepeatSpeed) {
            localSettingList.set('autorepeatDelay', autorepeatDelay);
            localSettingList.set('autorepeatSpeed', autorepeatSpeed);
        }
    }

    setSettings();

    // values applied outside of settings
    let gravity: SettingValue | undefined = globalSettingList.get('gravity');
    let softDropSpeed: SettingValue | undefined = globalSettingList.get('softDropSpeed');
    let lockDelay: SettingValue | undefined = globalSettingList.get('lockDelay');

    if(!gravity || !softDropSpeed || !lockDelay)
        return fallbackSettings;

    return {
        levelGravity: 1000 / (gravity as number),
        softDropGravity: 1000 / (softDropSpeed as number),
        lockDelay: lockDelay as number,
    }
}

// set setting method
export const bindSetting = (setting: string, method: Function, control: boolean) => {
    if(control)
        controlSettingMethods.set(setting, method);
    else
        settingMethods.set(setting, method);
}

// refresh settings menu, used for when the user becomes the host and needs full host settings
export const refreshSettingsUI = () => {
    let menuDiv: HTMLElement | null = document.getElementById('settingsMenu');
    if(!menuDiv)
        return;

    closeSettings();
    addMenuElements(menuDiv);
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