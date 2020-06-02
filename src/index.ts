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
      const file = fs.createWriteStream(`./data/COVID-${date}.json`);
      response.pipe(res, { end: true });
      response.pipe(file, { end: true });
    });
  })
  .get('/data/COVID-yesterday.json', (req: express.Request, res: express.Response) => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().substr(0, 10);
      const file = fs.createReadStream(`./data/COVID-${yesterday}.json`);
      file.on('error', (e) => res.status(404).json({error: e.message}));
      file.pipe(res, { end: true });
  })
  .get('/env', (req: express.Request, res: express.Response) => {
    const data = { env: process.env, cwd: process.cwd() };
    res.json(data);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));