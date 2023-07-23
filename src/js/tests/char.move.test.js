import { moveCheck, attackCheck } from '../GameController';

test('character move test', () => {
  expect(moveCheck(19, 10, 1)).toBeTruthy();
  expect(() => { moveCheck(10, 10, 1).not.toBeTruthy(); });
});
test('character attact test', () => {
  expect(attackCheck(36, 20, 2)).toBeTruthy();
  expect(() => { attackCheck(36, 2, 2).not.toBeTruthy(); });
});
