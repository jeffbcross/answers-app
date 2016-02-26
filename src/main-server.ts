/// <reference path="../typings/main.d.ts" />

import * as path from 'path';
import * as express from 'express';
import {SERVER_LOCATION_PROVIDERS, ng2engine, REQUEST_URL} from 'angular2-universal-preview/dist/server';

import {provide} from 'angular2/core';
import {APP_BASE_HREF, ROUTER_PROVIDERS} from 'angular2/router';

import {SHARED_PROVIDERS} from './shared-providers';

// Angular 2
import {App} from './components/app';

let app = express();
let root = path.join(path.resolve(__dirname, '..'));

// Express View
app.engine('.ng2.html', ng2engine);
app.set('views', root);
app.set('view engine', 'ng2.html');

// Serve static files
app.use(express.static(root));

// Routes
app.use('/', (req, res) => {
  let baseUrl = `http://localhost:3000${req.baseUrl}`;
  let url = req.originalUrl.replace(baseUrl, '') || '/';
  res.render('index', { App, providers: [
    provide(REQUEST_URL, {useValue: url}),
    ROUTER_PROVIDERS,
    SERVER_LOCATION_PROVIDERS,
    provide(APP_BASE_HREF, {useValue: baseUrl}),
    SHARED_PROVIDERS
  ] });
});

// Server
app.listen(3000, () => {
  console.log('Listen on http://localhost:3000');
});
