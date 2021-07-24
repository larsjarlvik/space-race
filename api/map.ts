import { VercelRequest, VercelResponse } from '@vercel/node';
import * as redis from 'redis';


export default (request: VercelRequest, response: VercelResponse) => {
    const mapName = request.query['m'] as string;
    if (!mapName) {
        response.status(400).send('Map name missing!');
    }

    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    if (request.body) {
        client.set(mapName, request.body, (err) => {
            if (err) {
                response.status(500).send('Failed to save map!');
            } else {
                response.status(200).send('Saved!');
            }
        });
    } else {
        client.get(mapName, (err, data) => {
            if (err) {
                response.status(500).send('Failed to get map!');
            }

            response.status(200).send(data);
        });
    }

    client.quit();
};
