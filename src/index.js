const express = require('express');
const app = express();
const { sequelize } = require('./models');

app.use(express.json());
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
