require('dotenv').config();
const { OpenAI } = require("openai");
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const queryText = req.body.queryResult.queryText;
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult?.parameters || {};
  const marca = parameters['marca_auto'];
  const modelo = parameters['modelo_auto'];
  const year = parameters['year'];

  try {
    // Maneja cualquier pregunta general con GPT
    if (intentName === 'duda_general_auto' || intentName === 'Default Fallback Intent') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en autos que responde de forma clara, breve y fácil de entender. Evita usar lenguaje técnico complicado y sé directo al explicar conceptos.'
          },
          { role: 'user', content: queryText }
        ],
        temperature: 0.7,
        max_tokens: 500 // Ajuste para limitar la longitud de la respuesta
      });

      const gptResponse = completion.choices[0].message.content.trim();

      return res.json({ fulfillmentText: gptResponse });
    }


    // Si no es pregunta general, consulta CarQuery
    const url = `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${marca}&model=${modelo}&year=${year}&callback=?`;
    const rawResponse = await axios.get(url);

    const jsonStart = rawResponse.data.indexOf('{');
    const jsonEnd = rawResponse.data.lastIndexOf('}');
    const jsonString = rawResponse.data.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);

    const trims = data.Trims;
    if (!trims || trims.length === 0) {
      return res.json({
        fulfillmentText: `No encontré información del ${marca} ${modelo} ${year}.`
      });
    }

    const auto = trims[0];
    const motor = `${auto.model_engine_cyl || '?'} cilindros ${auto.model_engine_type || ''} de ${auto.model_engine_cc || '?'} cc`;
    const combustible = (auto.model_engine_fuel || 'desconocido').replace('Unleaded', 'sin plomo');
    const puertas = auto.model_doors || 'desconocido';
    const traccion = (auto.model_drive || 'desconocida')
      .replace('Front Wheel Driv', 'delantera')
      .replace('Front', 'delantera')
      .replace('Rear Wheel Driv', 'trasera')
      .replace('All Wheel Drive', 'integral')
      .replace('Four Wheel Drive', '4x4');
    const transmision = (auto.model_transmission_type || 'desconocida')
      .replace('Automatic', 'automática')
      .replace('Manual', 'manual');

    const respuesta = `El ${marca} ${modelo} ${year} tiene un motor de ${motor}, usa combustible ${combustible}, tiene ${puertas} puertas, transmisión ${transmision} y tracción ${traccion}.`;

    return res.json({ fulfillmentText: respuesta });

  } catch (error) {
    console.error("Error al consultar CarQuery o GPT:", error.message);
    return res.json({
      fulfillmentText: 'Hubo un problema al procesar tu solicitud. Inténtalo más tarde.'
    });
  }
};
