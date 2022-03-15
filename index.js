const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.port || 3001;

app.use(cors());

const cache = new NodeCache({ stdTTL: 15 });

const SHEET_ID = process.env.SHEET_ID;
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
const API_KEY = process.env.API_KEY;

const verifyCache = (req, res, next) => {
  try {
    const { id } = req.params;
    if (cache.has(id)) {
      return res.status(200).json(cache.get(id));
    }
    return next();
  } catch (err) {
    throw new Error(err);
  }
};

app.get('/:id', verifyCache, async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(`${API_URL}/values/${id}?key=${API_KEY}`);
    cache.set(id, data);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Grand Cup API serving on port ${port}`);
});
