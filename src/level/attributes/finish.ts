import { BaseAttribute } from '.';
import { Context } from 'context';

export const finish = {
    interact: (ctx: Context, overlap: number) => {
        if (overlap > 1.2) ctx.endLevel(ctx, 'Mission Completed!');
    },
    editorColor: '#f00',
} as BaseAttribute;