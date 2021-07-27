import { Context, GameState, UiState } from 'context';
import * as React from 'react';
import { KeyButtonList } from 'ui/Components/KeyButtonList';

interface Props {
    displayText?: string;
    ctx: Context;
}

export const GameEnd = React.memo((props: Props) => {
    const handleRestart = () => {
        props.ctx.state.uiState.set(UiState.None);
        props.ctx.setGameState(GameState.Running, true);
    };

    const handleMainMenu = () => {
        props.ctx.level.reset(props.ctx);
        props.ctx.state.uiState.set(UiState.MainMenu);
    };

    return (
        <section>
            <h2>{props.ctx.state.gameEndMessage.get()}</h2>
            <KeyButtonList ctx={props.ctx} buttons={[
                { children: 'Restart', onClick: handleRestart },
                { children: 'Main Menu', onClick: handleMainMenu },
            ]} />
        </section>
    );
});
