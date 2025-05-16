const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parameters = req.body.queryResult?.parameters || {};
  const marca = parameters['marca_auto'];
  const modelo = parameters['modelo_auto'];
  const year = parameters['year'];

  try {
    const url = `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${marca}&model=${modelo}&year=${year}&callback=?`;
    const rawResponse = await axios.get(url);
    
    // CarQuery responde con JSONP, así que hay que limpiarlo
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
    const motor = auto.engine || "desconocido";
    const combustible = auto.fuel_type || "desconocido";
    const puertas = auto.doors || "desconocido";

    const respuesta = `El ${marca} ${modelo} ${year} tiene un motor ${motor}, usa ${combustible} y tiene ${puertas} puertas.`;
    return res.json({ fulfillmentText: respuesta });

  } catch (error) {
    console.error("Error al consultar CarQuery:", error.message);
    return res.json({
      fulfillmentText: 'Hubo un problema al consultar los datos del auto.'
    });
  }
};
