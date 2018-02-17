
let previousTime = performance.now();

//Load APIs 
let mazeMaker = MyGame.mazeMaker;
let graphics = MyGame.graphics;
let keyboard = MyGame.input.Keyboard();


//On my MyGame object, I'm making a main property that is filled
// with a function that is immediately invoked with the graphics api parameter
// listed immediately after.
//MyGame.main = (function(graphics, mazeMaker){

//-------------------------------------------
//            Default Game Model
//-------------------------------------------
//Generate default maze
let maze = mazeMaker.generateMaze(5, 5);

//Using a character to represent the beginning and end of maze.
let startGraphic = {
    src: 'images/checkerclear.png',
    direction: 1,
    location: { x: 0, y: 0 }
};
let endGraphic = {
    src: 'images/checkerclear.png',
    direction: 0,
    location: { x: maze.width-1, y: maze.height-1 }
};
//crumbs image asset path
let crumbsImgSrc = 'images/bubble1a.png';
//shortest path image asset path
let pathImgSrc = 'images/orangeball.png';

/*
Character's attributes:
    imageSrc
    rotation
    location.x,y
    All in units based on the maze (not canvas units) 
*/
let character = {
    src: 'images/fish.png',
    direction: 0,
    location: { x: 0, y: 0 }
};

//generate the default gameModel
let gameModel = MyGame.gameModel(graphics, maze, character, startGraphic, endGraphic, crumbsImgSrc, pathImgSrc);


//----------------------------------------------
//                  Handlers
//----------------------------------------------


//List of the keypress handlers
function moveCharacterUp(){
    gameModel.moveCharacter(0);
}

function moveCharacterRight(){
    gameModel.moveCharacter(1);
}

function moveCharacterDown(){
    gameModel.moveCharacter(2);
}

function moveCharacterLeft(){
    gameModel.moveCharacter(3);
}

function toggleHintMode(){
    gameModel.toggleHintMode();
}

function toggleSolutionMode(){
    gameModel.toggleSolutionMode();
}

function toggleCrumbMode(){
    gameModel.toggleCrumbMode();
}

function toggleScoreVisibility(){
    // https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
    scoreDiv = document.getElementById('score');
    if (scoreDiv.style.display === "none") {
        scoreDiv.style.display = "block";
    } else {
        scoreDiv.style.display = "none";
    }
}

function toggleKeyBindings(){
    // keyboard.registerKey(KeyEvent['DOM_VK_UP'], moveCharacterUp);
    // keyboard.registerKey(KeyEvent['DOM_VK_RIGHT'], moveCharacterRight);
    // keyboard.registerKey(KeyEvent['DOM_VK_DOWN'], moveCharacterDown);
    // keyboard.registerKey(KeyEvent['DOM_VK_LEFT'], moveCharacterLeft);
    // keyboard.registerKey(KeyEvent['DOM_VK_C'], toggleCrumbMode);
    // keyboard.registerKey(KeyEvent['DOM_VK_H'], toggleHintMode);
    // keyboard.registerKey(KeyEvent['DOM_VK_S'], toggleSolutionMode);
    // keyboard.registerKey(KeyEvent['DOM_VK_V'], toggleScoreVisibility);
}

//---------------------------------------------------------------

//Default key registration to handlers
keyboard.registerKey(KeyEvent['DOM_VK_UP'], moveCharacterUp);
keyboard.registerKey(KeyEvent['DOM_VK_RIGHT'], moveCharacterRight);
keyboard.registerKey(KeyEvent['DOM_VK_DOWN'], moveCharacterDown);
keyboard.registerKey(KeyEvent['DOM_VK_LEFT'], moveCharacterLeft);

keyboard.registerKey(KeyEvent['DOM_VK_W'], moveCharacterUp);
keyboard.registerKey(KeyEvent['DOM_VK_D'], moveCharacterRight);
keyboard.registerKey(KeyEvent['DOM_VK_S'], moveCharacterDown);
keyboard.registerKey(KeyEvent['DOM_VK_A'], moveCharacterLeft);

keyboard.registerKey(KeyEvent['DOM_VK_I'], moveCharacterUp);
keyboard.registerKey(KeyEvent['DOM_VK_L'], moveCharacterRight);
keyboard.registerKey(KeyEvent['DOM_VK_K'], moveCharacterDown);
keyboard.registerKey(KeyEvent['DOM_VK_J'], moveCharacterLeft);

keyboard.registerKey(KeyEvent['DOM_VK_B'], toggleCrumbMode);
keyboard.registerKey(KeyEvent['DOM_VK_H'], toggleHintMode);
keyboard.registerKey(KeyEvent['DOM_VK_P'], toggleSolutionMode);
keyboard.registerKey(KeyEvent['DOM_VK_Y'], toggleScoreVisibility);
// keyboard.registerKey(KeyEvent['DOM_VK_T'], toggleKeyBindings);
// keyboard.registerKey(KeyEvent['DOM_VK_RIGHT'], toggle;
// keyboard.registerKey(KeyEvent['DOM_VK_RIGHT'], toggle;
// keyboard.registerKey(KeyEvent['DOM_VK_RIGHT'], toggle;


//----------------------------------------------
//      Web Page Rendering scripts
//----------------------------------------------


let fpsList = [];
let fpsAccumulator = 0;
function updateFPS(elapsedTime){
    let fps = (1000/elapsedTime);
    fpsList.push(fps);
    fpsAccumulator += fps;
    document.getElementById('fps').innerHTML = 'fps: ' + (fpsAccumulator/fpsList.length).toFixed(3);
    while (fpsList.length > 20){
        fpsAccumulator -= fpsList[0];
        fpsList.splice(0,1);
    }
}

function renderScores(score, highScores){
    document.getElementById('score').innerHTML = 'Score: ' + score;
    let hs = '';
    let numHScores;
    highScores.length < 5 ? numHScores = highScores.length : numHScores = 5;
    for (let i=0; i < numHScores; ++i){
        hs += '<li>' + highScores[i].score + ' pts : ' + highScores[i].time + ' s </li>';
    }
    document.getElementById('highscores').innerHTML = 'High Scores: <ol>' + hs + '</ol>';
}

function renderGameTime(){
    document.getElementById('time').innerHTML = 'Time: ' + (gameModel.getGameTime()/1000).toFixed(2);
}

//Input updates from web-page
let inputAvailable = false;
let inputFromHTML = [];
function makeInputAvailable(sizeObject){
    inputAvailable = true;
    inputFromHTML.push(sizeObject);
}

function generateCustomMaze(){
    let width = Math.floor(Number(document.getElementById('customWidth').value));
    let height = Math.floor(Number(document.getElementById('customHeight').value));
    if (width < 2 || height < 2){
        return mazeMaker.generateMaze(2, 2);
    }
    return mazeMaker.generateMaze(width, height);
}

//-----------------------------------------------------
//
//                  Actual Game Loop
//
//-----------------------------------------------------

function processInput(elapsedTime){
    //keyboard.processInput(elapsedTime);
}

function update(elapsedTime){
    gameModel.updateGameTime(elapsedTime);

    if (inputFromHTML.length){
        if (inputFromHTML[0].custom){
            maze = generateCustomMaze();
        }else{
            maze = mazeMaker.generateMaze(inputFromHTML[0].width, inputFromHTML[0].height);
        }
        inputFromHTML.splice(0, 1);
        character.location = {x: 0, y: 0};
        endGraphic.location = {x: maze.width-1, y: maze.height-1};
        gameModel = MyGame.gameModel(graphics, maze, character, startGraphic, endGraphic, crumbsImgSrc, pathImgSrc);
        gameModel.toggleFlags(false, false, false, false);
    }
}

function render(elapsedTime){
    graphics.clear();

    //Html content rendering
    updateFPS(elapsedTime);
    renderScores(gameModel.getScore(), gameModel.getHighScores());
    renderGameTime(elapsedTime);
    
    //Draw the game
    gameModel.drawGame();
}

function gameLoop(time){
    let elapsedTime = time - previousTime;
    previousTime = time;

    processInput(elapsedTime);
    update(elapsedTime);
    render(elapsedTime);
    requestAnimationFrame(gameLoop);
}

console.log('game initializing...');
requestAnimationFrame(gameLoop);

//}(MyGame.graphics, MyGame.mazeMaker));