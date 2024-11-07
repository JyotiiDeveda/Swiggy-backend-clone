const express = require('express');
const app = express();
const { sequelize } = require('./models');

app.use(express.json());

const startServer = async () => {
	try {
		await sequelize.authenticate();
		console.log('Database connection successfull');

		const PORT = process.env.DB_PORT || 3000;
		app.listen(PORT);
		console.log(`Server running at port ${PORT}`);
	} catch (err) {
		console.log('Database connection failed', err);
	}
};

startServer();

app.get('/', (req, res) => {
	res.send('Swiggy-clone server');
});
