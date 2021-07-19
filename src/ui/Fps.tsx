import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    position: fixed;
    top: 12px;
    left: 12px;
    font-size: 16px;
`;

interface Props {
    fps: number;
}

export const Fps = React.memo((props: Props) => {
    return (
        <Container>
            FPS: {props.fps}
        </Container>
    );
});
