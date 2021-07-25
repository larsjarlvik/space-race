import { useState } from '@hookstate/core';
import styled, { css } from 'styled-components';
import { Context, GameState } from 'context';
import * as React from 'react';
import { Fps } from './Fps';
import { Loading } from './Screens/Loading';
import { MainMenu } from './Screens/MainMenu';
import { Maps } from './Screens/Maps';
import { Overview } from './Level/Overview';
import ReactDOM from 'react-dom';
import { Menu } from './Menu';

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

const getScreen = (ctx: Context, gameState: GameState) => {
    switch (gameState) {
        case GameState.Loading:
            return <Loading />;
        case GameState.MainMenu:
            return <MainMenu ctx={ctx} displayText="" />;
        case GameState.Completed:
            return <MainMenu ctx={ctx} displayText="Level Complete!" />;
        case GameState.Crashed:
            return <MainMenu ctx={ctx} displayText="Crashed!" />;
        case GameState.Maps:
            return <Maps ctx={ctx} />;
    }

    return null;
};

export const Main = React.memo((props: Props) => {
    const state = useState(props.ctx.state);
    const screen = getScreen(props.ctx, state.gameState.get());
    const mapMaking = state.mapMaking.get() ?
        ReactDOM.createPortal(<Overview ctx={props.ctx} />, document.getElementById('map')!) : null;

    const handleToggleMenu = () => {
        props.ctx.state.gameState.set(GameState.MainMenu);
    };

    const menu = state.gameState.get() === GameState.Running ?
        ReactDOM.createPortal(<Menu onClick={handleToggleMenu} />, document.getElementById('map')!) : null;

    return (
        <>
            <Backdrop show={screen !== null}>
                {screen}
            </Backdrop>
            <Fps fps={state.fps.get()} />
            {mapMaking}
            {menu}
        </>
    );
});
