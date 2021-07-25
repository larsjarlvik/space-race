import { Context, GameState } from 'context';
import * as React from 'react';
import styled from 'styled-components';

const Container = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    overflow: auto;
    max-height: 100%;
`;

const Button = styled.button`
    display: block;
    margin-bottom: 12px;
    text-align: left;

    &:first-child {
        margin-top: 30px;
    }
    &:last-child {
        margin-bottom: 30px;
    }
    &:hover {
        color: #d00;
    }

    span {
        display: inline-block;
        width: 230px;
    }
`;


interface Props {
    ctx: Context;
}

export const Maps = React.memo((props: Props) => {
    const handleStart = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const map = (e.target as HTMLButtonElement).dataset.map!;

        props.ctx.setGameState(GameState.Loading);
        await props.ctx.level.load(props.ctx, map);
        props.ctx.setGameState(GameState.Running);
    };

    const maps = props.ctx.state.maps.get().map(m => (
        <Button key={m} onClick={handleStart} data-map={m}>{m}</Button>
    ));

    return (
        <Container>
            {maps}
        </Container>
    );
});
