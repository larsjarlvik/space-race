import { VercelRequest, VercelResponse } from '@vercel/node';
import * as redis from 'redis';


export default (request: VercelRequest, response: VercelResponse) => {
    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    const mapName = request.query['m'] as string;
    const deleteMap = request.query['d'] as string === 'delete';

    if (!mapName) {
        client.keys('*', (err, reply) => {
            if (err) {
                response.status(500).send('Failed list maps!');
            } else {
                response.status(200).send(reply);
            }
        });
    } else if (deleteMap) {
        client.del(mapName, (err) => {
            if (err) {
                response.status(500).send('Failed to delete map!');
            }
            response.status(200).send('Map deleted!');
        });
    } else if (request.body) {
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
