import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'test'
    ? '.env.test'
    : (process.env.NODE_ENV === 'production' ? '.env.production' : '.env');

console.log(`Loading environment from ${envFile}...`);
dotenv.config({ path: path.resolve(__dirname, envFile) });
