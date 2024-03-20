const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

const finnhub_url = "https://finnhub.io/api/v1";
const finnhub_key = "cn5e1r1r01qocjm1mnt0cn5e1r1r01qocjm1mntg";
const polygon_url = "https://api.polygon.io/v2";
const polygon_key = "KsY8TN9bNE9j8TKwpWMIGGumRy6ZyQRe";

app.use(cors({
  origin: '*'
}));

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});


app.get('/company-description', async (req, res) => {
  const finnhub_company_profile2 = "/stock/profile2";
  const url = finnhub_url + finnhub_company_profile2;

  const ticker = req.query;
  const urlWithParams = `${url}?symbol=${ticker.symbol}&token=${finnhub_key}`;

  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-historical-data', async (req, res) => {
  const polygon_aggregate_bars = "/aggs/ticker";
  const url = polygon_url + polygon_aggregate_bars;

  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  sixMonthsAgo.setDate(today.getDate() - 1);

  const todayStr = today.toISOString().slice(0, 10);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

  const ticker = req.query;
  const urlWithParams = `${url}/${ticker.symbol}/range/1/day/${sixMonthsAgoStr}/${todayStr}?adjusted=true&sort=asc&apiKey=${polygon_key}`;
  console.log(urlWithParams);

  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-stock-quote', async (req, res) => {
  const finnhub_quote = "/quote";
  const url = finnhub_url + finnhub_quote;

  const ticker = req.query;
  const urlWithParams = `${url}?symbol=${ticker.symbol}&token=${finnhub_key}`;
  console.log(urlWithParams);
  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-autocomplete', async (req, res) => {
  const finnhub_search = "/search";
  const url = finnhub_url + finnhub_search;

  const ticker = req.query;
  const urlWithParams = `${url}?q=${ticker.symbol}&token=${finnhub_key}`;
  console.log(urlWithParams);

  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-news', async (req, res) => {
  const finnhub_company_news = "/company-news";
  const url = finnhub_url + finnhub_company_news;

  const ticker = req.query;

  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const todayStr = today.toISOString().slice(0, 10);
  const oneWeekAgoStr = oneWeekAgo.toISOString().slice(0, 10);
  
  const urlWithParams = `${url}?symbol=${ticker.symbol}&from=${oneWeekAgoStr}&to=${todayStr}&token=${finnhub_key}`;
  console.log(urlWithParams);

  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-recommendation-trends', async (req, res) => {
  const finnhub_recommendation = "/stock/recommendation";
  const url = finnhub_url + finnhub_recommendation;

  const ticker = req.query;
  const urlWithParams = `${url}?symbol=${ticker.symbol}&token=${finnhub_key}`;
  console.log(urlWithParams);
  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-insider-sentiment', async (req, res) => {
  const finnhub_insider_sentiment = "/stock/insider-sentiment";
  const url = finnhub_url + finnhub_insider_sentiment;

  const ticker = req.query;
  const urlWithParams = `${url}?symbol=${ticker.symbol}&token=${finnhub_key}`;
  console.log(urlWithParams);
  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-peers', async (req, res) => {
  const finnhub_peers = "/stock/peers";
  const url = finnhub_url + finnhub_peers;

  const ticker = req.query;
  const urlWithParams = `${url}?symbol=${ticker.symbol}&token=${finnhub_key}`;
  console.log(urlWithParams);
  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-earnings', async (req, res) => {
  const finnhub_earnings = "/stock/earnings";
  const url = finnhub_url + finnhub_earnings;

  const ticker = req.query;
  const urlWithParams = `${url}?symbol=${ticker.symbol}&token=${finnhub_key}`;
  console.log(urlWithParams);
  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      const newData = response.data.map(obj => {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = obj[key] === null ? 0 : obj[key];
        }
        return newObj;
    });
      res.json(newData);
    } else {
      res.status(response.status).send('Error fetching data from Finnhub API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});