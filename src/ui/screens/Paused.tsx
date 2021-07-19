import * as React from 'react';

interface Props {
    displayText: string;
}

export const Paused = React.memo((props: Props) => {
    return (
        <section>
            <h2>{props.displayText}</h2>
            <p>Start Game <span className="key">[R]</span></p>
            <p>Create Map <span className="key">[M]</span></p>
        </section>
    );
});
