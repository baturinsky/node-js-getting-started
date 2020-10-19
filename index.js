//@ts-check

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Server } = require('ws');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/ws', (req, res) => res.render('pages/ws'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const wsServer = new Server({ server });

let dots = [];
let sockets = [];

wsServer.on('connection', (ws) => {
  sockets.push(ws);
  console.log('Client connected');
  ws.send(JSON.stringify({dots}));
  ws.on('close', () => console.log('Client disconnected'));
  ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    console.log(data);
    if(data.dots){
      dots = dots.concat(data.dots)
    }
    for(let socket of sockets){
      socket.send(event.data);
    }
  }

});

setInterval(() => {
  wsServer.clients.forEach((client) => {
    client.send(JSON.stringify({time:new Date().toISOString()}));
  });
}, 1000);
