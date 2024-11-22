const express = require('express');
const app = express();
const { sequelize } = require('./models');
const { registerRoutes } = require('./routes');
const swaggerDocument = require('./swagger/swagger.js');
const swaggerUi = require('swagger-ui-express');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
registerRoutes(app);
const PORT = process.env.DB_PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successfull');

    app.listen(PORT);
    console.log(`Server running at port ${PORT}`);
  } catch (err) {
    console.log('Database connection failed', err);
  }
};

startServer();
