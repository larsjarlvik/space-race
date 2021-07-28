import { Context, GameState, UiState } from 'context';
import { Attribute } from 'level/level';
import * as React from 'react';
import styled from 'styled-components';
import { Grid } from './Grid';
import { Toolbar } from './Toolbar';

const Container = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    background: #eee;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    z-index: 1000;
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

interface Props {
    ctx: Context;
}

export const Overview = React.memo((props: Props) => {
    const scrollRef = React.createRef();
    const [selectedTool, setSelectedTool] = React.useState<Attribute>();
    const [tiles, setTiles] = React.useState(props.ctx.level.getTileData());

    React.useEffect(() => {
        const elem = (scrollRef.current as HTMLDivElement);
        if (elem && props.ctx.state.scrollMap.get()) {
            elem.scrollBy({ top: elem.scrollHeight });
            props.ctx.state.scrollMap.set(false);
        }
    });

    const handleClearMap = () => {
        props.ctx.level.clear(props.ctx);
        props.ctx.level.setTile(props.ctx, 3, 0, 1, Attribute.None);
        props.ctx.ship.reset();
        setTiles([...props.ctx.level.getTileData() ?? []]);
    };

    const handleSetTile = (x: number, z: number, l: number, a: Attribute) => {
        props.ctx.level!.setTile(props.ctx, x, z, l, a);
        setTiles([...props.ctx.level.getTileData() ?? []]);
    };

    const handleSave = () => {
        const mapName = prompt('Save as:');
        if (!mapName || mapName.length < 3) {
            return;
        }

        if (props.ctx.level.getTileData().length === 0) {
            fetch(`/api/map?m=${mapName}&d=delete`, {
                method: 'GET',
            }).then((response) => {
                response.text().then(() => {
                    alert('Map deleted!');
                });
            });
            return;
        }

        fetch(`/api/map?m=${mapName}`, {
            method: 'POST',
            body: JSON.stringify(props.ctx.level.getTileData())
        }).then((response) => {
            response.text().then((text) => {
                alert(text);
            });
        });
    };

    const handleOpen = () => {
        const mapName = prompt('Load map:');
        if (!mapName || mapName.length < 3) {
            return;
        }

        props.ctx.setGameState(GameState.Paused, true);
        props.ctx.state.uiState.set(UiState.Loading);
        props.ctx.state.scrollMap.set(true);

        props.ctx.level.load(props.ctx, mapName).then(() => {
            props.ctx.setGameState(GameState.MapMaking, true);
            props.ctx.state.uiState.set(UiState.MapBuilder);
        });
    };

    const handleClose = () => {
        props.ctx.state.uiState.set(props.ctx.state.gameState.get() === GameState.Running ? UiState.None : UiState.MainMenu);
    };

    return (
        <Container onContextMenu={(e) => { e.preventDefault(); }}>
            <Scroll ref={scrollRef as any}>
                <Grid tiles={tiles ?? []} setTile={handleSetTile} selectedTool={selectedTool} />
            </Scroll>
            <Toolbar
                selectedTool={selectedTool}
                onSelectTool={(t) => { setSelectedTool(t); }}
                onClose={handleClose}
                onClearMap={handleClearMap}
                onSave={handleSave}
                onOpen={handleOpen}
            />
        </Container>
    );
});
