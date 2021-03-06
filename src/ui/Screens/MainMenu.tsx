import { Context, GameState, UiState } from 'context';
import { Attribute } from 'level/level';
import * as React from 'react';
import { Button, KeyButtonList } from 'ui/Components/KeyButtonList';

interface Props {
    ctx: Context;
}

export const MainMenu = React.memo((props: Props) => {
    const handleStart = () => {
        props.ctx.state.uiState.set(UiState.MapSelector);
    };

    const handleMap = () => {
        props.ctx.level.clear(props.ctx);
        props.ctx.level.setTile(3, 0, 1, Attribute.Default);
        props.ctx.state.uiState.set(UiState.MapBuilder);
        props.ctx.state.scrollMap.set(true);
        props.ctx.setGameState(GameState.MapMaking);
    };

    const handleFullScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.ctx.toggleFullscreen();
        (e.target as any).blur();
    };

    const buttons = [
        { children: 'Start Game', onClick: handleStart },
        { children: 'Create Map', onClick: handleMap },
        { children: 'Toggle Fullscreen', onClick: handleFullScreen },
    ] as Button[];

    return (
        <section>
            <KeyButtonList buttons={buttons} />
        </section>
    );
});
