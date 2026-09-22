import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addTimeZone,
  createClockState,
  formatClockValues,
  getDefaultTimeZones,
  removeTimeZone,
  toggleHourCycle
} from '../clock.mjs';

test('default zones include local and core world zones', () => {
  const local = 'Asia/Kolkata';
  const zones = getDefaultTimeZones(local);

  assert.ok(zones.includes(local));
  assert.ok(zones.includes('UTC'));
  assert.ok(zones.includes('America/New_York'));
  assert.ok(zones.includes('Europe/London'));
  assert.ok(zones.includes('Asia/Tokyo'));
  assert.ok(zones.includes('Australia/Sydney'));
});

test('time formatting supports 12h and 24h output for a timezone', () => {
  const date = new Date('2025-01-01T13:15:30Z');

  const twelveHour = formatClockValues(date, 'UTC', false, 'en-US').time;
  const twentyFourHour = formatClockValues(date, 'UTC', true, 'en-US').time;

  assert.match(twelveHour, /PM|AM/);
  assert.match(twentyFourHour, /^13:/);
  assert.notEqual(twelveHour, twentyFourHour);
});

test('state operations add remove and toggle as expected', () => {
  let state = createClockState({
    localTimeZone: 'UTC',
    timeZones: ['UTC'],
    use24Hour: false
  });

  state = addTimeZone(state, 'Europe/London');
  assert.deepEqual(state.timeZones, ['UTC', 'Europe/London']);

  state = addTimeZone(state, 'Europe/London');
  assert.deepEqual(state.timeZones, ['UTC', 'Europe/London']);

  state = removeTimeZone(state, 'UTC');
  assert.deepEqual(state.timeZones, ['Europe/London']);

  state = toggleHourCycle(state);
  assert.equal(state.use24Hour, true);
});
