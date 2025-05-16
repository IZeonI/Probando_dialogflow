const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const parameters = req.body.queryResult.parameters;

  const marca = parameters['marca_auto'];
  const modelo = parameters['modelo_auto'];
  const year = parameters['date'] || parameters['number']; // puede venir como fecha o número

  try {
    // Llamar a CarQuery API para obtener trims del auto
    const url = `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${marca}&model=${modelo}&year=${year}&callback=?`;

    // CarQuery usa JSONP, así que quitamos "?" final
    const response = await axios.get(url.replace('&callback=?', ''), {
      headers: { 'Accept': 'application/json' }
    });

    const trims = response.data.Trims;

    if (!trims || trims.length === 0) {
      return res.json({
        fulfillmentText: `No encontré información del ${marca} ${modelo} ${year}.`
      });
    }

    const auto = trims[0]; // tomamos el primer resultado
    const motor = auto.engine;
    const combustible = auto.fuel_type;
    const puertas = auto.doors;

    const respuesta = `El ${marca} ${modelo} ${year} tiene un motor ${motor}, usa ${combustible} y tiene ${puertas} puertas.`;

    res.json({ fulfillmentText: respuesta });
  } catch (error) {
    console.error(error.message);
    res.json({ fulfillmentText: 'Hubo un problema al consultar los datos del auto.' });
  }
});

app.listen(3000, () => console.log('Servidor webhook en http://localhost:3000/webhook'));
