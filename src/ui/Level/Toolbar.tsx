import * as React from 'react';
import styled, { css } from 'styled-components';

import upDown from 'icons/up-down.svg';
import noAttribute from 'icons/no-attribute.svg';
import finish from 'icons/finish.svg';
import clear from 'icons/clear.svg';
import { Attribute } from 'level/level';

const Container = styled.aside`
    display: flex;
    flex-direction: column;
    background: #222;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
    padding: 10px;
    z-index: 100;
`;

const Button = styled.button<{ isSelected: boolean }>`
    width: 28px;
    height: 28px;
    margin-bottom: 6px;

    * {
        fill: #ddd !important;
        stroke: #ddd !important;
    }

    &:hover {
        border-color: #fff;
        * {
            fill: #fff !important;
            stroke: #fff !important;
        }
    }

    ${({ isSelected }) => isSelected && css`
        background: rgba(255, 0, 0, 0.7);
    `}
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
    { icon: noAttribute, attribute: Attribute.None },
    { icon: finish, attribute: Attribute.FinishLine },
] as ToolbarItem[];

interface Props {
    selectedTool: Attribute | undefined;
    onSelectTool: (tool?: Attribute) => void;
    onClearMap: () => void;
}

export const Toolbar = React.memo((props: Props) => {
    const items = toolbarItems.map((t) =>
        <Button key={t.icon} className="btn" isSelected={t.attribute === props.selectedTool} onClick={() => props.onSelectTool(t.attribute)} dangerouslySetInnerHTML={{ __html: t.icon }}></Button>
    );

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onClearMap();
        (e.target as any).blur();
    };

    return (
        <Container>
            {items}
            <Separator />
            <Button onClick={handleClear} className="btn" dangerouslySetInnerHTML={{ __html: clear }} isSelected={false}></Button>
        </Container>
    );
});
