import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as drawUtils from '../modules/drawUtils.tsx';

// canvas with grid drawn on it
export const GridCanvas = ({ view, width, height, scale, id }: { view: drawUtils.View, width: number, height: number, scale: string, id: string }) => {
    const canvas = React.useRef(null);

    React.useEffect(() => drawUtils.drawGrid(view, canvas.current));

    return <canvas ref={canvas} width={width} height={height} style={{height: scale}} id={id} />;
}