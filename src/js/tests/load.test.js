import { load } from '../GameStateService';
import { saveGame } from '../GameController';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('load success', () => {
  expect(() => {
    load.mockReturnValue(JSON.parse({}));
    saveGame();
    expect(load).toHaveReturned();
  });
});

test('load error', () => {
  expect(() => {
    load.mockReturnValue(new Error('Invalid state'));
    saveGame();
    expect(load).toThrow();
  });
});
