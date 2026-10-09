import test from 'node:test';
import assert from 'node:assert/strict';
// Parity guard: the relay's pure-JS validator (shared/m3-contract.mjs) and the
// app's TypeScript entry (lib/m3-presentation.ts) MUST behave identically. The
// app now re-exports the .mjs validator, so this asserts the wiring stays intact
// — if someone re-forks a second copy, these cases catch the drift.
import { coercePresentationState as sharedCoerce } from '../../shared/m3-contract.mjs';
import { coercePresentationState as appCoerce } from '../../lib/m3-presentation.ts';

const CASES = [
  // Legacy states (pre Phase 1) still behave exactly as before.
  { version: 1, stageId: 'brief' },
  { version: 1, stageId: 'understand', focusId: 'complexing-agents' },
  { version: 1, stageId: 'prove', focusId: 'calculator' },
  { version: 1, stageId: 'understand', demoOverlay: { kind: 'complexing-agent', id: 'edta' } },
  // Review-session additions.
  { version: 1, stageId: 'brief', slideId: 'p1' },
  { version: 1, stageId: 'understand', slideId: 'p7' },
  { version: 1, stageId: 'understand', slideId: 'p6', simState: { playing: true, time: 4.5, complexed: true, view: 'cell' } },
  { version: 1, stageId: 'prove', slideId: 'p8', phase: 'review', dataSetId: 'abc12345' },
  { version: 1, stageId: 'ready', phase: 'games' },
  // Rejections.
  { version: 1, stageId: 'understand', simState: { playing: 'invalid' } },
  { version: 1, stageId: 'understand', simState: { playing: true, time: 5, complexed: true, view: 'unknown' } },
  { version: 1, stageId: 'brief', slideId: 'p7' },      // slide/chapter mismatch
  { version: 1, stageId: 'brief', slideId: 'nope' },     // unknown slide
  { version: 1, stageId: 'brief', phase: 'party' },      // unknown phase
  { version: 1, stageId: 'brief', dataSetId: 'x' },      // too-short dataSetId
  { version: 1, stageId: 'brief', dataSetId: 'has space' },
  { version: 2, stageId: 'brief' },                      // wrong version
  { version: 1, stageId: 'invented' },                   // unknown stage
  null,
  [],
];

test('relay (.mjs) and app (.ts) validators agree on every case', () => {
  for (const input of CASES) {
    const a = sharedCoerce(input);
    const b = appCoerce(input);
    assert.deepEqual(a, b, `divergence on ${JSON.stringify(input)}`);
  }
});

test('new optional fields are stripped when absent and preserved when valid', () => {
  const minimal = appCoerce({ version: 1, stageId: 'brief' });
  assert.deepEqual(minimal, { version: 1, stageId: 'brief' });
  assert.equal('slideId' in minimal, false);
  assert.equal('phase' in minimal, false);
  assert.equal('dataSetId' in minimal, false);
  assert.equal('simState' in minimal, false);

  const full = appCoerce({ version: 1, stageId: 'prove', slideId: 'p8', phase: 'review', dataSetId: 'DS_123456', simState: { playing: true, time: 2.5, complexed: false, view: 'closeup' } });
  assert.deepEqual(full, { version: 1, stageId: 'prove', slideId: 'p8', phase: 'review', dataSetId: 'DS_123456', simState: { playing: true, time: 2.5, complexed: false, view: 'closeup' } });
});
