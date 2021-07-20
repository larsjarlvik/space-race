import { Attribute, Tile } from 'level/level';
import * as React from 'react';
import styled, { css } from 'styled-components';

const MAX_LEVEL = 4;

const Row = styled.div`
    display: flex;
    flex-wrap: nowrap;
`;

const TileWrapper = styled.div`
    border: 1px solid rgba(255, 255, 255, 0.3);
    line-height: 0;
`;

const Tile = styled.button<{ attribute?: Attribute, opacity: number }>`
    width: 16px;
    height: 16px;
    border: none;
    background: #fff;
    border-radius: 0;

    ${({ opacity }) => css`
        opacity: ${opacity};
    `};

    ${({ attribute }) => attribute === Attribute.FinishLine && css`
        background: #c00;
        opacity: 1;
    `}
`;


interface Props {
    selectedTool: Attribute | undefined;
    tiles: Tile[];
    setTile: (x: number, z: number, l: number, a: Attribute) => void;
}

let mouseDown: number | undefined;

export const Grid = ((props: Props) => {
    const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!mouseDown) return;

        const tile = (e.target as HTMLButtonElement);

        const x = parseInt(tile.dataset.tileX!);
        const z = parseInt(tile.dataset.tileZ!);
        let l = parseInt(tile.dataset.tileL ?? '0');
        let a = tile.dataset.tileA ? parseInt(tile.dataset.tileA) as Attribute : Attribute.None;

        if (props.selectedTool === undefined) {
            l = l + (mouseDown === 1 ? 1 : -1);
            tile.dataset.tileL = l.toString();
        } else {
            a = props.selectedTool;
            tile.dataset.tileA = props.selectedTool.toString();
        }

        props.setTile(x, z, l, a);
        tile.blur();
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        handleMouse(e);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        mouseDown = e.buttons;
        handleMouse(e);
        e.preventDefault();
    };

    const handleMouseReset = () => {
        mouseDown = undefined;
    };

    const generateGrid = () => {
        const rows: React.ReactNode[] = [];

        for (let z = 150; z >= 0; z--) {
            const tileNodes: React.ReactNode[] = [];
            for (let x = 0; x < 7; x++) {
                const t = props.tiles.find(t => t && t.x === x && t.z === z);

                tileNodes.push(
                    <TileWrapper key={`${x}-${z}-${t?.l}-${t?.a}`}>
                        <Tile
                            onMouseEnter={handleMouseEnter}
                            onMouseDown={handleMouseDown}
                            attribute={t?.a}
                            opacity={(t?.l ?? 0) / MAX_LEVEL}
                            data-tile-z={z}
                            data-tile-x={x}
                            data-tile-l={t?.l ?? 0}
                            data-tile-a={t?.a}
                        />
                    </TileWrapper>
                );
            }

            rows.push(<Row key={z}>{tileNodes}</Row>);
        }

        return rows;
    };

    return (
        <div onMouseUp={handleMouseReset} onMouseLeave={handleMouseReset}>
            {generateGrid()}
        </div>
    );
});
