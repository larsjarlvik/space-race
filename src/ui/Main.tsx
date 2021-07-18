import { useState } from '@hookstate/core';
import { Context, GameState } from 'context';
import * as React from 'react';
import { Fps } from './Fps';
import { Loading } from './screens/loading';
import { Paused } from './screens/Paused';

interface Props {
    ctx: Context;
}

const style = {
    backdropFilter: 'blur(8px)',
    opacity: 1,
    background: 'rgba(0, 0, 0, 0.7)',
    transition: 'opacity 0.3s ease-in-out',
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
} as React.CSSProperties;

const hideStyle = {
    ...style,
    opacity: 0,
    pointerEvents: 'none',
} as React.CSSProperties;

const getScreen = (gameState: GameState) => {
    switch (gameState) {
        case GameState.Loading:
            return <Loading />;
        case GameState.Paused:
            return <Paused displayText="" />;
        case GameState.Completed:
            return <Paused displayText="Level Complete!" />;
        case GameState.Crashed:
            return <Paused displayText="Crashed!" />;
    }

    return null;
};

export const Main = React.memo((props: Props) => {
    const state = useState(props.ctx.store);
    const screen = getScreen(state.gameState.get());

    return (
        <>
            <main style={screen ? style : hideStyle}>
                {screen}
            </main>
            <Fps fps={state.fps.get()} />
        </>
    );
});
