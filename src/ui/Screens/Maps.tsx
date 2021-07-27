import { Context, GameState, UiState } from 'context';
import * as React from 'react';
import styled from 'styled-components';
import { KeyButtonData, KeyButtonList } from 'ui/Components/KeyButtonList';

const Container = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    overflow: auto;
    max-height: 100%;
`;

interface Props {
    ctx: Context;
}

export const Maps = React.memo((props: Props) => {
    const handleStart = async (data: KeyButtonData) => {
        try {
            props.ctx.state.uiState.set(UiState.Loading);
            props.ctx.level.reset(props.ctx);
            await props.ctx.level.load(props.ctx, data.map);
            props.ctx.state.uiState.set(UiState.None);
        } catch (e) {
            alert(`Failed to load map: ${e.message}`);
            props.ctx.state.uiState.set(UiState.MainMenu);
        }

        props.ctx.setGameState(GameState.Running);
    };

    const maps = props.ctx.state.maps.get().map(m => (
        { children: m, onClick: handleStart, data: { map: m } }
    ));

    return (
        <Container>
            <KeyButtonList ctx={props.ctx} buttons={maps} />
        </Container>
    );
});
