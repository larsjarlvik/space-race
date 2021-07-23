import * as React from 'react';
import styled from 'styled-components';
import menu from 'icons/menu.svg';

const Button = styled.button`
    position: fixed;
    top: 12px;
    right: 12px;
    font-size: 16px;
    z-index: 10;
    padding: 6px;
    height: 32px;
    width: 32px;

    * {
        fill: #fff;
        stroke: #fff;
    }
`;

interface Props {
    onClick: () => void;
}

export const Menu = React.memo((props: Props) => {
    return (
        <Button onClick={props.onClick} className="btn" dangerouslySetInnerHTML={{ __html: menu }}></Button>
    );
});
