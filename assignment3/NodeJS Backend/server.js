const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(express.json());

const finnhub_url = "https://finnhub.io/api/v1";
const finnhub_key = "cn5e1r1r01qocjm1mnt0cn5e1r1r01qocjm1mntg";
const polygon_url = "https://api.polygon.io/v2";
const polygon_key = "KsY8TN9bNE9j8TKwpWMIGGumRy6ZyQRe";


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://saunaksa:assignment3@assignment3.sn67kko.mongodb.net/?retryWrites=true&w=majority&appName=Assignment3";
const mongoose = require('mongoose');
mongoose.connect(uri)
  .then((result) => console.log('connected to db using mongoose'))
  .catch((err) => console.log(err));
const Schema = mongoose.Schema;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


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
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(today.getFullYear() - 2);

  const todayStr = today.toISOString().slice(0, 10);
  const twoYearsAgoStr = twoYearsAgo.toISOString().slice(0, 10);

  const ticker = req.query;
  const urlWithParams = `${url}/${ticker.symbol}/range/1/day/${twoYearsAgoStr}/${todayStr}?adjusted=true&sort=asc&apiKey=${polygon_key}`;
  console.log(urlWithParams);

  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Polygon API');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/company-historical-data-hourly', async (req, res) => {
  const polygon_aggregate_bars = "/aggs/ticker";
  const url = polygon_url + polygon_aggregate_bars;

  const today = new Date();

  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  const todayStr = today.toISOString().slice(0, 10);
  const fiveDaysAgoStr = fiveDaysAgo.toISOString().slice(0, 10);

  const ticker = req.query;
  const urlWithParams = `${url}/${ticker.symbol}/range/1/hour/${fiveDaysAgoStr}/${todayStr}?adjusted=true&sort=asc&apiKey=${polygon_key}`;
  console.log(urlWithParams);

  try {
    const response = await axios.get(urlWithParams);
    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).send('Error fetching data from Polygon API');
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

const wishlistSchema = new Schema({
  ticker: String,
  stockName: String
});

const portfolioSchema = new Schema({
  ticker: String,
  quantity: Number,
  cost: Number
});

const moneySchema = new Schema({
  money: Number
});


const WishlistModel = mongoose.model('wishlist', wishlistSchema);
const PortfolioModel = mongoose.model('portfolio', portfolioSchema);
const MoneyModel = mongoose.model('money', moneySchema);

app.get('/wishlist', (req, res) => {
  WishlistModel.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
});

app.post('/add-wishlist', (req, res) => {
  const wishlist = new WishlistModel(req.body);

  wishlist.save()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

app.post('/delete-wishlist', (req, res) => {
  WishlistModel.findOne(req.body).deleteOne()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

app.get('/portfolio', (req, res) => {
  PortfolioModel.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
});

app.post('/update-portfolio', (req, res) => {
  PortfolioModel.findOne({ticker: req.body.ticker})
    .then((stock) => {
      if (stock) {
        let newQuantity = stock.quantity + req.body.quantity;

        if (newQuantity === 0) {
          stock.deleteOne()
            .then((result) => {
              res.status(200).json(result);
              return;
            });
        }

        let newCost = stock.cost + req.body.cost;
        stock.quantity = newQuantity;
        stock.cost = newCost;
        stock.save()
          .then((result) => {
            res.status(200).json(result);
          });
      }
      else {
        const portfolio = new PortfolioModel(req.body);

        portfolio.save()
          .then((result) => {
            res.status(200).json(result)
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json(err);
          });
      }
    });
});

app.get('/money', (req, res) => {
  MoneyModel.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
});

app.post('/update-money', (req, res) => {
  MoneyModel.deleteOne({})
    .then(() => {
      const money = new MoneyModel(req.body);

      money.save()
        .then((result) => {
          console.log(result);
          res.status(200).json(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json(err);
        });
    })

});