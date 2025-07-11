require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes/lottery.routes');
const { run } = require('./cron/fetchResults');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with permissive CORS
const io = new Server(server, {
  cors: {
    origin: '*',              // allow all origins
    methods: ['GET', 'POST'], // allowed HTTP methods
    allowedHeaders: ['*'],    // allow all headers
    credentials: true         // allow credentials if needed
  }
});

// Global CORS settings for Express
app.use(cors({
  origin: '*',                        // allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,                 // allow cookies and credentials
  preflightContinue: false           // let cors() handle OPTIONS
}));

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api', routes);

// Schedule initial fetch and recurring jobs
run();

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`⚡️ Backend running on port ${PORT}`));

module.exports = { app, server, io };
