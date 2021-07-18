import { render } from 'react-dom';
import { Context } from 'context';
import { Main } from './Main';

export const init = (ctx: Context) => {
    const App = (
        <Main ctx={ctx} />
    );

    render(App, document.getElementById('ui'));
};
