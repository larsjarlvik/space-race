import * as React from 'react';
import styled, { css } from 'styled-components';
import { Attribute } from 'level/level';

import upDown from 'icons/up-down.svg';
import noAttribute from 'icons/no-attribute.svg';
import jump from 'icons/jump.svg';
import finish from 'icons/finish.svg';
import clear from 'icons/clear.svg';
import arrowRight from 'icons/arrow-right.svg';
import speedup from 'icons/speedup.svg';
import slowdown from 'icons/slowdown.svg';
import save from 'icons/save.svg';
import open from 'icons/open.svg';

const Container = styled.aside`
    display: flex;
    flex-direction: column;
    background: #222;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
    padding: 10px;
    z-index: 100;
`;

const Button = styled.button<{ isSelected?: boolean, bottom?: boolean }>`
    width: 28px;
    height: 28px;
    margin-bottom: 6px;

    * {
        fill: #ddd !important;
    }

    &:hover {
        border-color: #fff;
        * {
            fill: #fff !important;
        }
    }

    ${({ isSelected }) => isSelected && css`
        background: rgba(255, 0, 0, 0.7);
    `}
`;

const Bottom = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: auto;
`;

const Separator = styled.div`
    margin: 6px 0 12px;
    height: 1px;
    background-color: #ddd;
`;

interface ToolbarItem {
    icon: any,
    attribute?: Attribute,
}

const toolbarItems = [
    { icon: upDown },
    { icon: noAttribute, attribute: Attribute.Default },
    { icon: jump, attribute: Attribute.Jump },
    { icon: speedup, attribute: Attribute.Speedup },
    { icon: slowdown, attribute: Attribute.Slowdown },
    { icon: finish, attribute: Attribute.FinishLine },
] as ToolbarItem[];

interface Props {
    selectedTool: Attribute | undefined;
    onSelectTool: (tool?: Attribute) => void;
    onClearMap: () => void;
    onClose: () => void;
    onSave: () => void;
    onOpen: () => void;
}

export const Toolbar = React.memo((props: Props) => {
    const items = toolbarItems.map((t, i) =>
        <Button key={i} className="btn" isSelected={t.attribute === props.selectedTool} onClick={() => props.onSelectTool(t.attribute)} dangerouslySetInnerHTML={{ __html: t.icon }}></Button>
    );

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onClearMap();
        (e.target as any).blur();
    };

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onClose();
        (e.target as any).blur();
    };

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onOpen();
        (e.target as any).blur();
    };

    const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onSave();
        (e.target as any).blur();
    };

    return (
        <Container>
            {items}
            <Separator />
            <Button onClick={handleClear} className="btn" dangerouslySetInnerHTML={{ __html: clear }}></Button>
            <Bottom>
                <Button onClick={handleOpen} bottom={true} className="btn" dangerouslySetInnerHTML={{ __html: open }}></Button>
                <Button onClick={handleSave} bottom={true} className="btn" dangerouslySetInnerHTML={{ __html: save }}></Button>
                <Button onClick={handleClose} bottom={true} className="btn" dangerouslySetInnerHTML={{ __html: arrowRight }}></Button>
            </Bottom>
        </Container>
    );
});
