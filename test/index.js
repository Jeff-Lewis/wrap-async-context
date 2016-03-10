import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import express from 'express';
import uuid from 'node-uuid';
import request from 'supertest-as-promised';

import context, { createContextMiddleware } from '../lib';

chai.use(chaiAsPromised);

describe('async-wrap-context with echo server', () => {
  let app;
  beforeEach('setup echo server', () => {
    app = express();
    app.use(createContextMiddleware(uuid.v4));
    app.get('/', (req, res) => {
      assert.equal(context().id, req.headers['x-request-id'], 'l1');
      setTimeout(() => {
        assert.equal(context().id, req.headers['x-request-id'], 'l2');
        setTimeout(() => {
          assert.equal(context().id, req.headers['x-request-id'], 'l3');
          setTimeout(() => {
            assert.equal(context().id, req.headers['x-request-id'], 'l4');
            res.send(context().id);
          }, Math.random() * 50);
        }, Math.random() * 50);
      }, Math.random() * 50);
    });
  });

  const assertReq = id =>
    request(app)
      .get('/')
      .set('X-Request-Id', id)
      .expect(200)
      .then(({ text }) => assert.equal(text, id, 'response'));

  it('responds correctly with a single request', () => assertReq(uuid.v4()));
  it('responds correctly with loads of requests', () =>
    Promise.all(Array.apply(null, Array(500)).map(() => assertReq(uuid.v4()))));
});
