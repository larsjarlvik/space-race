import { Context } from 'context';
import * as React from 'react';
import styled from 'styled-components';
import { KeyButton } from './KeyButton';


const Nav = styled.nav`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
`;


export interface KeyButtonData {
    [key: string]: any;
}

interface Button {
    children: JSX.Element | string;
    onClick: (data?: KeyButtonData) => void;
    kbd?: string;
    data?: KeyButtonData,
}

interface Props {
    ctx: Context;
    buttons: Button[];
}

export const KeyButtonList = React.memo((props: Props) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleUserKeyPress = React.useCallback(event => {
        if (event.key === 'Enter') {
            props.buttons[selectedIndex].onClick(props.buttons[selectedIndex].data);
            return;
        }

        let index = selectedIndex;
        if (event.key === 'ArrowUp') index -= 1;
        if (event.key === 'ArrowDown') index += 1;

        if (index >= buttons.length) index = 0;
        if (index < 0) index = buttons.length - 1;
        setSelectedIndex(index);
    }, [selectedIndex]);

    React.useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress);
        return () => { window.removeEventListener('keydown', handleUserKeyPress); };
    }, [handleUserKeyPress]);

    const buttons = props.buttons.map((button, i) => {
        const kbd = button.kbd && <kbd>{button.kbd}</kbd>;

        const handleClick = React.useCallback(() => {
            button.onClick(button.data);
            setSelectedIndex(i);
        }, [i]);

        return (
            <KeyButton key={i} ctx={props.ctx} active={i === selectedIndex} onClick={handleClick} onMouseOver={() => { setSelectedIndex(i); }}>
                <><span>{button.children}</span> {kbd}</>
            </KeyButton>
        );
    });

    return (
        <Nav>
            {buttons}
        </Nav>
    );
});
