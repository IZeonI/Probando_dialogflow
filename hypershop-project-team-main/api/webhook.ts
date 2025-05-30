require('dotenv').config();
const { OpenAI } = require("openai");
const axios = require('axios');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
const supabase: SupabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const queryText = req.body.queryResult.queryText as string;
  const intentName = req.body.queryResult.intent.displayName as string;
  const parameters = req.body.queryResult.parameters || {};

  try {
    if (intentName === 'recomendar_producto') {
      const categoriaNombre = parameters['categoria_producto']?.[0] as string | undefined;

      if (!categoriaNombre) {
        return res.json({ fulfillmentText: 'Por favor, dime qué categoría de producto te interesa.' });
      }

      const { data: categoriaPadre, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoriaNombre)
        .maybeSingle();

      if (catError || !categoriaPadre) {
        return res.json({ fulfillmentText: `No encontré la categoría "${categoriaNombre}".` });
      }

      const { data: categoriasHijas, error: errHijas } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoriaPadre.id);

      if (errHijas) {
        return res.json({ fulfillmentText: 'Error buscando categorías hijas.' });
      }

      const idsHijas = categoriasHijas?.map(cat => cat.id) || [];

      if (idsHijas.length === 0) {
        return res.json({ fulfillmentText: `No hay categorías hijas para "${categoriaNombre}".` });
      }

      const { data: productos, error } = await supabase
        .from('products')
        .select('name, description')
        .in('category_id', idsHijas)
        .limit(5);

      if (error) {
        console.error('Error al buscar productos:', error);
        return res.json({ fulfillmentText: 'Ocurrió un error al obtener productos.' });
      }

      if (!productos || productos.length === 0) {
        return res.json({ fulfillmentText: `No encontré productos en la categoría "${categoriaNombre}".` });
      }

      if (!productos || productos.length === 0) {
        return res.json({ fulfillmentText: `No encontré productos en la categoría "${categoriaNombre}".` });
      }

      let respuesta = `Aquí tienes algunos productos para la categoría "${categoriaNombre}":\n`;
      productos.forEach(p => {
        const nombre = p.name || 'Producto sin nombre';
        const descripcion = p.description || 'Sin descripción';
        const link = `https://hypershop-astro-app-ly73.vercel.app/product/${encodeURIComponent(nombre)}`;
        respuesta += `- ${nombre}: ${descripcion} [Ver producto](${link})\n`;
      });

      return res.json({ fulfillmentText: respuesta });
    }

    else if (intentName === 'duda_general_auto' || intentName === 'Default Fallback Intent') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un experto en autos que responde de forma clara, breve y fácil de entender.' },
          { role: 'user', content: queryText }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const gptResponse = completion.choices[0].message.content.trim();
      return res.json({ fulfillmentText: gptResponse });
    }

    else {
      return res.json({ fulfillmentText: 'No entendí tu solicitud. ¿Podrías reformularla?' });
    }
  } catch (error: any) {
    console.error("Error general:", error.message || error);
    return res.json({
      fulfillmentText: 'Hubo un problema al procesar tu solicitud. Inténtalo más tarde.'
    });
  }
}


