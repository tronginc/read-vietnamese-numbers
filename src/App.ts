import * as path from 'path';
import * as core from 'express-serve-static-core';
import * as express from 'express';
import * as helmet from 'helmet';
import * as dotenv from 'dotenv';

import Logger from './Logger';
import ReadRouter from './ReadRouter';

// Init
const App: core.Express = express();
dotenv.config();

// Security
App.disable('x-powered-by');
App.use(helmet({
    contentSecurityPolicy: false  // Disable auto-upgrade insecure request
}));

// Logging
App.use(Logger);

// Routing for API
App.use(ReadRouter);

// Serve static files for demo
App.use(express.static(path.join(__dirname, '..', 'demo')));

// Start server
const PORT: number = parseInt(process.env.PORT) || 3000;
App.listen(PORT, () => {
    console.log('Server is running at', PORT);
});
