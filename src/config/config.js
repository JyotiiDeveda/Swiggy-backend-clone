require('dotenv').config({ path: __dirname + '/../../.env' });

const { DB_USERNAME, DB_PASSWORD, DB_NAME, TESTDB_NAME, DB_HOST, DB_DIALECT, DB_LOGGING } = process.env;
// console.log(DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, DB_DIALECT, DB_LOGGING);
module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: DB_DIALECT,
    logging: DB_LOGGING === 'true' ? console.log : false,
    define: {
      paranoid: true,
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: TESTDB_NAME,
    host: DB_HOST,
    dialect: DB_DIALECT,
    logging: DB_LOGGING === 'true' ? console.log : false,
    define: {
      paranoid: true,
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  },
};
