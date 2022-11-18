import functions from 'firebase-functions';
import { Router } from './router/router.js';

const simpleRouter = new Router();

simpleRouter.get('/api/test', (req, res) => {
  res.json({
    success: true,
    method: req.method,
    url: req.url,
    message: 'GET /api/test works!',
  });
});
simpleRouter.post('/api/test', (req, res, payload) => {
  res.json({
    success: true,
    method: req.method,
    url: req.url,
    message: 'POST /api/test works!',
    payload,
  });
});
simpleRouter.options('/api/test', (req, res, payload) => {
  res.json({
    success: true,
    method: req.method,
    url: req.url,
    message: 'OPTIONS /api/test works!',
    payload
  });
});
simpleRouter.get('/api/test/test2', (req, res) => {
  res.json({
    success: true,
    method: req.method,
    url: req.url,
    message: 'GET /api/test/test2 works!',
  });
});

export const router = functions.https.onRequest(async (request, response) => {
  try {
    await simpleRouter.handle(request, response);
  } catch (e) {
    response.status(500).json({
      error: 'Internal error',
      details: e.message
    });
  }
});