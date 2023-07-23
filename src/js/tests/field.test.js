import { calcTileType } from '../utils';

test('calcTileType test 1', () => {
  const data = calcTileType(0, 8);
  expect(data).toMatch('top-left');
});
test('calcTileType test 2', () => {
  const data = calcTileType(7, 8);
  expect(data).toMatch('top-right');
});
test('calcTileType test 3', () => {
  const data = calcTileType(56, 8);
  expect(data).toMatch('bottom-left');
});
test('calcTileType test 4', () => {
  const data = calcTileType(63, 8);
  expect(data).toMatch('bottom-right');
});
test('calcTileType test 5', () => {
  const data = calcTileType(16, 8);
  expect(data).toMatch('left');
});
test('calcTileType test 6', () => {
  const data = calcTileType(23, 8);
  expect(data).toMatch('right');
});
test('calcTileType test 7', () => {
  const data = calcTileType(4, 8);
  expect(data).toMatch('top');
});
test('calcTileType test 8', () => {
  const data = calcTileType(62, 8);
  expect(data).toMatch('bottom');
});
test('calcTileType test 9', () => {
  const data = calcTileType(44, 8);
  expect(data).toMatch('center');
});
