import { Context } from 'context';
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
    const [tiles, setTiles] = React.useState(props.ctx.level?.tiles);

    React.useEffect(() => {
        const elem = (scrollRef.current as HTMLDivElement);
        if (elem && props.ctx.state.scrollMap.get()) {
            elem.scrollBy({ top: elem.scrollHeight });
            props.ctx.state.scrollMap.set(false);
        }
    });

    const handleClearMap = () => {
        props.ctx.level?.clear(props.ctx);
        props.ctx.level?.setTile(props.ctx, 3, 0, 1, Attribute.None);
        props.ctx.ship?.reset();
        setTiles([...props.ctx.level?.tiles ?? []]);
    };

    const handleSetTile = (x: number, z: number, l: number, a: Attribute) => {
        props.ctx.level!.setTile(props.ctx, x, z, l, a);
        setTiles([...props.ctx.level?.tiles ?? []]);
    };

    const handleSave = () => {
        const mapName = prompt('Name:');
        fetch(`/api/map?m=${mapName}`, {
            method: 'POST',
            body: JSON.stringify(props.ctx.level.tiles)
        }).then((response) => {
            response.text().then((text) => {
                alert(text);
            });
        });
    };

    return (
        <Container onContextMenu={(e) => { e.preventDefault(); }}>
            <Scroll ref={scrollRef as any}>
                <Grid tiles={tiles ?? []} setTile={handleSetTile} selectedTool={selectedTool} />
            </Scroll>
            <Toolbar
                selectedTool={selectedTool}
                onSelectTool={(t) => { setSelectedTool(t); }}
                onClose={() => { props.ctx.state.mapMaking.set(false); }}
                onClearMap={handleClearMap}
                onSave={handleSave}
            />
        </Container>
    );
});
