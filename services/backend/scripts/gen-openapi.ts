import { writeFile } from 'node:fs/promises';
import app, { openApiConfig } from '../src/index';

const document = app.getOpenAPI31Document(openApiConfig);
await writeFile(new URL('../openapi.json', import.meta.url), `${JSON.stringify(document, null, 2)}\n`);
console.log('Generated services/backend/openapi.json');
