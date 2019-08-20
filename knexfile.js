module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/kouleur_data',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    }
  },
  test: {
    client: 'pg',
    connection: 'postgres://localhost/kouleur_data_test',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/test'
    }
  }
};
