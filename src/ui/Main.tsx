import { useState } from '@hookstate/core';
import styled, { css } from 'styled-components';
import { Context, GameState } from 'context';
import * as React from 'react';
import { Fps } from './Fps';
import { Loading } from './Screens/Loading';
import { Paused } from './Screens/Paused';
import { Overview } from './Level/Overview';

interface Props {
    ctx: Context;
}



const Backdrop = styled.main<{ show: boolean }>`
    opacity: 0;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 0.3s ease-in-out;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    backdrop-filter: blur(8px);

    ${({ show }) => show && css`
        opacity: 1;
        pointer-events: all;
    `}
`;

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
    const state = useState(props.ctx.state);
    const screen = getScreen(state.gameState.get());
    const mapMaking = state.mapMaking.get() ? <Overview ctx={props.ctx} /> : null;

    return (
        <>
            <Backdrop show={screen !== null}>
                {screen}
            </Backdrop>
            <Fps fps={state.fps.get()} />
            {mapMaking}
        </>
    );
});
