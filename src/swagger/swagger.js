const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

const authSwagger = YAML.load(path.join(__dirname, './auth.swagger.yaml'));

const usersSwagger = YAML.load(path.join(__dirname, './users.swagger.yaml'));

const cartsSwagger = YAML.load(path.join(__dirname, './carts.swagger.yaml'));

const dishesSwagger = YAML.load(path.join(__dirname, './dishes.swagger.yaml'));

const restaurantsSwagger = YAML.load(path.join(__dirname, './restaurants.swagger.yaml'));

const paymentsSwagger = YAML.load(path.join(__dirname, './payments.swagger.yaml'));

const ordersSwagger = YAML.load(path.join(__dirname, './orders.swagger.yaml'));

const mergedSwagger = {
  ...swaggerDocument,
  paths: {
    ...swaggerDocument.paths,
    ...authSwagger.paths,
    ...usersSwagger.paths,
    ...cartsSwagger.paths,
    ...dishesSwagger.paths,
    ...restaurantsSwagger.paths,
    ...paymentsSwagger.paths,
    ...ordersSwagger.paths,
  },
  components: {
    ...swaggerDocument.components,
    ...authSwagger.components,
    ...usersSwagger.components,
    ...cartsSwagger.components,
    ...dishesSwagger.components,
    ...restaurantsSwagger.components,
    ...paymentsSwagger.components,
    ...ordersSwagger.components,
  },
};

module.exports = mergedSwagger;
