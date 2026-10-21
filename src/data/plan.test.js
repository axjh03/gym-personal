import { plan, todayIndex, todaySession } from './plan';
import catalog from './exercises.json';
import media from './media.json';

test('maps local Sunday=0 to the final session and Monday=1 to the first', () => {
  expect(todayIndex(new Date(2026, 9, 18))).toBe(6);
  expect(todaySession(new Date(2026, 9, 18)).day).toBe('Sun');
  expect(todayIndex(new Date(2026, 9, 19))).toBe(0);
  expect(todaySession(new Date(2026, 9, 19))).toBe(plan[0]);
});

test('each day has ten distinct recommendations with local photos', () => {
  const knownIds = new Set(catalog.map(exercise => exercise.id));
  for (const session of plan) {
    expect(['upper', 'lower', 'recovery']).toContain(session.group);
    const ids = [...session.exercises.map(([id]) => id), ...session.alternatives];
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    for (const id of ids) {
      expect(knownIds.has(id)).toBe(true);
      expect(media[id].frames[0]).toBe(`/exercises/${id}/0.jpg`);
      expect(media[id].frames[1]).toBe(`/exercises/${id}/1.jpg`);
    }
  }
});
