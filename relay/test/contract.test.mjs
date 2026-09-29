import test from 'node:test';
import assert from 'node:assert/strict';
import { coercePresentationState } from '../protocol.mjs';

test('state normalization rebuilds nested overlays without private fields or aliasing', () => {
  const input = {
    version: 1, stageId: 'understand', focusId: 'complexing-agents',
    nim: 'private', notebook: { text: 'private' },
    demoOverlay: { kind: 'complexing-agent', id: 'edta', nim: 'private', nested: { cer: 'private' } },
  };
  const result = coercePresentationState(input);
  assert.deepEqual(result, {
    version: 1, stageId: 'understand', focusId: 'complexing-agents',
    demoOverlay: { kind: 'complexing-agent', id: 'edta' },
  });
  assert.notEqual(result.demoOverlay, input.demoOverlay);
  input.demoOverlay.id = 'citrate';
  assert.equal(result.demoOverlay.id, 'edta');
});

test('state normalization rejects arrays and impossible stage focus or overlay combinations', () => {
  const bad = [null, [], Object.assign([], { version: 1, stageId: 'brief' }),
    { version: 2, stageId: 'brief' }, { version: 1, stageId: 'invented' },
    { version: 1, stageId: 'brief', focusId: 'cell-map' },
    { version: 1, stageId: 'understand', focusId: 'calculator' },
    { version: 1, stageId: 'prove', focusId: 'complexing-agents' },
    { version: 1, stageId: 'ready', demoOverlay: { kind: 'complexing-agent', id: 'edta' } },
    { version: 1, stageId: 'understand', demoOverlay: Object.assign([], { kind: 'complexing-agent', id: 'edta' }) },
    { version: 1, stageId: 'understand', demoOverlay: { kind: 'complexing-agent', id: 'other' } },
    { version: 1, stageId: 'prove', focusId: null },
  ];
  for (const input of bad) assert.equal(coercePresentationState(input), null, JSON.stringify(input));
  for (const stageId of ['brief', 'understand', 'rehearse', 'prove', 'ready']) {
    assert.deepEqual(coercePresentationState({ version: 1, stageId, demoOverlay: null }), { version: 1, stageId, demoOverlay: null });
  }
  for (const focusId of ['cell-map', 'complexing-agents']) {
    assert.ok(coercePresentationState({ version: 1, stageId: 'understand', focusId }));
  }
  assert.ok(coercePresentationState({ version: 1, stageId: 'prove', focusId: 'calculator' }));
});
