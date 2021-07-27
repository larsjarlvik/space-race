import { useState } from '@hookstate/core';
import styled, { css } from 'styled-components';
import { Context, GameState, UiState } from 'context';
import * as React from 'react';
import { Fps } from './Fps';
import { Loading } from './Screens/Loading';
import { MainMenu } from './Screens/MainMenu';
import { Maps } from './Screens/Maps';
import { Overview } from './Level/Overview';
import ReactDOM from 'react-dom';
import { Menu } from './Menu';
import { GameEnd } from './Screens/GameEnd';

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
    z-index: 100;

    ${({ show }) => show && css`
        opacity: 1;
        pointer-events: all;
    `}
`;

const getScreen = (ctx: Context, uiState: UiState) => {
    switch (uiState) {
        case UiState.Loading:
            return <Backdrop show={screen !== null}><Loading /></Backdrop>;
        case UiState.MainMenu:
            return <Backdrop show={screen !== null}><MainMenu ctx={ctx} /></Backdrop>;
        case UiState.GameEnd:
            return <Backdrop show={screen !== null}><GameEnd ctx={ctx} /></Backdrop>;
        case UiState.MapSelector:
            return <Backdrop show={screen !== null}><Maps ctx={ctx} /></Backdrop>;
        case UiState.MapBuilder:
            return ReactDOM.createPortal(<Overview ctx={ctx} />, document.getElementById('map')!);
    }

    return null;
};

export const Main = React.memo((props: Props) => {
    const state = useState(props.ctx.state);
    const screen = getScreen(props.ctx, state.uiState.get());

    const handleToggleMenu = () => {
        props.ctx.state.gameState.set(GameState.Paused);
        props.ctx.state.uiState.set(UiState.MainMenu);
    };

    const menu = state.gameState.get() === GameState.Running ?
        ReactDOM.createPortal(<Menu onClick={handleToggleMenu} />, document.getElementById('map')!) : null;

    return (
        <>
            {screen}
            <Fps fps={state.fps.get()} />
            {menu}
        </>
    );
});
