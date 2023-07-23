import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  const randomCharacter = Math.ceil(Math.random() * allowedTypes.length - 1);
  const randomLevel = Math.ceil(Math.random() * maxLevel);
  yield new allowedTypes[randomCharacter](randomLevel);
  yield* characterGenerator(allowedTypes, maxLevel);
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team1 = [];
  const teamCharacters1 = characterGenerator(allowedTypes, maxLevel);

  for (let index = 0; index < characterCount; index += 1) {
    team1.push(teamCharacters1.next().value);
  }
  return new Team(team1);
}
