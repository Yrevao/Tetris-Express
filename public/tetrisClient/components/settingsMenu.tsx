import * as React from 'react';
import * as ReactDOM from 'react-dom';

// a setting in the settings form
function SettingField({ setting, label, type, minlength, readonly, onClick }) {
    return (
        <>
            <label for={setting}>{label}</label>
            <input id={setting} type={type} minlength={minlength} readonly={readonly} />
            {readonly ? (<input type="button" id={`new${setting}`} value="New" onClick={onClick}></input>) : ''}
            <br />
        </>
    );
}

// collection of setting fields
function SettingCategory({ title, settingList }) {
    let settings: any = settingList.map(config => 
        <SettingField
            setting={config.setting}
            label={config.label}
            type={config.type}
            minlength={config.minlength}
            readonly={config.readonly}
            onClick={config.onClick}
        />
    );

    return(
        <>
            <p class="category">{title}</p>
                {settings}
            <br />
        </>
    );
}

// settings form; categoryMap: map of default settings, readonlyMethods: methods for read only settings' buttons, onReset: method called when reset settings button is clicked, onSave: method called when save button is clicked
export default function SettingsMenu({ categoryMap, onLoad, onSubmit, onReset, onClose }) {
    React.useEffect(onLoad);

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
            <span class="close" onClick={onClose}>&times;</span>
            <form id="settingsForm" onSubmit={onSubmit}>

            {categories}

            <input class="buttons" id="resetButton" type="button" value="Reset Defaults" onClick={onReset} />
            <input class="buttons" type="submit" value="Save" />
            </form>
        </>
    );
}