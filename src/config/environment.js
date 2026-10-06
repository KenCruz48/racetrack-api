const path = require('node:path');
const dotenv = require('dotenv');

const VALID_ENVIRONMENTS = new Set([
  'development',
  'test',
  'production',
]);

function loadEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!VALID_ENVIRONMENTS.has(nodeEnv)) {
    throw new Error(
      `NODE_ENV invalido: ${nodeEnv}. Usa development, test o production.`
    );
  }

  const environmentFile = path.resolve(
    process.cwd(),
    `.env.${nodeEnv}`
  );

  dotenv.config({
    path: environmentFile,
    quiet: true,
    override: false,
  });

  // Compatibilidad temporal con el archivo .env original.
  // Solo se usa en development.
  if (nodeEnv === 'development') {
    dotenv.config({
      path: path.resolve(process.cwd(), '.env'),
      quiet: true,
      override: false,
    });
  }

  process.env.NODE_ENV = nodeEnv;

  return nodeEnv;
}

module.exports = loadEnvironment;