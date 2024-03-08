import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as draw from './draw.tsx';
import * as drawUtils from '../modules/drawUtils.tsx';
import * as gameUtils from '../modules/gameUtils.tsx';

const ScoreField = ({ name, label } : { name: string, label: string }) => {
    return (
        <>
            <span>{label}</span>
            <span id={name}>
            </span>
            <br />
        </>
    );
}

export const GameBoards = ({ holdGrid, gameGrid, nextGrid }: { holdGrid: gameUtils.Grid, gameGrid: gameUtils.Grid, nextGrid: gameUtils.Grid }) => {
    const holdView: drawUtils.View = drawUtils.newView(4, 2, 0, 0, holdGrid);
    const gameView: drawUtils.View = drawUtils.newView(10, 20, 0, 20, gameGrid);
    const nextView: drawUtils.View = drawUtils.newView(4, 14, 0, 0, nextGrid);

    return(
        <>
            <draw.GridCanvas
                view={holdView}
                width={400}
                height={200}
                scale={'4vh'}
                id={'holdCanvas'}
            />
            <draw.GridCanvas
                view={gameView}
                width={1000}
                height={2000}
                scale={'40vh'}
                id={'boardCanvas'}
            />
            <draw.GridCanvas
                view={nextView}
                width={400}
                height={1400}
                scale={'28vh'}
                id={'nextCanvas'}
            />
        </>
    );
}

export const ScoreBoard = ({ fieldMap, onLoad }: { fieldMap: Map<string, string>, onLoad: Function }) => {
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