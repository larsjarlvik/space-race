import { Context } from 'context';
import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';
import arrowRight from 'icons/arrow-right.svg';

const Button = styled.button`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    text-align: left;

    &:hover {
        span {
            color: #d00;
        }
    }
`;

const blink = keyframes`
    0% { transform: translateX(3px); }
    50% { transform: translateX(-3px); }
    100% { transform: translateX(3px); }
`;

const Arrow = styled.span<{ visible: boolean }>`
    width: 24px;
    height: 24px;
    margin-right: 8px;
    visibility: hidden;
    animation: ${blink} 1s ease-in-out infinite;

    * {
        fill: #c00;
        stroke: #c00;
    }

    ${({ visible }) => visible && css`
        visibility: visible;
    `}
`;


interface Props {
    ctx: Context;
    active: boolean;
    children: JSX.Element;
    kbd?: string;
    onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseOver: () => void;
}

export const KeyButton = React.memo((props: Props) => {
    const kbd = props.kbd ? <kbd>R</kbd> : null;

    return (
        <Button onClick={props.onClick} onMouseOver={props.onMouseOver}><Arrow visible={props.active} dangerouslySetInnerHTML={{ __html: arrowRight }} /> {props.children} {kbd}</Button>
    );
});
