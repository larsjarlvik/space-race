import { Context } from 'context';
import { finish } from './finish';
import { jump } from './jump';

export interface BaseAttribute {
    interact: (ctx: Context, overlap: number) => void;
    editorColor: string;
}

export { finish };
export { jump };
