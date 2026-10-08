import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server/app';
import { generationArguments, isLocalGenerationRequest } from '../src/server/generation-policy';

test('only loopback requests from the local origin can generate', () => {
  assert.equal(isLocalGenerationRequest('127.0.0.1', 'localhost:3000', 'http://localhost:3000'), true);
  assert.equal(isLocalGenerationRequest('::1', '[::1]:3000', undefined), true);
  assert.equal(isLocalGenerationRequest('192.168.0.2', 'localhost:3000', undefined), false);
  assert.equal(isLocalGenerationRequest('127.0.0.1', 'localhost:3000', 'https://example.com'), false);
  assert.equal(isLocalGenerationRequest('127.0.0.1', 'example.com', 'http://example.com'), false);
});

test('rejects fractional, infinite, repeated and out-of-range generator arguments', () => {
  assert.deepEqual(generationArguments({}), []);
  assert.deepEqual(generationArguments({ days: '31', force: 'true' }), ['--days', '31', '--force']);
  for (const days of ['0', '32', '-1', '1.5', 'Infinity', ['1', '2'], 'NaN']) assert.equal(generationArguments({ days }), null);
  assert.equal(generationArguments({ force: 'yes' }), null);
});

test('HTTP validation prevents execution; failures become usable responses', async () => {
  let calls = 0;
  const app = createApp(async args => {
    calls++;
    if (args.length) throw new Error('test failure');
    return { ok: true, output: 'fixture only' };
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const url = `http://127.0.0.1:${address.port}/api/generate`;
  try {
    assert.equal((await fetch(url, { method: 'POST', headers: { Origin: 'https://example.com' } })).status, 403);
    assert.equal((await fetch(url + '?days=1.5', { method: 'POST' })).status, 400);
    assert.equal(calls, 0);
    assert.equal((await fetch(url, { method: 'POST' })).status, 200);
    assert.equal((await fetch(url + '?days=2', { method: 'POST' })).status, 500);
    assert.equal(calls, 2);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
