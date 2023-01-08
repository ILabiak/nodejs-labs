import processedContentTypes from './content-types.js';

export class Router {
  constructor() {
    this.handlers = {};

    this.get = this.add.bind(this, 'GET');
    this.post = this.add.bind(this, 'POST');
    this.options = this.add.bind(this, 'OPTIONS');
    this.head = this.add.bind(this, 'HEAD');
    this.patch = this.add.bind(this, 'PATCH');
    this.connect = this.add.bind(this, 'CONNECT');
    this.delete = this.add.bind(this, 'DELETE');
    this.trace = this.add.bind(this, 'TRACE');
    this.put = this.add.bind(this, 'PUT');
  }

  add(method, route, ...fns) {
    if (typeof route !== 'string' || route.length < 1) {
      return;
    }
    if (!fns[0]) {
      throw new Error('Give functions to router');
    }
    const url = new URL(route, 'https://localhost:5002');
    const pathArr = url.pathname.split('/').filter((e) => e);
    if (!pathArr[0]) {
      route = '/';
      this.handlers[route] = {
        ...this.handlers[route],
        [method]: [...fns],
      };
    } else {
      this.updateHandlers(pathArr, this.handlers, method, ...fns);
    }
  }

  updateHandlers(keysArr, handlersObj, method, ...fns) {
    if (keysArr.length > 1) {
      const key = keysArr.shift();
      handlersObj[key] = handlersObj[key] || {};
      this.updateHandlers(keysArr, handlersObj[key], method, ...fns);
    } else if (keysArr.length === 1) {
      const route = keysArr[0];
      handlersObj[route] = {
        ...handlersObj[route],
        [method]: [...fns],
      };
    }
  }

  getHandlers(pathArr, method, handlersObj = this.handlers) {
    let key;
    if (pathArr.length > 1) {
      key = pathArr.shift();
      if (handlersObj[key]) {
        return this.getHandlers(pathArr, method, handlersObj[key]);
      }
    } else if (pathArr.length === 1) {
      key = pathArr[0];
      if (handlersObj[key]?.[method]) {
        return handlersObj[key][method];
      }
    }
  }

  async handle(req, res) {
    const { url, method } = req;
    const pathArr = url.split('/').filter((e) => e);
    const methodHandlers = this.getHandlers(pathArr, method);
    if (!methodHandlers) {
      res.json({ error: 'method not implemented' });
    } else {
      let payload = {};
      if (req.headers['content-type']) {
        const contentType = req.headers['content-type'].split(';')[0];
        if (processedContentTypes[contentType]) {
          payload = await processedContentTypes[contentType](req.body);
        }
      }
      for (const handler of methodHandlers) {
        await handler(req, res, payload);
      }
    }
    res.status(200).end();
  }
}
