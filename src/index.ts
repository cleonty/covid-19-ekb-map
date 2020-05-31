import express from 'express';
import https from 'https';
import { IncomingMessage } from 'http';
const PORT = process.env.PORT || 5000;

express()
  .use('/', express.static('public'))
  .get('/data/COVID.json', (req: express.Request, res: express.Response) => {
    https.get('https://www.gorses.na4u.ru/data/COVID.json', { rejectUnauthorized: false }, (response: IncomingMessage) => {
      response.pipe(res, { end: true });
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));