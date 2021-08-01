import { BaseAttribute } from '.';
import { Context } from 'context';

export const jump = {
    interact: (ctx: Context, overlap: number) => {
        if (overlap > 1.5) ctx.ship.speed.y = 0.13;
    },
    editorColor: '#0f0',
} as BaseAttribute;