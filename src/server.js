const app = require('./app');

const port = process.env.PORT ?? 3000;

const server = app.listen(port, () => {
  console.log(`RaceTrack API escuchando en el puerto ${server.address().port}`);
});

server.on('error', (error) => {
  console.error('No se pudo iniciar RaceTrack API:', error.message);
  process.exitCode = 1;
});
