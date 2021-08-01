import { Context } from 'context';
import { TileMesh } from 'level/tile';
import { finish } from './finish';
import { jump } from './jump';

export interface BaseAttribute {
    interact: (ctx: Context, overlap: number) => void;
    update?: (tile: TileMesh) => void;
    editorColor: string;
}

export { finish };
export { jump };
