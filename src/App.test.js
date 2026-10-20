import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { plan, todayIndex } from './data/plan';
import catalog from './data/exercises.json';

beforeAll(() => {
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

test('today plan opens a movement with three short cues', async () => {
  window.location.hash = '#/plan';
  render(<App />);
  const otherDay = (todayIndex() + 1) % 7;
  const otherRow = screen.getByRole('button', { name: name => name.includes(plan[otherDay].title) });
  fireEvent.click(otherRow);
  expect(otherRow).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('TODAY')).toBeInTheDocument();
  const [id] = plan[otherDay].exercises[0];
  const name = catalog.find(exercise => exercise.id === id).name;
  expect(screen.getByText('Weekly plan')).toBeInTheDocument();
  window.scrollTo.mockClear();
  fireEvent.click(screen.getByRole('button', { name: `Open ${name}` }));
  expect(await screen.findByText('SETUP')).toBeInTheDocument();
  expect(screen.getByText('MOVE')).toBeInTheDocument();
  expect(screen.getByText('AVOID')).toBeInTheDocument();
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  fireEvent.touchStart(screen.getByText('SETUP'), { touches: [{ clientY: 40 }] });
  fireEvent.touchEnd(screen.getByText('SETUP'), { changedTouches: [{ clientY: 180 }] });
  expect(screen.getByText('SETUP')).toBeInTheDocument();
  fireEvent.touchStart(screen.getByText('EXERCISE'), { touches: [{ clientY: 40 }] });
  fireEvent.touchEnd(screen.getByText('EXERCISE'), { changedTouches: [{ clientY: 180 }] });
  expect(await screen.findByText('Weekly plan')).toBeInTheDocument();
});

test('library searches all movements and shows source instructions', async () => {
  window.location.hash = '#/library';
  render(<App />);
  expect(screen.getByText('All exercises')).toBeInTheDocument();
  expect(screen.getByText(`${catalog.length} MOVES`)).toBeInTheDocument();
  const search = screen.getByRole('searchbox', { name: 'Search exercises' });
  for (const query of ['bench', 'push', 'leg press', 'hamstring stretch']) {
    fireEvent.change(search, { target: { value: query } });
    expect(screen.getAllByText(new RegExp(query, 'i')).length).toBeGreaterThan(0);
  }
  fireEvent.change(search, { target: { value: 'bench' } });
  fireEvent.click(screen.getByRole('button', { name: 'Machines' }));
  fireEvent.click(screen.getByRole('button', { name: 'Chest' }));
  expect(screen.getByText('Machine Bench Press')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Dumbbells' }));
  fireEvent.change(search, { target: { value: 'dumbbell bench press' } });
  fireEvent.click(screen.getByRole('button', { name: /^Dumbbell Bench Press Dumbbells/i }));
  expect(await screen.findByText('How to')).toBeInTheDocument();
  expect(screen.getByText(/Lie down on a flat bench with a dumbbell/i)).toBeInTheDocument();
});
