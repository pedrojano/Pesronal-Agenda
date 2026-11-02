const { Pool } = require("pg");
require("dotenv").config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("Variável DATABASE_URL não encontrada!");
}

const isLocal = dbUrl && (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1"));

const pool = new Pool({

  connectionString: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },

});

pool.connect((err, client, release) => {
  if (err) {

    console.error("Erro ao conectar no Banco de Dados:", err.message);
    console.error('Verifique se o banco "personal_agenda_db" foi criado localmente e se o Postgres está rodando.');

  } else {

    console.log(`Conexão com o Banco de Dados estabelecida com sucesso! (${isLocal ? 'Local sem SSL' : 'Nuvem com SSL'})`);

    release();

  }

});

module.exports = pool;