import config from 'config';
import Server from './core/Server.js';

const shouldSeed: boolean = config.get('database.seed');

const server = new Server(shouldSeed);

server.start();
