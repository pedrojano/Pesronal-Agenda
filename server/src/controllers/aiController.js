const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error("ERRO: GEMINI_API_KEY ausente no .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateSchedule = async (req, res) => {
  try {
    const { routineText } = req.body;

    if (!routineText) {
      return res.status(400).json({ error: "Texto obrigatório." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const today = new Date().toISOString().split("T")[0];

    console.log("--- PEDIDO IA ---");
    console.log("Input:", routineText);

    const prompt = `
      Atue como um Assistente de Produtividade.
      
      MISSÃO: Transforme o texto do usuário em um JSON de tarefas.
      Se o texto for vago (ex: "trabalho"), invente uma rotina padrão para aquele contexto.
      NUNCA devolva uma lista vazia. Se não houver nada claro, sugira "Organizar o dia" e "Planejar a semana".

      Input: "${routineText}"
      Data Base: ${today}

      REGRAS DE FORMATO:
      1. Retorne APENAS um JSON.
      2. O formato deve ser um ARRAY DE OBJETOS.
      3. Use chaves com underline: start_time, end_time.

      Esquema obrigatório:
      [
        {
          "title": "Título da tarefa",
          "description": "Descrição breve",
          "start_time": "YYYY-MM-DD HH:mm",
          "end_time": "YYYY-MM-DD HH:mm",
          "notify": true
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");

    let finalJson;

    if (firstBracket !== -1 && lastBracket !== -1) {
      const jsonString = text.substring(firstBracket, lastBracket + 1);
      try {
        finalJson = JSON.parse(jsonString);
      } catch (e) {
        console.error("Erro ao fazer parse do trecho extraído:", e);
      }
    }

    if (!finalJson) {
      try {
        finalJson = JSON.parse(text);
      } catch (e) {
        console.error("Falha total no parse JSON.");
        throw new Error("A IA não retornou um JSON válido.");
      }
    }

    if (!Array.isArray(finalJson)) {
      if (finalJson.schedule && Array.isArray(finalJson.schedule)) {
        finalJson = finalJson.schedule;
      } else if (finalJson.tasks && Array.isArray(finalJson.tasks)) {
        finalJson = finalJson.tasks;
      } else {
        finalJson = [finalJson];
      }
    }

    res.json({ schedule: finalJson });
  } catch (error) {
    console.error("ERRO CRÍTICO NO CONTROLLER:", error);
    res.status(500).json({
      error: "Erro ao gerar rotina.",
      details: error.message,
    });
  }
};
