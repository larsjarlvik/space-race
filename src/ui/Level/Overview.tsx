import { Context } from 'context';
import { Attribute, Tile } from 'level/level';
import * as React from 'react';
import styled, { css } from 'styled-components';

const MAX_LEVEL = 4;

const Container = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 20px 20px;
    display: flex;
    background: rgba(0, 0, 0, 0.7);
`;

const Scroll = styled.div`
    overflow-y: scroll;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
        width: 3px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.4);
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 0;
    }
`;

const Row = styled.div`
    display: flex;
    flex-wrap: nowrap;
`;

const TileWrapper = styled.div`
    border: 1px solid rgba(255, 255, 255, 0.3);
    line-height: 0;
`;

const Tile = styled.button<{ a?: Attribute }>`
    width: 16px;
    height: 16px;
    border: none;
    background: #fff;
    opacity: 0;
    border-radius: 0;

    ${({ a }) => a === Attribute.FinishLine && css`
        background: #c00;
        opacity: 1 !important;
    `}
`;


interface Props {
    ctx: Context;
}

export const Level = React.memo((props: Props) => {
    const tiles: Tile[] = props.ctx.level?.tiles ?? [];

    const setTile = (add: Tile) => {
        const t = tiles.findIndex(t => t.x === add.x && t.z === add.z);
        if (t) {
            tiles[t] = add;
            return;
        }

        tiles.push(add);
    };

    const clickTile = (e: React.MouseEvent<HTMLButtonElement>) => {
        const tile = (e.target as HTMLButtonElement);

        const x = parseInt(tile.dataset['tileX']!);
        const z = parseInt(tile.dataset['tileZ']!);

        let l = parseInt(tile.dataset['tileL'] ?? '0') + 1;
        if (l > MAX_LEVEL) l = 0;

        const mapTile = { x, z, l };
        tile.dataset['tileL'] = mapTile.l.toString();
        setTile(mapTile);
        tile.style.opacity = `${mapTile.l / MAX_LEVEL}`;
        props.ctx.level!.addTile(props.ctx, mapTile);

        tile.blur();
    };

    const generateGrid = () => {
        const rows: React.ReactNode[] = [];

        for (let z = 150; z >= 0; z--) {
            const tileNodes: React.ReactNode[] = [];
            for (let x = 0; x < 7; x++) {
                const t = tiles.find(t => t.x === x && t.z === z);
                const style = t && { opacity: t.l / MAX_LEVEL };
                tileNodes.push(<TileWrapper><Tile key={x} a={t?.a} onClick={clickTile} data-tile-z={z} data-tile-x={x} style={style} /></TileWrapper>);
            }

            rows.push(
                <Row key={z}>{tileNodes}</Row>
            );
        }

        return rows;
    };

    return (
        <Container>
            <Scroll>
                {generateGrid()}
            </Scroll>
        </Container>
    );
});
