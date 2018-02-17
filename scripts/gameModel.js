let highScores = [];
//To create a new game, simply create a new with a new maze with new parameters.
MyGame.gameModel = function(_graphics, _maze, _character, _startGraphic, _endGraphic, _crumbsImgSrc, _pathImgSrc){
    //Generations for every game, independent of parameters.
    let score = 0;
    let gameTime = 0; //In milliseconds
    let breadCrumbs = []; //List of locations
    let shortestPath = [];//List of locations
    let firstShortPathLength = 0;
    // Flags
    let flags = {
        hintMode: false,
        solutionMode: false,
        crumbMode: false,
        mazeSolved: false
    }
    //Conditional on parameters
    let graphics = _graphics;
	let maze = _maze;
	let character = _character;
	let startGraphic = _startGraphic;
	let endGraphic = _endGraphic;
	let crumbsImgSrc = _crumbsImgSrc;
	let pathImgSrc = _pathImgSrc;
    let myMazeGame = graphics.Maze(maze);
    let myCharacter = graphics.Character(character, maze);
    let startSpace = graphics.Character(startGraphic, maze);
    let endSpace = graphics.Character(endGraphic, maze);

    //Compute the shortest path array/stack.
    let cl = {x: 0, y: 0};//current location
    let solutionFound = false;
    (function rFindSolution(cl, directionCameFrom){
        //Move until you're at the end, or there isn't anywhere to go. 
        if (cl.x === maze.width-1 && cl.y === maze.height-1){
            solutionFound = true;
        }
        if (!solutionFound && maze.cellList[cl.x][cl.y].right && directionCameFrom !== 3){
            solutionFound = rFindSolution({x: cl.x+1, y: cl.y}, 1);
        }
        if (!solutionFound && maze.cellList[cl.x][cl.y].bottom && directionCameFrom !== 0){
            solutionFound = rFindSolution({x: cl.x, y: cl.y+1}, 2);
        }
        if (!solutionFound && maze.cellList[cl.x][cl.y].left && directionCameFrom !== 1){
            solutionFound = rFindSolution({x: cl.x-1, y: cl.y}, 3);
        }
        if (!solutionFound && maze.cellList[cl.x][cl.y].top && directionCameFrom !== 2){
            solutionFound = rFindSolution({x: cl.x, y: cl.y-1}, 0);
        }
        //If the solution is found, push current location onto the stack.
        if (solutionFound){
            shortestPath.push({x: cl.x, y: cl.y});
            return true;
        }
    })(cl, 2);
    //Remove character starting location.
    shortestPath.pop();
    firstShortPathLength = shortestPath.length;

    //Finish initializing gameModel contents after having computed breadcrumbs and shortest path.
    let myBreadCrumbs = graphics.BreadCrumbs(crumbsImgSrc, breadCrumbs);
    let myShortestPath = graphics.ShortestPath(pathImgSrc, shortestPath);

    function locationOnShortestPath(location){
        for (let i=0; i < shortestPath.length; ++i){
            if (shortestPath[i].x === location.x && shortestPath[i].y === location.y){
                return true;
            }
        }
        return false;
    }

    function locationInCrumbs(location){
        for (let i=0; i < breadCrumbs.length; ++i){
            if (breadCrumbs[i].x === location.x && breadCrumbs[i].y === location.y){
                return true;
            }
        }
        return false;
    }

    function updateScore(){
        score = 5 * (firstShortPathLength - shortestPath.length) - 2 * breadCrumbs.length;
    }

    function sendToHighScoresList(scoreTime){
        highScores.push(scoreTime);
        highScores.sort(function(a,b){return b.score-a.score;});
    }
    
    function moveCharacter(direction){
        if (!flags.mazeSolved){
            if (maze.canMove(character.location, direction)){
                //Leave crumb at location before moving if not one already there.
                if (!locationInCrumbs(character.location)){
                    breadCrumbs.push({x: character.location.x, y: character.location.y});
                }
                myBreadCrumbs = graphics.BreadCrumbs(crumbsImgSrc, breadCrumbs);
    
                let previousLocation = {x: character.location.x, y: character.location.y};
                if (direction === 0 ){
                    --character.location.y;
                    character.direction = 3;
                }
                else if(direction === 1){
                    ++character.location.x;
                    character.direction = 0;
                }
                else if(direction === 2){
                    ++character.location.y;
                    character.direction = 1;
                }else{
                    --character.location.x;
                    character.direction = 2;
                }
                //If just moved onto the right path, pop off the shortest path, otherwise, add my previous location to the shortest path
                locationOnShortestPath(character.location) ? shortestPath.pop() : shortestPath.push({x: previousLocation.x, y: previousLocation.y});
                myShortestPath = graphics.ShortestPath(pathImgSrc, shortestPath);
                updateScore();
            }
            if (character.location.x === maze.width-1 && character.location.y === maze.height-1){
                sendToHighScoresList({score: score, time: (gameTime/1000).toFixed(2)});
                flags.mazeSolved = true;
            }
        }
    }

    function getScore(){
        return score;
    }

    function getGameTime(){
        return gameTime;
    }

    function updateGameTime(elapsedTime){
        if (!flags.mazeSolved){
            gameTime += elapsedTime;
        }
    }

    function getHighScores(){
        return highScores;
    }

    function drawGame(){
        //Canvas game rendering
        startSpace.draw(graphics.assetToTextureSpec(startGraphic, maze));
        endSpace.draw(graphics.assetToTextureSpec(endGraphic, maze));
        if (flags.crumbMode){
            for (let i=0; i < myBreadCrumbs.length; ++i){
                myBreadCrumbs[i].draw(graphics.assetToTextureSpec({
                    src: crumbsImgSrc, 
                    direction: i%4, 
                    location: {x: breadCrumbs[i].x, y: breadCrumbs[i].y}
                }, maze));
            }
        }
        if (flags.solutionMode){
            for (let i=0; i < myShortestPath.length; ++i){
                myShortestPath[i].draw(graphics.assetToTextureSpec({
                    src: crumbsImgSrc, 
                    direction: 0, 
                    location: {x: shortestPath[i].x, y: shortestPath[i].y}
                }, maze));
            }
        }
        if (flags.hintMode){
            if (myShortestPath.length > 0){
                let i = myShortestPath.length - 1;
                myShortestPath[i].draw(graphics.assetToTextureSpec({
                    src: crumbsImgSrc, 
                    direction: 0, 
                    location: {x: shortestPath[i].x, y: shortestPath[i].y}
                }, maze));
            }
        }
        myMazeGame.draw();
        myCharacter.draw(graphics.assetToTextureSpec(character, maze));
    }

    function toggleCrumbMode(){
        flags.crumbMode = !flags.crumbMode;
    }
    function toggleHintMode(){
        flags.hintMode = !flags.hintMode;
    }
    function toggleSolutionMode(){
        flags.solutionMode = !flags.solutionMode;
    }

    function toggleFlags(crumbMode, hintMode, solutionMode, mazeSolved){
        flags.crumbMode = crumbMode;
        flags.hintMode = hintMode;
        flags.solutionMode = solutionMode;
        flags.mazeSolved = mazeSolved;
    }

    return {
        moveCharacter: moveCharacter,
        getScore: getScore,
        getGameTime: getGameTime,
        updateGameTime: updateGameTime,
        getHighScores: getHighScores,
        drawGame: drawGame,
        toggleFlags: toggleFlags,
        toggleCrumbMode: toggleCrumbMode,
        toggleHintMode: toggleHintMode,
        toggleSolutionMode: toggleSolutionMode
    };

};