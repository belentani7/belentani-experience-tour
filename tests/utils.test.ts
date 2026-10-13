import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/lib/utils.ts';

test('cn joins present class names without literal false or undefined', () => {
  assert.equal(cn('base', false, undefined, 'active'), 'base active');
  assert.equal(cn(null, '', undefined), '');
});
