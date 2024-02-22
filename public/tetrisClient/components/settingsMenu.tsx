import * as React from 'react';
import * as ReactDOM from 'react-dom';

/*

<p class="category">Local Settings</p>
    <label for="usernameSetting">Username: </label>
        <input type=text" id="usernameSetting" readonly> <input type="button" id="newUsernameButton" value="New"></input>
    <br>
    <label for="autorepeatDelay">Key Autorepeat Delay (ms):</label> 
        <input type="number" required minlength="1" id="autorepeatDelay"></input>
    <br>
    <label for="autorepeatSpeed">Key Autorepeat Speed (ms):</label> 
        <input type="number" required minlength="1" min="1" id="autorepeatSpeed"></input>

*/

// a setting in the settings form
const settingField = ({ setting, label, props, readonly, onClick }) => {
    return (
        <br>
            <label for={setting}>{label} </label>
            <input id={setting} readonly={readonly} {...props} />
            {readonly ? (<input type="button" id={`new${setting}`} value="New" onClick={onClick}></input>) : ''}
        </br>
    )
}

// collection of setting fields
const settingCategory = ({ title, children }) => {
    return (
        <br>
            <p class="category">{title}</p>
                { children }
        </br>
    )
}

// settings form; categoryMap: map of default settings, readonlyMethods: methods for read only settings' buttons, onReset: method called when reset settings button is clicked, onSave: method called when save button is clicked
export const SettingsMenu = ({ categoryMap, readonlyMethods, onReset, onSave }) => {
    return (
        <div>
            <span class="close">&times;</span>
            <form id="settingsForm">



            <input class="buttons" id="resetButton" type="button" value="Reset Defaults" />
            <input class="buttons" type="submit" value="Save" />
            </form>
        </div>
    );
}