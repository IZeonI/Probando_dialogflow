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

    console.log("Respuesta de CarQuery:", data);

    const trims = data.Trims;
    if (!trims || trims.length === 0) {
      return res.json({
        fulfillmentText: `No encontré información del ${marca} ${modelo} ${year}.`
      });
    }

    console.log("Primer trim:", trims[0]);

    const auto = trims[0];

    const motor = `${auto.model_engine_cyl || '?'} cilindros ${auto.model_engine_type || ''} de ${auto.model_engine_cc || '?'} cc`;
    const combustible = (auto.model_engine_fuel || 'desconocido')
      .replace('Unleaded', 'sin plomo');
    const puertas = auto.model_doors || 'desconocido';
    const traccion = (auto.model_drive || 'desconocida')
      .replace('Front Wheel Driv', 'delantera')
      .replace('Rear Wheel Driv', 'trasera')
      .replace('All Wheel Drive', 'integral')
      .replace('Four Wheel Drive', '4x4');
    const transmision = (auto.model_transmission_type || 'desconocida')
      .replace('Automatic', 'automática')
      .replace('Manual', 'manual');



    const respuesta = `El ${marca} ${modelo} ${year} tiene un motor de ${motor}, usa combustible ${combustible}, tiene ${puertas} puertas, transmisión ${transmision} y tracción ${traccion}.`;


    return res.json({ fulfillmentText: respuesta });


  } catch (error) {
    console.error("Error al consultar CarQuery:", error.message);
    return res.json({
      fulfillmentText: 'Hubo un problema al consultar los datos del auto.'
    });
  }
};
