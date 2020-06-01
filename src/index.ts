import express from 'express';
import https from 'https';
import { IncomingMessage } from 'http';
import * as fs from 'fs';
const PORT = process.env.PORT || 5000;

express()
  .use('/', express.static('public'))
  .get('/data/COVID.json', (req: express.Request, res: express.Response) => {
    https.get('https://www.gorses.na4u.ru/data/COVID.json', { rejectUnauthorized: false }, (response: IncomingMessage) => {
      const date = (new Date()).toISOString().substr(0, 10);
      const file = fs.createWriteStream(`./data/COVID-${date}.txt`);  
      response.pipe(res, { end: true });
      response.pipe(file, { end: true });
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));