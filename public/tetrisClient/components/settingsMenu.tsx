import * as React from 'react';
import * as ReactDOM from 'react-dom';

// a setting in the settings form
const settingField = ({ setting, label, props, readonly, onClick }) => (
    <br>
        <label for={setting}>{label} </label>
        <input id={setting} readonly={readonly} {...props} />
        {readonly ? (<input type="button" id={`new${setting}`} value="New" onClick={onClick}></input>) : ''}
    </br>
)

// collection of setting fields
const settingCategory = ({ title, settingMap }) => {
    let settings: HTMLElement[] = [];
    for(let [setting, details] of settingMap) {
        settings.push(
            <settingField   
                setting={setting} 
                label={details.label}
                props={details.props}
                readonly={details.readonly}
                onClick={details.onClick}
            />
        );
    }

    return(
        <br>
        <p class="category">{title}</p>
            {settings}
        </br>
    );
}


// settings form; categoryMap: map of default settings, readonlyMethods: methods for read only settings' buttons, onReset: method called when reset settings button is clicked, onSave: method called when save button is clicked
export const SettingsMenu = ({ categoryMap, onReset, onSave }) => {
    let categories: HTMLElement[] = [];
    for(let [category, settings] of categoryMap) {
        categories.push(
            <settingCategory 
                title={category} 
                settingMap={settings} 
            />
        );
    }


    return (
        <div>
            <span class="close">&times;</span>
            <form id="settingsForm">

            {categories}

            <input class="buttons" id="resetButton" type="button" value="Reset Defaults" />
            <input class="buttons" type="submit" value="Save" />
            </form>
        </div>
    );
}