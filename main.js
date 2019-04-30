/*
NOTE: You will need to add and modify code in this file to complete this project.
I have defined a few functions and variables to help guide you but that doesn't mean no other variables or functions are necessary.
If you think you have a better / different way to do things, you are free to do so :)
*/
let quickboard = function () {
  createPlayer('Tim', 2, [items[0],items[0],items[1],items[0],items[0],items[0],items[2]]);
  next();
  initBoard (25,36);
  monster1 = createMonster(1, items[0], { x : 10 , y : 10 });
  monster2 = createMonster(2, items[1], { x : 7 , y : 12 });
  monster3 = createMonster(2, items[1], { x : 8 , y : 12 });
  monster4 = createMonster(2, items[1], { x : 9 , y : 12 });
  monster5 = createMonster(3, items[1], { x : 22 , y : 7 });
  monster6 = createMonster(4, items[1], { x : 8 , y : 19 });
  updateBoard(createItem(items[0], { x : 20 , y : 27 }));
  updateBoard(createItem(items[0], { x : 3 , y: 2 }));
  updateBoard(createItem(items[0], { x : 21 , y : 31 }));
  updateBoard(createItem(items[1], { x : 17 , y : 5 }));
  updateBoard(createItem(items[1], { x : 23 , y : 17 }));
  updateBoard(createItem(items[2], { x : 11 , y : 14 }));
  updateBoard(monster1);
  updateBoard(monster2);
  updateBoard(monster3);
  updateBoard(monster4);
  updateBoard(monster5);
  updateBoard(monster6);
  updateBoard(createTradesman([items[0],items[1],items[0]], {x: 12, y: 12}));
  updateBoard(createTradesman([items[0],items[1],items[2]], {x: 14, y: 23}));
  updateBoard(createDungeon({x: 16, y: 16}, false, false, items[1], 35));
  updateBoard(createDungeon({x: 14, y: 14}, true, true ));
  updateBoard(createDungeon({x: 15, y: 15}, true, false, items[0], 45));
  printBoard();
};

const monsterNames = [
  'Bigfoot',
  'Centaur',
  'Cerberus',
  'Chimera',
  'Ghost',
  'Goblin',
  'Golem',
  'Manticore',
  'Medusa',
  'Minotaur',
  'Ogre',
  'Vampire',
  'Wendigo',
  'Werewolf',
];

const tradeNames = [
  'Bob',
  'Jim',
  'Tom',
  'Bill',
];

const RARITY_LIST = ['Common', 'Unusual', 'Rare', 'Epic'];
const items = [
  {
    name: RARITY_LIST[0] + ' potion',
    type: 'potion',
    value: 5,
    rarity: 0,
    character : "I",
    use: function(){
      let potentialHP = player.hp + 25;
      let maxHP = player.getMaxHp();
      player.hp = Math.min( potentialHP , maxHP );
      print('Used potion! ' + ' + 25 hp (Total HP= ' + player.hp + ')', 'green');
      return;
    }
  },
  {
    name: RARITY_LIST[0] + ' bomb',
    type: 'bomb',
    value: 7,
    rarity: 0,
    character : "I",
    use: function(){
      let monster = board[player.position.x][player.position.y];
      monster.hp = monster.hp - 50;

      print( monster.name + ' bomb hit!' , 'red');
      print('Hp Left: ' + monster.hp , 'red');
      return;
    }
  },
  {
    name: RARITY_LIST[3] + ' key',
    type: 'key',
    value: 150,
    rarity: 3,
    character : "I",
    use: function(){
      let castle = board[player.position.x][player.position.y];
      castle.isLocked = false;
      goDungeon();
      return;
      }
    }
]; 
// Array of item objects. These will be used to clone new items with the appropriate properties.
const GAME_STEPS = ['SETUP_PLAYER', 'SETUP_BOARD', 'GAME_START'];
let gameStep = 0; // The current game step, value is index of the GAME_STEPS array.
let board = []; // The board holds all the game entities. It is a 2D array.
let player = {
};
// The player object

// Utility function to print messages with different colors. Usage: print('hello', 'red');
function print(arg, color) {
  if (typeof arg === 'object') console.log(arg);
  else console.log('%c' + arg, `color: ${color};`);
}

// Prints a blue string with the indicated number of dashes on each side of the string. Usage: printSectionTitle('hi', 1) // -hi-
// We set a default value for the count to be 20 (i.e. 20 dashes '-')
function printSectionTitle(title, count = 20) {
  let header= "-";
  print(header.repeat(count) + title + header.repeat(count), 'blue' + ';font-weight:bold;');
}

// Returns a new object with the same keys and values as the input object
function clone(entity) {
  return Object.assign({}, entity);
}
// returns true or false to indicate whether 2 different objects have the same keys and values
function assertEqual(obj1, obj2) {
  JSON.stringify(obj1) === JSON.stringify(obj2); 
}

// Clones an array of objects
// returns a new array of cloned objects. Useful to clone an array of item objects
function cloneArray(objs) {
   return objs.slice()
}

function search(nameKey, myArray){
  for (let i=0; i < myArray.length; i++) {
      if (myArray[i].type === nameKey) {
        return(i);
      }
    }
}

function searchRarity(nameKey, myArray){
  for (let i=0; i < myArray.length; i++) {
      if (myArray[i].rarity <= nameKey) {
        player.items.push(myArray[i]);
        print('Successfully stole items: ');
        print(myArray[i]);
      }
    }
}

// Uses a player item (note: this consumes the item, need to remove it after use)
// itemName is a string, target is an entity (i.e. monster, tradesman, player, dungeon)
// If target is not specified, item should be used on player for type 'potion'. Else, item should be used on the entity at the same position
// First item of matching type is used
function useItem(itemName, target) {
  let index = search( itemName, player.items);
  player.items[index].use(target);
  for( let i = 0; i < player.items.length; i++){ 
    if ( i === index) {
      player.items.splice(i, 1); 
    }
  }
  return;
}



// Uses a player skill (note: skill is not consumable, it's useable infinitely besides the cooldown wait time)
// skillName is a string. target is an entity (typically monster).
// If target is not specified, skill shoud be used on the entity at the same position
function useSkill(skillName) {
  let index = search( skillName, player.skills);
  if (player.level >= player.skills[index].requiredLevel) {
    if ( player.skills[index].isReadyToCast === true) {
      let index = search( skillName, player.skills);
      function setTrue() {
        player.skills[index].isReadyToCast = true;
      }
      player.skills[index].use();
      setTimeout (setTrue , player.skills[index].cooldown)
      return;
    }
    else {
      print ('Skill in cooldown.');
    }
  }
  else {
    print('Level not high enough to use skill!');
  }
}

// Sets the board variable to a 2D array of rows and columns
// First and last rows are walls
// First and last columns are walls
// All the other entities are grass entities
function createBoard(rows, columns) {
  for (let i=0;i<rows;i++){
    board.push([]);
  }
  for (let i=0;i<rows;i++){
    for (let j = board[i].length; j < columns; j++){
      if ( i === 0 
        || i === rows -1 
        || j === 0 
        || j === columns - 1) {
        let WallEntity= {
          character: '#',
          type: 'Wall',
          position: {
            x: i,
            y: j
          }
        };
        board[i].push(WallEntity);
      } else {
        board[i].push(createGrass(i,j));
      }
    }
  }
  placePlayer();
}
function createGrass(x,y) {
  return {
    character: '.',
    type: 'Grass',
    position: {
      x,
      y,
   }
  }
}

// Updates the board by setting the entity at the entity position
// An entity has a position property, each board cell is an object with an entity property holding a reference to the entity at that position
// When a player is on a board cell, the board cell keeps the current entity property (e.g. monster entity at that position) and may need to have an additional property to know the player is there too.
function updateBoard(entity) {
  board[entity.position.x][entity.position.y] = entity;
}

// Sets the position property of the player object to be in the middle of the board
// You may need to use Math methods such as Math.floor()
function placePlayer() {
  player.position.x = Math.floor(board.length / 2);
  player.position.y = Math.floor(board[0].length / 2);
}  

// Creates the board and places player
function initBoard(rows, columns) {
  if (rows<=2 || columns<=2) {
    print('Need More Space!') }
  else {
    createBoard(rows, columns);
    print('Creating board and placing player...');
  }
}

// Prints the board
function printBoard() {
  for (let i=0;i<board.length;i++) {
    let row = '';
    for (let j = 0; j < board[i].length; j++){
      if (i === player.position.x && j === player.position.y) {
        row += player.character;
      }
      else {
      row += board[i][j].character;
      }
    }
    print(row);
  }
}

function reverseString(str) {
  return str.split("").reverse().join("");
}

// Sets the player variable to a player object based on the specifications of the README file
// The items property will need to be a new array of cloned item objects
// Prints a message showing player name and level (which will be 1 by default)
function createPlayer(name, level = 1, items = []) {
  player.name = name;
  player.level = level;
  player.items = items;
  player.skills = [
    {
      name: 'confuse',
      type: 'confuse',
      requiredLevel: 1,
      cooldown: 10000,
      isReadyToCast : true,
      use: function(){
      if (board[player.position.x][player.position.y].type === 'monster') {
        let monster = board[player.position.x][player.position.y];
        monster.hp = monster.hp - player.level * 25;
        print('Confusing ' + monster.name + '....');
        print('....' + reverseString(monster.name) + ', target is confused and hurts itself in the process', 'red');
        print(reverseString(monster.name) + ' hit!! -25 HP');
        player.skills[0].isReadyToCast = false;
        }
      }
    },
    {
      name: 'steal',
      type: 'steal',
      requiredLevel: 3,
      cooldown: 25000,
      isReadyToCast : true,
      use: function(){
        if (board[player.position.x][player.position.y].type === 'tradesman') {
          let tradesman = board[player.position.x][player.position.y];
          searchRarity (1 , tradesman.items);
          for (let i=0; i < tradesman.items.length; i++) {
            if (tradesman.items[i].rarity <= 1){
              tradesman.items.splice(i, 1);
            }
          }
          player.skills[1].isReadyToCast = false;
        }
      }
    }];
  player.attack = level *10;
  player.speed = 3000 / level;
  player.hp = level * 100;
  player.gold = 0;
  player.getMaxHp = function() {
    return level * 100;
  }
  player.levelUp = function() {
      player.level = player.level + 1;
      player.attack = player.level * 10;
      player.speed = 3000 / player.level;
      player.hp = player.level * 100;
      print('You have leveled up to level ' + player.level)
      player.exp = player.exp - (player.level - 1) * 20;
      return;
  }
  player.getExpToLevel = function() {
    return player.exp - (player.level * 20);
  }
  player.exp = 0;
  player.type = 'player';
  player.character = 'P';
  player.position = {};
  print("Create Player with name " + name + " and level " + level)
}

// Creates a monster object with a random name with the specified level, items and position
// The items property will need to be a new array of cloned item objects
// The entity properties (e.g. hp, attack, speed) must respect the rules defined in the README
function createMonster(level, items, position) {
  let monster = {};
  monster.name = monsterNames[Math.floor(Math.random() * monsterNames.length)];
  monster.level = level;
  monster.hp = level * 100;
  monster.attack = level * 10;
  monster.speed = 6000 / level;
  monster.items = [items];
  monster.position = position;
  monster.type = 'monster';
  monster.character = 'M';
  monster.getMaxHp = function(level) {
    return print(level * 100);
  }
  monster.getExp = function() {
    let expGained = level * 10;
    return expGained;
  }
  return monster;
}

// Creates a tradesman object with the specified items and position. hp is Infinity
// The items property will need to be a new array of cloned item objects
function createTradesman(items, position) {
  let Tradesman = {};
  Tradesman.name = tradeNames[Math.floor(Math.random() * tradeNames.length)];
  Tradesman.hp = Infinity;
  Tradesman.items = items;
  Tradesman.position = position;
  Tradesman.type = 'tradesman';
  Tradesman.character = "T";
  Tradesman.getMaxHp = function() {
    return Infinte; 
  }
  return Tradesman;
}

// Creates an item entity by cloning one of the item objects and adding the position and type properties.
// item is a reference to one of the items in the items variable. It needs to be cloned before being assigned the position and type properties.
function createItem(item, position) {
  newItem = clone(item);
  newItem.position = position;
  return newItem;
}
// Creates a dungeon entity at the specified position
// The other parameters are optional. You can have unlocked dungeons with no princess for loot, or just empty ones that use up a key for nothing.
function createDungeon(position, isLocked = true, hasPrincess = true, items = [], gold = 0) {
  let dungeon = {};
  dungeon.position = position;
  dungeon.isLocked = isLocked;
  dungeon.hasPrincess = hasPrincess;
  dungeon.items = [items];
  dungeon.gold = gold;
  dungeon.type = 'dungeon';
  dungeon.character = 'D';
  return dungeon; 
}

//Battle

function playerAtt (monster) {
  if ( monster.hp > 0 ) {
  monster.hp = monster.hp - player.attack;
  print( monster.name + ' hit' + ' - ' + player.attack , 'red');
  print('Hp Left: ' + monster.hp , 'red');
  return;
  }
  else {
  battleFin();
  print(monster.name + ' defeated!');
  print('CONGRATULATIONS!!! You have recieved ' + monster.getExp() + ' exp points!', 'purple');
  print('You have received the following items!', 'purple')
  print(monster.items);
  }
  player.exp = monster.getExp() + player.exp;
  player.items.push.apply(player.items, monster.items);
  if (player.exp > player.level * 20) {
    player.levelUp();
  }
  monster = createGrass(monster.position.x, monster.position.y);
  updateBoard(monster);
};

function monsterAtt (monster) {
  if ( player.hp > 0 ) {
  player.hp = player.hp - monster.attack;
  print( player.name + ' hit' + ' - ' + monster.attack, 'green');
  print('Hp Left: ' + player.hp , 'green');
  return;
  }
  else {
  battleFin();
  gameOver();
  }
};

//Battle 
//Trade

function trade(tradesman) {
  print('Encountered mysterious trader! You can buy (ItemIdx) and sell (ItemIdx) items $$$');
  print('Items for Sale:');
  print(tradesman.items);
  
};
function buy(index) {
  let tradeGuy = board[player.position.x][player.position.y];
  if (player.gold < tradeGuy.items[index].value ) {
    print('Not enough gold! :( Required: ' + tradeGuy.items[index].value + ' Gold: ' + player.gold)
  }
  else {
    player.gold = player.gold - tradeGuy.items[index].value;
    print('Purchased: ' + tradeGuy.items[index].name);
    print('Gold: ' + player.gold);
    player.items.push(tradeGuy.items[index]);
    for( let i = 0; i < tradeGuy.items.length; i++){ 
      if ( i === index) {
        tradeGuy.items.splice(i, 1); 
        return;
      }
    }
  }
};

function sell(index) {
  let tradeGuy = board[player.position.x][player.position.y];
  player.gold = player.gold + player.items[index].value;
  tradeGuy.items.push(player.items[index]);
  print('Sold ' + player.items[index].name);
  print('Gold: ' + player.gold)
  for( let i = 0; i < player.items.length; i++){ 
    if ( i === index) {
      player.items.splice(i, 1); 
      return;
    }
  }
}

let playerIntID;
let monsterIntID;
function battleFin (){
  clearInterval(playerIntID);
  clearInterval(monsterIntID);
}

function goDungeon() {
  let castle = board[player.position.x][player.position.y];
  if (castle.character === 'D') {
    print('The dungeon is unlocked!!')
    if (castle.hasPrincess === true) {
      print('You have freed the princess!')
      print('The adventurer ' + player.name + ' and the princess lived happily ever after...');
      gameOver();
    }
    else {
      print('Unfortunatley, there was no princess...');
      print('As a consolation prize you found ' + castle.items.length + ' items and ' + castle.gold + "gold!");
      player.items.push.apply(player.items, castle.items);
      player.gold = player.gold + castle.gold;
      castle.gold = 0; 
      castle.items = 0;
      castle = createGrass(castle.position.x, castle.position.y);
      updateBoard(castle);
    }
  }
  return;
};
//MOVE
// Moves the player in the specified direction
// You will need to handle encounters with other entities e.g. fight with monster

function move(direction) {
  switch(direction) {
    case 'U': {
    let entity = board[player.position.x - 1][player.position.y];
    if(player.position.x - 1 === 0){
      return print('You cannot pass!')
    }
    else if (entity.type === 'monster') {
      print('Encountered a ' + entity.name + '!');
      playerIntID = setInterval(() => playerAtt(entity), player.speed) ;
      monsterIntID = setInterval(() =>  monsterAtt(entity), entity.speed );
      player.position.x = player.position.x - 1;
      return;
    }
    else if (entity.type === 'tradesman') {
      trade(entity);
      player.position.x = player.position.x - 1;
      return;
    }
    else if (entity.character === 'I') {
      player.items.push(entity);
      print('Found Item!' + entity.name);
      entity = createGrass(entity.position.x, entity.position.y);
      updateBoard(entity);
      player.position.x = player.position.x - 1;
      return;
    }
    else if (entity.character === 'D') {
      print('Found the Dungeon!')
      if ( entity.isLocked === true ) {
        print('You need the key to open it. If you have a key, try useItem("key") to unlock the door.');
        player.position.x = player.position.x - 1;
        return;
      }
      else {
        player.position.x = player.position.x - 1;
        goDungeon();
        return;
      }
    }
    else {
      player.position.x = player.position.x - 1;
    }
    break;
  }
    case 'D': {
    let entity = board[player.position.x + 1][player.position.y];
    if(player.position.x + 1 === board.length - 1) {
      return print('You cannot pass!')
    }
    else if (entity.type === 'monster') {
      print('Encountered a ' + entity.name + '!');
      playerIntID = setInterval(() => playerAtt(entity), player.speed) ;
      monsterIntID = setInterval(() =>  monsterAtt(entity), entity.speed );
      player.position.x = player.position.x +1;
      return;
    }
    else if (entity.type === 'tradesman') {
      trade(entity);
      player.position.x = player.position.x +1;
      return;
    }
    else if (entity.character === 'I') {
      player.items.push(entity);
      print('Found Item! ' + entity.name);
      entity = createGrass(entity.position.x, entity.position.y);
      updateBoard(entity);
      player.position.x = player.position.x +1;
      return;
    }
    else if (entity.character === 'D') {
      print('Found the Dungeon!')
      if ( entity.isLocked === true ) {
        print('You need the key to open it. If you have a key, try useItem("key") to unlock the door.');
        player.position.x = player.position.x + 1;
        return;
      }
      else {
        player.position.x = player.position.x + 1;
        goDungeon();
        return;
      }
    }
    else {
     player.position.x = player.position.x +1;
    }
    break;
  }
    case 'L': { 
    let entity = board[player.position.x][player.position.y - 1];
    if (player.position.y - 1 === 0) {
      return print('You cannot pass!')
    }
    else if (entity.type === 'monster') {
      print('Encountered a ' + entity.name + '!');
      playerIntID = setInterval(() => playerAtt(entity), player.speed) ;
      monsterIntID = setInterval(() =>  monsterAtt(entity), entity.speed );
      player.position.y = player.position.y-1;
      return;
    }
    else if (entity.type === 'tradesman') {
      trade(entity);
      player.position.y = player.position.y-1;
      return;
    }
    else if (entity.character === 'I') {
      player.items.push(entity);
      print('Found Item! ' + entity.name);
      entity = createGrass(entity.position.x, entity.position.y);
      updateBoard(entity);
      player.position.y = player.position.y-1;
      return;
    }
    else if (entity.character === 'D') {
      print('Found the Dungeon!')
      if ( entity.isLocked === true ) {
        print('You need the key to open it. If you have a key, try useItem("key") to unlock the door.');
        player.position.y = player.position.y - 1;
        return;
      }
      else {
        player.position.y = player.position.y - 1;
        goDungeon();
        return;
      }
    }
    else {
      player.position.y = player.position.y-1;
    }
    break;
  }
    case 'R': {
    let entity = board[player.position.x][player.position.y + 1];
    if (player.position.y + 1 === board[0].length - 1) {
      return print('You cannot pass!')
    }
    else if (entity.type === 'monster') {
      print('Encountered a ' + entity.name + '!');
      playerIntID = setInterval(() => playerAtt(entity), player.speed) ;
      monsterIntID = setInterval(() =>  monsterAtt(entity), entity.speed );
      player.position.y = player.position.y+1;
      return;
    }
    else if (entity.type === 'tradesman') {
      trade(entity);
      player.position.y = player.position.y+1;
      return;
    }
    else if (entity.character === 'I') {
      player.items.push(entity);
      print('Found Item! ' + entity.name);
      entity = createGrass(entity.position.x, entity.position.y);
      updateBoard(entity);
      player.position.y = player.position.y+1;
      return;
    }
    else if (entity.character === 'D') {
      print('Found the Dungeon!')
      if ( entity.isLocked === true ) {
        print('You need the key to open it. If you have a key, try useItem("key") to unlock the door.');
        player.position.y = player.position.y + 1;
        return;
      }
      else {
        player.position.y = player.position.y + 1;
        goDungeon();
        return;
      }
    }
    else {
      player.position.y = player.position.y+1;
    }
    break;
  }
  }
  printBoard();
}

function setupPlayer() {
  printSectionTitle('SETUP PLAYER');
  print("Please create a player using the createPlayer function. Usage: createPlayer('Bob')");
  print(
    "You can optionally pass in a level and items, e.g. createPlayer('Bob', 3, [items[0], items[2]]). items[0] refers to the first item in the items variable"
  );
  print("Once you're done, go to the next step with next()");
}

function setupBoard() {
  printSectionTitle('SETUP BOARD');
  print('Please create a board using initBoard(rows, columns)');
  print(
    'Setup monsters, items and more using createMonster(attr), createItem(item, pos), createTradesman(items, pos), createDungeon(pos), updateBoard(entity)'
  );
  print("Once you're done, go to the next step with next()");
}

function startGame() {
  printSectionTitle('START GAME');
  print('Hello ' + player.name);
  print("You are ready to start your adventure. Use move('U' | 'D' | 'L' | 'R') to get going.");
  printBoard();
}

function gameOver() {
  printSectionTitle('GAME OVER');
}

function next() {
  gameStep++;
  run();
}

function run() {
  switch (GAME_STEPS[gameStep]) {
    case 'SETUP_PLAYER':
      setupPlayer();
      break;
    case 'SETUP_BOARD':
      setupBoard();
      break;
    case 'GAME_START':
      startGame();
      break;
  }
}

print('Welcome to the game!', 'gold');
print('Follow the instructions to setup your game and start playing');

run();
