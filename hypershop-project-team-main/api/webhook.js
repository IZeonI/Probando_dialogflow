import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const parameters = req.body.queryResult.parameters;

  const marca = parameters['marca_auto'];
  const modelo = parameters['modelo_auto'];
  const year = parameters['number'] || new Date(parameters['date']).getFullYear();

  try {
    const url = `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${marca}&model=${modelo}&year=${year}`;
    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json' }
    });

    const trims = response.data.Trims;

    if (!trims || trims.length === 0) {
      return res.json({
        fulfillmentText: `No encontré información del ${marca} ${modelo} ${year}.`
      });
    }

    const auto = trims[0];
    const motor = auto.engine || 'desconocido';
    const combustible = auto.fuel_type || 'desconocido';
    const puertas = auto.doors || 'desconocido';

    const respuesta = `El ${marca} ${modelo} ${year} tiene un motor ${motor}, usa ${combustible} y tiene ${puertas} puertas.`;

    res.json({ fulfillmentText: respuesta });
  } catch (error) {
    console.error(error.message);
    res.json({ fulfillmentText: 'Hubo un problema al consultar los datos del auto.' });
  }
}
