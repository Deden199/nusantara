require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes/lottery.routes');
const { run } = require('./cron/fetchResults');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: '*' });

app.use(cors());
app.use(express.json());
app.use('/api', routes);

run(); // initial run of cron to schedule

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend running on ${PORT}`));

module.exports = { app, server, io };
