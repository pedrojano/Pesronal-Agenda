const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.warn("Variável DATABASE_URL não encontrada!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Erro CRÍTICO ao conectar no Banco de Dados:", err.message);
    console.error(
      'Dica: Verifique se o banco "personal_agenda_db" foi criado e se a DATABASE_URL está correta.',
    );
  } else {
    console.log("Conexão com o Banco de Dados estabelecida com sucesso. 🚀");
    release();
  }
});

module.exports = pool;
