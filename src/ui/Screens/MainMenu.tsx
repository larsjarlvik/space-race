import { Context, UiState } from 'context';
import * as React from 'react';
import { KeyButtonList } from 'ui/Components/KeyButtonList';

interface Props {
    ctx: Context;
}

export const MainMenu = React.memo((props: Props) => {
    const handleStart = () => {
        props.ctx.state.uiState.set(UiState.MapSelector);
    };

    const handleMap = () => {
        props.ctx.state.uiState.set(UiState.MapBuilder);
        props.ctx.state.scrollMap.set(true);
    };

    const handleFullScreen = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.ctx.toggleFullscreen();
        (e.target as any).blur();
    };

    return (
        <section>
            <KeyButtonList ctx={props.ctx} buttons={[
                { children: 'Start Game', onClick: handleStart },
                { children: 'Create Map', onClick: handleMap, kbd: 'M' },
                { children: 'Toggle Fullscreen', onClick: handleFullScreen, kbd: 'F' },
            ]} />
        </section>
    );
});
