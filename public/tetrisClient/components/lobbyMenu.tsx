import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as draw from './draw.tsx';
import * as drawUtils from '../modules/drawUtils.tsx';
import * as gameUtils from '../modules/gameUtils.tsx';

// draw a board on a canvas and label it with a name above
const Board = ({ id, order, name, grid }: { id: string, order: string, name: string, grid: gameUtils.Grid }) => {
    const gridView: drawUtils.View = drawUtils.newView(10, 20, 0, 20, grid);

    return(
        <div id={`opponent-${id}`} style={{order: order}}>
            <div id={`nameplate-${id}`}>
                {name}
            </div>
            <draw.GridCanvas
                view={gridView}
                width={1000}
                height={2000}
                scale='10vh'
                id={id}
            />
        </div>
    );
}

// draw all opponent boards and respective usernames
export const OpponentBoards = ({ boardMap, userMap }: { boardMap: Map<string, gameUtils.Grid>, userMap: Map<string, string> }) => {
    // array of board react elements
    let boards: any = [];
    // array of users sorted by id
    let sortedUsers: string[] = Array.from(userMap.keys()).sort((a, b) => {
        return a.localeCompare(b, "en");
    });

    for(let i in sortedUsers) {
        let id: string = sortedUsers[i];
        let name: string | undefined = userMap.get(id);
        let grid: gameUtils.Grid | undefined = boardMap.get(id);

        if(!name || !grid)
            continue;

        boards.push(
            <Board
                id={id}
                order={i}
                name={name}
                grid={grid}
            />
        )
    }

    return(
        <>
            {boards}
        </>
    );
}