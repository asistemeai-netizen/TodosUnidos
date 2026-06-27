import { db } from './src/index';
import { newsSummaries } from './src/schema';

async function seed() {
  await db.insert(newsSummaries).values({
    title: 'Boletín de Emergencia - IA',
    content: 'Se activan nuevos protocolos de seguridad en la región capital. Los cuerpos de rescate han reportado la apertura de tres nuevos centros de acopio y recomiendan a la población mantenerse informada a través de canales oficiales. Las vías principales se encuentran despejadas.',
    sourceName: 'Consolidado IA (Simulación)',
  });
  console.log('Noticia inyectada con éxito!');
}
seed().catch(console.error);
