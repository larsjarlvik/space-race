import { Context, GameState } from 'context';
import * as React from 'react';
import styled from 'styled-components';

const Button = styled.button`
    display: block;
    margin-bottom: 12px;
    text-align: left;

    &:hover {
        span {
            color: #d00;
        }
    }

    span {
        display: inline-block;
        width: 230px;
    }
`;


interface Props {
    displayText: string;
    ctx: Context;
}

export const Paused = React.memo((props: Props) => {
    const handleStart = () => {
        props.ctx.setGameState(GameState.Running, true);
    };

    const handleMap = () => {
        props.ctx.state.mapMaking.set(true);
        props.ctx.state.scrollMap.set(true);
    };

    const handleFullScreen = () => {
        props.ctx.toggleFullscreen();
    };

    return (
        <section>
            <h2>{props.displayText}</h2>
            <Button onClick={handleStart}><span>Start Game</span><kbd>R</kbd></Button>
            <Button onClick={handleMap}><span>Create Map</span><kbd>M</kbd></Button>
            <Button onClick={handleFullScreen}><span>Toggle Fullscreen</span><kbd>F</kbd></Button>
        </section>
    );
});
