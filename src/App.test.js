import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { plan, todayIndex } from './data/plan';
import catalog from './data/exercises.json';

beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

test('today plan opens a movement with three short cues', async () => {
  window.location.hash = '#/plan';
  render(<App />);
  const [id] = plan[todayIndex()].exercises[0];
  const name = catalog.find(exercise => exercise.id === id).name;
  expect(screen.getByText('Weekly plan')).toBeInTheDocument();
  expect(screen.getByText('TODAY')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: `Open ${name}` }));
  expect(await screen.findByText('SETUP')).toBeInTheDocument();
  expect(screen.getByText('MOVE')).toBeInTheDocument();
  expect(screen.getByText('AVOID')).toBeInTheDocument();
});

test('library searches beginner movements and filters equipment and muscle', () => {
  window.location.hash = '#/library';
  render(<App />);
  const search = screen.getByRole('searchbox', { name: 'Search exercises' });
  for (const query of ['bench', 'push', 'leg press', 'hamstring stretch']) {
    fireEvent.change(search, { target: { value: query } });
    expect(screen.getAllByText(new RegExp(query, 'i')).length).toBeGreaterThan(0);
  }
  fireEvent.change(search, { target: { value: 'bench' } });
  fireEvent.click(screen.getByRole('button', { name: 'Machines' }));
  fireEvent.click(screen.getByRole('button', { name: 'Chest' }));
  expect(screen.getByText('Machine Bench Press')).toBeInTheDocument();
});
