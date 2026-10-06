const express = require('express');
const eventRoutes = require('./routes/eventRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/events', eventRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;