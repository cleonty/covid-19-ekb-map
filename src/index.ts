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
  .get('/data/COVID-previous.json', (req: express.Request, res: express.Response) => {
    const date = new Date();
    let fileFound = false;
    for (let i = 1; i < 1000; i++) {
      date.setDate(date.getDate() - 1);
      const previous = date.toISOString().substr(0, 10);
      const filename = `./data/COVID-${previous}.json`;
      if (fs.existsSync(filename)) {
        fileFound = true;
        const file = fs.createReadStream(filename);
        file.on('error', (e) => res.status(404).json({ error: e.message }));
        file.pipe(res, { end: true });
        break;
      }
    }
    if (!fileFound) {
      res.status(404).json({ error: 'previous data not found' });
    }
  })
  .get('/env', (req: express.Request, res: express.Response) => {
    const data = { env: process.env, cwd: process.cwd() };
    res.json(data);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));