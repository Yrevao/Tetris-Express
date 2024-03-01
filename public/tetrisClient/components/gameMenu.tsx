import * as React from 'react';
import * as ReactDOM from 'react-dom';

function ScoreField({ name, label } : { name: string, label: string }) {
    return (
        <>
            <span>{label}</span>
            <span id={name}>
            </span>
            <br />
        </>
    );
}

export function ScoreBoard({ fieldMap, onLoad }: { fieldMap: Map<string, string>, onLoad: Function }) {
    React.useEffect(() => onLoad());

    let scores: React.ReactElement[] = [];

    for(let [name, label] of fieldMap) {
        scores.push(
            <ScoreField
                name={name}
                label={label}
            />
        );
    }

    return(
        <>
            {scores}
        </>
    );
}