import * as React from 'react';

const style = {
    position: 'fixed',
    top: '12px',
    left: '12px',
    fontSize: '14px',
} as React.CSSProperties;


interface Props {
    fps: number;
}

export const Fps = React.memo((props: Props) => {
    return (
        <div style={style}>
            FPS: {props.fps}
        </div>
    );
});
