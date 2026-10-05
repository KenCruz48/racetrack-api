const app = require('./app');
const mongoose = require('mongoose');
const connectDatabase = require('./config/database');
const dotenv = require('dotenv');

async function startServer() {
  dotenv.config({ quiet: true });
  const port = process.env.PORT ?? 3000;
  try {
    await connectDatabase();
    return await new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`RaceTrack API escuchando en el puerto ${server.address().port}`);
        resolve(server);
      });
      server.once('error', reject);
    });
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('No se pudo iniciar RaceTrack API:', error.message);
    process.exitCode = 1;
  });
}

module.exports = startServer;
