import { plan, todayIndex, todaySession } from './plan';

test('maps local Sunday=0 to the final session and Monday=1 to the first', () => {
  expect(todayIndex(new Date(2026, 9, 18))).toBe(6);
  expect(todaySession(new Date(2026, 9, 18)).day).toBe('Sun');
  expect(todayIndex(new Date(2026, 9, 19))).toBe(0);
  expect(todaySession(new Date(2026, 9, 19))).toBe(plan[0]);
});
