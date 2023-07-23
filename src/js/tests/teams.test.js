import { characterGenerator, generateTeam } from '../generators';
import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Team from '../Team';

test('character test', () => {
  expect(() => { new Character(1).toThrow('no new invokement'); });
});
test('character extends test', () => {
  expect(new Bowman(2)).toBeInstanceOf(Bowman);
});
test('new characters traits', () => {
  const newBWM = new Bowman(1);
  expect(newBWM.type).toBe('bowman');
  expect(newBWM.attack).toBe(25);
  expect(newBWM.defence).toBe(25);
});
test('infinte character generator', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const playerGenerator = characterGenerator(playerTypes, 2);
  let character1;
  do {
    character1 = playerGenerator.next().value;
  } while (character1.type !== 'bowman');
  expect(character1).toBeInstanceOf(Bowman);

  do {
    character1 = playerGenerator.next().value;
  } while (character1.type !== 'swordsman');
  expect(character1).toBeInstanceOf(Swordsman);

  do {
    character1 = playerGenerator.next().value;
  } while (character1.type !== 'magician');
  expect(character1).toBeInstanceOf(Magician);
});

test('team generator', () => {
  const playerTypes = [Bowman];
  const playerTeam = generateTeam(playerTypes, 2, 10);
  const levelArr = [];
  playerTeam.characters.forEach((el) => { levelArr.push(el.level); });
  expect(levelArr).toContain(1);
  expect(levelArr).toContain(2);
});

test('team generator error', () => {
  expect(() => { Team(); }).toThrow();
});
