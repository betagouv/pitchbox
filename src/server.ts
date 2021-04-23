import path from 'path';
import express from 'express';
import axios from 'axios';
import { Request, Response } from "express";
const seedrandom = require('seedrandom');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); 

app.use('/static', express.static(path.join(__dirname, '../static')));
app.use('/node_modules/reveal.js', express.static(path.join(__dirname, '../node_modules/reveal.js'))); 
app.use('/node_modules/@pqina/flip/dist', express.static(path.join(__dirname, '../node_modules/@pqina/flip/dist'))); 


const config = {
  port: process.env.PORT || 8100,
  startupsAPI: process.env.STARTUPS_API || 'https://beta.gouv.fr/api/v2.1/startups.json'
}

interface APIAttributes {
  name: string;
  pitch: string;
}

interface APIResult {
  type: string;
  attributes: APIAttributes;
}

interface StartupAPIResult {
   data: Array<APIResult>;
}

const getStartupsFromAPI = async () => axios.get<StartupAPIResult>(config.startupsAPI)
    .then((result) => result.data.data.filter(x => x.type == "startup"))
    .catch((err) => {
      throw new Error(`Error to get startups infos ${err}`);
    })


app.get('/', (_: Request, res: Response) => {
  const seed = Date.now();
  return res.redirect(`/slide/${seed}`);
});

function shuffleArray<Type>(array: Array<Type>, randomFunction: () => number): Array<Type> {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(randomFunction() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get('/slide/:seed', async (req: Request, res: Response) => {
  const { seed } = req.params;
  const startups = await getStartupsFromAPI();
  const randomFunction = seedrandom(seed);
  const startupShuffled = shuffleArray(startups, randomFunction);
  res.render("slide", {
      startups: startupShuffled
  });
});


module.exports = app.listen(config.port, () => console.log(`Running on port: ${config.port}`));
