import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { db, unifiedPersons, collectionCenters, eq, desc, ilike, or } from '@todosunidos/db';

const app = express();
app.use(cors());
// No usamos express.json() globalmente porque el transport lo maneja internamente en /messages

const server = new Server(
  {
    name: 'todos-unidos-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definir las herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'buscar_personas',
        description: 'Busca personas reportadas como desaparecidas, localizadas o fallecidas en la plataforma Todos Unidos.',
        inputSchema: {
          type: 'object',
          properties: {
            termino: {
              type: 'string',
              description: 'Nombre, apellido o cédula de la persona a buscar.',
            },
          },
          required: ['termino'],
        },
      },
      {
        name: 'consultar_acopios',
        description: 'Obtiene la lista de centros de acopio aprobados y activos en Venezuela.',
        inputSchema: {
          type: 'object',
          properties: {
            estado: {
              type: 'string',
              description: 'Opcional. Filtrar por estado (ej. Miranda, Distrito Capital).',
            },
          },
        },
      },
      {
        name: 'obtener_estadisticas',
        description: 'Obtiene estadísticas generales de la contingencia en Todos Unidos.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Implementar la lógica de las herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'buscar_personas': {
      const { termino } = request.params.arguments as any;
      
      const results = await db.query.unifiedPersons.findMany({
        where: or(
          ilike(unifiedPersons.firstName, `%${termino}%`),
          ilike(unifiedPersons.lastName, `%${termino}%`),
          ilike(unifiedPersons.documentId, `%${termino}%`)
        ),
        limit: 10,
        orderBy: [desc(unifiedPersons.createdAt)]
      });

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No se encontraron personas con el término: ${termino}` }],
        };
      }

      const formatted = results.map(p => 
        `- Nombre: ${p.firstName} ${p.lastName}
  Estado: ${p.status}
  Última vez vista: ${p.lastSeenLocation || 'Desconocido'} (${p.lastSeenDate ? p.lastSeenDate.toLocaleDateString() : 'Fecha desconocida'})
  ID: ${p.id}`
      ).join('\n\n');

      return {
        content: [{ type: 'text', text: `Resultados encontrados:\n\n${formatted}` }],
      };
    }

    case 'consultar_acopios': {
      const { estado } = request.params.arguments as any;
      
      let whereClause = eq(collectionCenters.status, 'aprobado');
      if (estado) {
        whereClause = require('drizzle-orm').and(whereClause, ilike(collectionCenters.state, `%${estado}%`));
      }

      const results = await db.query.collectionCenters.findMany({
        where: whereClause,
        limit: 20,
        orderBy: [desc(collectionCenters.createdAt)]
      });

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: 'No se encontraron centros de acopio activos.' }],
        };
      }

      const formatted = results.map(c => 
        `- ${c.name}
  Ubicación: ${c.address}, ${c.city}, ${c.state}
  Necesitan: ${c.neededItems || 'No especificado'}
  Contacto: ${c.contactPhone || 'No especificado'}`
      ).join('\n\n');

      return {
        content: [{ type: 'text', text: `Centros de Acopio Activos:\n\n${formatted}` }],
      };
    }

    case 'obtener_estadisticas': {
      // Contador muy simple extraído de unifiedPersons
      const allPersons = await db.query.unifiedPersons.findMany();
      const desaparecidos = allPersons.filter(p => p.status === 'desaparecido').length;
      const localizados = allPersons.filter(p => p.status === 'localizado_sano').length;
      const fallecidos = allPersons.filter(p => p.status === 'fallecido').length;
      
      const acopios = await db.query.collectionCenters.findMany({ where: eq(collectionCenters.status, 'aprobado') });

      return {
        content: [{ type: 'text', text: `Estadísticas Actuales de Todos Unidos:
- Personas Desaparecidas: ${desaparecidos}
- Personas Localizadas: ${localizados}
- Fallecidos Confirmados: ${fallecidos}
- Centros de Acopio Activos: ${acopios.length}` }],
      };
    }

    default:
      throw new Error(`Tool no encontrada: ${request.params.name}`);
  }
});

// Variable global para mantener el transporte SSE
let transport: SSEServerTransport;

app.get('/sse', async (req, res) => {
  if (transport) {
    try {
      await server.close();
    } catch (e) {
      console.error('Error cerrando transporte previo:', e);
    }
  }
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  // El SSEServerTransport requiere manejar el POST
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(500).send('Transport no inicializado. Llama a /sse primero.');
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
app.listen(PORT, () => {
  console.log(`🤖 Servidor MCP de Todos Unidos arrancando en http://localhost:${PORT}`);
  console.log(`📡 Endpoint SSE: http://localhost:${PORT}/sse`);
});
