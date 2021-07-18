import * as React from 'react';

interface Props {
    displayText: string;
}

export const Paused = React.memo((props: Props) => {
    return (
        <section>
            <div>{props.displayText}</div>
            <p>Press R to start!</p>
        </section>
    );
});
