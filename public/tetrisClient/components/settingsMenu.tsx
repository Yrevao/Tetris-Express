import * as React from 'react';
import * as ReactDOM from 'react-dom';

export type SettingConfig = {
    setting: string,
    label: string,
    type: string,
    minlength: number,
    readonly: boolean,
    onClick: Function,
}

// a setting field in the settings form
function SettingField({ config }: { config: SettingConfig }) {
    return (
        <>
            <label htmlFor={config.setting}>{config.label}</label>
            <input id={config.setting} type={config.type} minLength={config.minlength} readOnly={config.readonly} />
            {config.readonly ? (<input type="button" id={`new${config.setting}`} value="New" onClick={() => config.onClick()}></input>) : ''}
            <br />
        </>
    );
}

// collection of setting fields
function SettingCategory({ title, settingList }: { title: string, settingList: SettingConfig[] }) {
    let settings: any = settingList.map(config => 
        <SettingField
            config={config}
        />
    );

    return(
        <>
            <p className="category">{title}</p>
                {settings}
            <br />
        </>
    );
}

// settings form; categoryMap: map of default settings, readonlyMethods: methods for read only settings' buttons, onReset: method called when reset settings button is clicked, onSave: method called when save button is clicked
export function Menu({ categoryMap, onLoad, onSubmit, onReset, onClose }: { categoryMap: Map<string, SettingConfig[]>, onLoad: Function, onSubmit: Function, onReset: Function, onClose: Function }) {
    // after components are added to DOM run this method
    React.useEffect(() => onLoad());

    let categories: any = [];
    for(let [category, settings] of categoryMap) {
        categories.push(
            <SettingCategory
                title={category}
                settingList={settings}
            />
        );
    }

    return (
        <>
            <span className="close" onClick={() =>  onClose()}>&times;</span>
            <form id="settingsForm" onSubmit={() => onSubmit()}>

            {categories}

            <input className="buttons" id="resetButton" type="button" value="Reset Defaults" onClick={() => onReset()} />
            <input className="buttons" type="submit" value="Save" />
            </form>
        </>
    );
}