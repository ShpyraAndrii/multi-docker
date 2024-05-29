const keys = require('./keys');


// Express App setup

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Postgres Client set up
const { Pool } = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
    ssl:
      process.env.NODE_ENV !== 'production'
        ? false
        : { rejectUnauthorized: false },
  });

pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
  });


// Redis client Setup
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retryStrategy: () => 1000,
})

const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/',(req,res) => {
    res.send('Hi')
});

app.get('/values/all', async (req,res) => {
    const values = await pgClient.query('SELECT * FROM values');

    res.send(values.rows);
});

app.get('/values/current', async (req,res) => {
    redisClient.hgetall('values', (err,values) => {
        res.send(values);
    })
});

app.post('/values', async (req,res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);

    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
})

app.listen(PORT, err => {
    console.log(`Listening on port - ${PORT}`);
});