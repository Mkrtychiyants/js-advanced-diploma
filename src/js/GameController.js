import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Vampire from './characters/Vampire';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';
import Themes from './themes';

const playerTypes = [Swordsman, Bowman, Magician];
const rivalTypes = [Undead, Vampire, Daemon];

const playerStartPositions = [];
const rivalStartPosition = [];

const playerPositions = [];
const rivalPositions = [];

const positionedPlayers = [];
const positionedRivals = [];

let allPlayers;

let previousSelectedPlayer;
let previousSelectedRival;
let selectedCharacter;
let moveAllowed;
let attackAllowed;
let nextMoveRival = true;
let playersPoints = 0;
let levelCount = 0;

function createAllowedPositions(arrToCheck, arrToSave, position) {
  if (arrToSave.includes(arrToCheck[position])) {
    const newPosition = Math.ceil(Math.random() * (arrToCheck.length - 1));
    createAllowedPositions(arrToCheck, arrToSave, newPosition);
  } else {
    arrToSave.push(arrToCheck[position]);
    // arrToDouble.push(arrToCheck[position]);
  }
}
function myTag(string, char) {
  return `${'\u{1F396}'} ${char.level} ${'\u2694'} ${char.attack} ${'\u{1F6E1}'} ${char.defence} ${'\u2764'} ${char.health}`;
}
function refreshBoard(currentThis) {
  currentThis.gamePlay.redrawPositions(allPlayers);
}
function renewAllPlayers() {
  allPlayers = positionedPlayers.concat(...positionedRivals);
  return allPlayers;
}

function checkCell(arr, ind) {
  return arr.find((item) => item.position === ind);
}
function selectPlayer(ind, currentThis) {
  let isPlayer = checkCell(positionedPlayers, ind);
  if (isPlayer) {
    if (previousSelectedPlayer) {
      currentThis.gamePlay.deselectCell(previousSelectedPlayer);
    }
    currentThis.gamePlay.selectCell(ind);
    previousSelectedPlayer = ind;
    selectedCharacter = checkCell(renewAllPlayers(allPlayers), ind);
  } else {
    isPlayer = checkCell(positionedRivals, ind);
    if (isPlayer && !previousSelectedPlayer) {
      GamePlay.showError('Not a player');
    }
  }
}
function selectRival(ind, currentThis) {
  if (previousSelectedRival) {
    for (let index = 0; index < positionedRivals.length; index += 1) {
      const element = positionedRivals[index];
      currentThis.gamePlay.deselectCell(element.position);
    }
  }
  currentThis.gamePlay.selectCell(ind.position, 'green');
}
function transition() {
  nextMoveRival = !!nextMoveRival;
  return nextMoveRival;
}
function removeDead(currentThis) {
  renewAllPlayers().map((item) => {
    if (item.character.health <= 0) {
      let currPlayerInd = positionedRivals.findIndex((item2) => item2 === item);
      if (currPlayerInd !== -1) {
        positionedRivals.splice(currPlayerInd, 1);
        playersPoints += 1;
      } else {
        currPlayerInd = positionedPlayers.findIndex((item2) => item2 === item);
        positionedPlayers.splice(currPlayerInd, 1);
      }
      refreshBoard(currentThis);
    }
    return undefined;
  });
  if (positionedRivals.length === 0) {
    levelUp();
    nextLevel(currentThis);
    levelCount += 1;
    nextTheme(levelCount, arrayFromObj(Themes), this);
  }
}
function gameOver(currentThis) {
  currentThis.gamePlay.boardEl.onCellClick = null;
  currentThis.gamePlay.boardEl.onCellEnter = null;
  currentThis.gamePlay.boardEl.onCellLeave = null;
}
function moveTransition(team1, team2, currentThis) {
  renewAllPlayers();
  removeDead(currentThis);
  if ((team1.length === 0) || (levelCount === 4)) {
    gameOver(currentThis);
  }
  transition();
  AIMove(currentThis);
  saveGame(team1, team2, currentThis);
  transition();
}
function movePlayer(ind, currentThis) {
  const isPlayers = checkCell(positionedPlayers, ind);
  if (moveAllowed && !isPlayers) {
    const currPlayerInd = positionedPlayers.findIndex(
      (item) => item.position === previousSelectedPlayer,
    );
    positionedPlayers.splice(
      currPlayerInd,
      1,
      new PositionedCharacter(selectedCharacter.character, ind),
    );

    refreshBoard(currentThis);
    selectPlayer(ind, currentThis);
    moveTransition(positionedPlayers, positionedRivals, currentThis);
  } else {
    console.log('Cell is occupied');
  }
}
function playerAttack(ind, currentThis) {
  if (attackAllowed) {
    const target = checkCell(positionedRivals, ind).character;
    const damage = Math.max(selectedCharacter.character.attack - target.defence, 
    selectedCharacter.character.attack * 0.1);
    const damageDisp = currentThis.gamePlay.showDamage(ind, damage);
    damageDisp.then(() => {
      target.health -= damage;
      currentThis.gamePlay.redrawPositions(positionedPlayers.concat(...positionedRivals));
      moveTransition(positionedPlayers, positionedRivals, currentThis);
    }).catch((err) => { console.log(err); });
  }
}

function getMoveRange(char) {
  switch (char.type) {
    case 'bowman':
    case 'vampire':
      return 2;
    case 'swordsman':
    case 'undead':
      return 4;
    default:
      return 1;
  }
}
function getAttackRange(char) {
  switch (char.type) {
    case 'bowman':
    case 'vampire':
      return 2;
    case 'swordsman':
    case 'undead':
      return 1;
    default:
      return 4;
  }
}
export function moveCheck(plPos, ind, range) {
  for (let i = 1; i <= range; i += 1) {
    if (((i * 7) === Math.abs(plPos - ind))
    || (((i * 8) === Math.abs(plPos - ind)))
    || (((i * 9) === Math.abs(plPos - ind)))
    || ((i === Math.abs(plPos - ind)))) {
      return true;
    }
  }
  return false;
}
function rivalMoveCheck(rvPos, range) {
  const moveIndArr = new Set();
  for (let i = 1; i <= range; i += 1) {
    moveIndArr.add(rvPos + (i * 7));
    moveIndArr.add(rvPos - (i * 7));
    moveIndArr.add(rvPos + (i * 8));
    moveIndArr.add(rvPos - (i * 9));
    moveIndArr.add(rvPos + i);
    moveIndArr.add(rvPos - i);
  }
  return Array.from(moveIndArr);
}
export function attackCheck(plPos, ind, range) {
  for (let i = 1; i <= range; i += 1) {
    const newPos = plPos - (i * 7);
    const newPos2 = plPos + (i * 7);
    for (let j = 0; j < (i * 2) + 1; j += 1) {
      if ((((ind - newPos) === 8 * j))
        || (((newPos - ind) === j))
        || (ind === (newPos2 - (8 * j)))
        || (ind === (newPos2 + j))
      ) {
        return true;
      }
    }
  }
  return false;
}
function rivalAttackCheck(plPos, range) {
  const attackIndArr = new Set();
  for (let i = 1; i <= range; i += 1) {
    const newPos = plPos - (i * 7);
    const newPos2 = plPos + (i * 7);
    for (let j = 0; j < (i * 2) + 1; j += 1) {
      attackIndArr.add(Math.abs(newPos + (8 * j)));
      attackIndArr.add(Math.abs(newPos - j));
      attackIndArr.add(Math.abs(newPos2 - (8 * j)));
      attackIndArr.add(Math.abs(newPos2 + j));
    }
  }
  return Array.from(attackIndArr);
}

function getRandomRival() {
  return positionedRivals[Math.floor(Math.random() * (positionedRivals.length))];
}

function levelUp() {
  positionedPlayers.map((item) => {
    if (item.character.health <= 20) {
      item.character.health += 80;
    } else {
      item.character.health = 100;
    }
    if (item.character.level <= 3) {
      item.character.level += 1;
    }
    item.character.attack = Math.max(item.character.attack, item.character.attack * ((80 + item.character.health) / 100));
    item.character.defence = Math.max(item.character.defence, item.character.defence * ((80 + item.character.health) / 100));
  });
}
function arrayFromObj(thm) {
  const levels = Object.values(thm);
  return levels;
}
function nextTheme(lvlCount, lvls, currentThis) {
  const nextLevel = saveGame(positionedPlayers, positionedRivals, currentThis);
  if (lvlCount < lvls.length) {
    return lvls[nextLevel.n += 1];
  }
  lvlCount = 0;
  nextTheme(lvlCount, lvls, currentThis);
}
function nextLevel(currentThis) {
  const nextLevel = saveGame(positionedPlayers, positionedRivals, currentThis);
  const gameCtrl = new GameController(nextLevel, currentThis.stateService);
  gameCtrl.init.call(currentThis, currentThis.gamePlay.drawUi(nextTheme(levelCount, arrayFromObj(Themes), currentThis)));
}

function doRandomMove(previousSelectedRival, currentThis) {
  const attackCells = rivalAttackCheck(previousSelectedRival.position, getAttackRange(previousSelectedRival.character));
  const attackedPlayers = positionedPlayers.filter((item) => attackCells.includes(item.position));

  if (attackedPlayers[0]) {
    const target = attackedPlayers[0].character;
    const damage = Math.max(previousSelectedRival.character.attack - target.defence, previousSelectedRival.character.attack * 0.1);
    const damageDisp = currentThis.gamePlay.showDamage(attackedPlayers[0].position, damage);

    damageDisp.then(() => {
      target.health -= damage;
      renewAllPlayers(),
      refreshBoard(currentThis);
    }).catch((err) => { console.log(err); });
  } else {
    const moveCells = rivalMoveCheck(previousSelectedRival.position, getMoveRange(previousSelectedRival.character));
    const nextMoveCell = moveCells[Math.floor(Math.random() * (moveCells.length - 1))];
    renewAllPlayers();
    const isPlayers = checkCell(nextMoveCell);
    if (!isPlayers) {
      const currRivalInd = positionedRivals.findIndex((item) => item.position === previousSelectedRival.position);
      positionedRivals.splice(currRivalInd, 1, new PositionedCharacter(previousSelectedRival.character, nextMoveCell));
      previousSelectedRival.position = nextMoveCell;
      renewAllPlayers(),
      refreshBoard(currentThis);
    }
  }
}
function AIMove(currentThis) {
  if (nextMoveRival) {
    previousSelectedRival = getRandomRival();
    doRandomMove(previousSelectedRival, currentThis);
    selectRival(previousSelectedRival, currentThis);
  }
}
function playerMove(ind, currentThis, nextTurn) {
  if (!nextTurn) {
    selectPlayer(ind, currentThis);
    movePlayer(ind, currentThis);
    playerAttack(ind, currentThis);
  } else {
    console.log('Not your move!');
  }
}
export function saveGame(team1, team2, currentThis) {
  Object.defineProperty(
    currentThis.gamePlay,
    'team1',
    {
      value: team1,
      writable: true,
      enumerable: true,
      configurable: true,
    },
  );
  Object.defineProperty(
    currentThis.gamePlay,
    'team2',
    {
      value: team2,
      writable: true,
      enumerable: true,
      configurable: true,
    },
  );
  Object.defineProperty(
    currentThis.gamePlay,
    'points',
    {
      value: playersPoints,
      writable: true,
      enumerable: true,
      configurable: true,
    },
  );
  Object.defineProperty(
    currentThis.gamePlay,
    'nextMove',
    {
      value: nextMoveRival,
      writable: true,
      enumerable: true,
      configurable: true,
    },
  );
  Object.defineProperty(
    currentThis.gamePlay,
    'nextLevel',
    {
      value: levelCount,
      writable: true,
      enumerable: true,
      configurable: true,
    },
  );

  GameState.from(currentThis.gamePlay);

  const gameLoad = GameState.getGame();

  currentThis.stateService.save(gameLoad);
  try {
    return currentThis.stateService.load();
  } catch (error) {
    GamePlay.showError(error);
  }
}

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    const playerTeam = generateTeam(playerTypes, 3, 4);
    const rivalTeam = generateTeam(rivalTypes, 3, 4);
    const fieldArr = this.gamePlay.boardSize;

    for (let index = 0; index < fieldArr * fieldArr; index += 1) {
      if (index % (fieldArr) === 0) {
        playerStartPositions.push(index);
      }
      if (((index % (fieldArr)) - 1) === 0) {
        playerStartPositions.push(index);
      }
      if (((index % fieldArr) - (fieldArr - 1)) === 0) {
        rivalStartPosition.push(index);
      }
      if (((index % fieldArr) - (fieldArr - 2)) === 0) {
        rivalStartPosition.push(index);
      }
    }

    for (let index = 0; index < playerTeam.characters.length; index += 1) {
      createAllowedPositions(
        playerStartPositions,
        playerPositions,
        Math.ceil(Math.random() * (playerStartPositions.length - 1)),
      );

      createAllowedPositions(
        rivalStartPosition,
        rivalPositions,
        Math.ceil(Math.random() * (rivalStartPosition.length - 1)),
      );

      positionedPlayers.push(
        new PositionedCharacter(
          playerTeam.characters[index],
          playerPositions[index],
        ),
      );
      positionedRivals.push(
        new PositionedCharacter(
          rivalTeam.characters[index],
          rivalPositions[index],
        ),
      );
    }
    renewAllPlayers();
    refreshBoard(this);

    this.gamePlay.boardEl.onCellEnter = this.gamePlay.addCellEnterListener(
      this.onCellEnter.bind(this),
    );
    this.gamePlay.boardEl.onCellLeave = this.gamePlay.addCellLeaveListener(
      this.onCellLeave.bind(this),
    );
    this.gamePlay.boardEl.onCellClick = this.gamePlay.addCellClickListener(
      this.onCellClick.bind(this),
    );
    this.gamePlay.newGameEl.onCellClick = this.gamePlay.addNewGameListener(
      this.onNewGameClick.bind(this),
    );
    this.gamePlay.saveGameEl.onCellClick = this.gamePlay.addSaveGameListener(
      this.onSaveGameClick.bind(this),
    );
    this.gamePlay.loadGameEl.onCellClick = this.gamePlay.addLoadGameListener(
      this.onLoadGameClick.bind(this),
    );
  }

  onCellClick(index) {
    // TODO: react to click
    playerMove(index, this);
  }

  onNewGameClick() {
    // TODO: react to click
    const nextLevel = saveGame(positionedPlayers, positionedRivals, this);
    const gameCtrl = new GameController(nextLevel, this.stateService);
    gameCtrl.init.call(this, this.gamePlay.drawUi(nextTheme(levelCount, arrayFromObj(Themes), this)));
  }

  onSaveGameClick() {
    // TODO: react to click
    const nextLevel = saveGame(positionedPlayers, positionedRivals, this);
  }

  onLoadGameClick() {
    // TODO: react to click
    const nextLevel = saveGame(positionedPlayers, positionedRivals, this);
    const gameCtrl = new GameController(nextLevel, this.stateService);
    gameCtrl.init.call(this, this.gamePlay.drawUi(nextTheme(levelCount, arrayFromObj(Themes), this)));
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const anyCharInCell = checkCell(renewAllPlayers(allPlayers), index);
    const playerCharInCell = checkCell(positionedPlayers, index);
    const rivalCharInCell = checkCell(positionedRivals, index);

    function attackCellsCheck(previousCell, ind, range, currentThis) {
      if (rivalCharInCell) {
        if ((attackCheck(previousCell, ind, range))) {
          currentThis.gamePlay.selectCell(ind, 'red');
          currentThis.gamePlay.setCursor(cursors.crosshair);
          attackAllowed = true;
        }
      } else {
        attackAllowed = false;
      }
    }

    function moveCellsCheck(previousCell, ind, range, currentThis) {
      if (!anyCharInCell) {
        if (moveCheck(previousCell, ind, range)) {
          currentThis.gamePlay.selectCell(ind, 'green');
          currentThis.gamePlay.setCursor(cursors.pointer);
          moveAllowed = true;
        }
      } else {
        moveAllowed = false;
      }
    }

    if (anyCharInCell) {
      const output = myTag`${anyCharInCell.character}`;
      this.gamePlay.showCellTooltip(output, index);
      if (playerCharInCell) {
        this.gamePlay.setCursor(cursors.pointer);
      }
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }
    if (previousSelectedPlayer && (previousSelectedPlayer !== index)) {
      const moveRange = getMoveRange(selectedCharacter.character);
      const attackRange = getAttackRange(selectedCharacter.character);
      moveCellsCheck(previousSelectedPlayer, index, moveRange, this);
      attackCellsCheck(previousSelectedPlayer, index, attackRange, this);
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.deselectCell(index);
    if (previousSelectedPlayer) {
      this.gamePlay.selectCell(previousSelectedPlayer);
    }
  }
}
