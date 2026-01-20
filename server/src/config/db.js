const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Erro CRÍTICO ao conectar no Banco de Dados:", err.message);
    console.error(
      'Dica: Verifique se o banco "personal_agenda_db" foi criado.'
    );
  } else {
    console.log("Conexão com o Banco de Dados estabelecida com sucesso.");
    release();
  }
});

module.exports = pool;
