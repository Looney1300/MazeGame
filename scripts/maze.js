MyGame.mazeMaker = (function mz(){
    /*
    This function expects the width and height 
     in units of maze cells. 
     It returns an object with the following:
      width
      height 
      list of cells with connectivity properties
    */
    function generateMaze(width, height){
        //False means walls, true means a path is present in that direction
        function makeCellList(){
            function makeFullCell(){
                cell = {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false
                }
                return cell;
            }
            let cellList = [];
            for(let x=0; x < width; ++x){
                let cellListCol = [];
                for(let y=0; y < height; ++y){
                    cellListCol.push(makeFullCell());
                }
                cellList.push(cellListCol);
            }
            return cellList;
        }

        //Builds a maze by selecting a random cell and removing walls from a 
        //neighboring cell until it until it hits a boundary or a wall that
        //cell that has already had a wall removed.
        function removeWalls(cellList){

            //Helper to remove walls: cellList and x, y, of cell and 
            //which wall of that cell, top:0,right:1,bottom:2,left:3.
            //Returns true if could remove wall, false otherwise.
            function cellWallRemover(cellList, x, y, wall){
                if (wall === 0 && (y-1) >= 0 && !cellsFinished[x][y-1]){
                    cellList[x][y].top = true;
                    cellList[x][y-1].bottom = true;
                    return true;
                }
                else if(wall === 1 && (x+1) < width && !cellsFinished[x+1][y]){
                    cellList[x][y].right = true;
                    cellList[x+1][y].left = true;
                    return true;
                }
                else if(wall === 2 && (y+1) < height && !cellsFinished[x][y+1]){
                    cellList[x][y].bottom = true;
                    cellList[x][y+1].top = true;
                    return true;
                }
                else if(wall === 3 && (x-1) >= 0 && !cellsFinished[x-1][y]){
                    cellList[x][y].left = true;
                    cellList[x-1][y].right = true;
                    return true;
                }
                return false;
            }
            //Build cellsfinished matrix
            let cellsFinished = [];
            for(let x=0; x < width; ++x){
                let cellListCol = [];
                for(let y=0; y < height; ++y){
                    cellListCol.push(false);
                }
                cellsFinished.push(cellListCol);
            }

            //Start in a random location and add that to a list of visited cells.
            let x = Math.floor(1000000 * Math.random()) % (width);
            let y = Math.floor(1000000 * Math.random()) % (height);
            let cellsVisited = [{x: x, y: y}];
            cellsFinished[x][y] = true;
            //Keep removing walls in the maze until every cell is visited
            while (cellsVisited.length < width*height ){
                //pick a tile from list of visited cells.
                rl = Math.floor(1000000*Math.random()) % cellsVisited.length;
                rnum = Math.floor(1000*Math.random() % 4);
                x = cellsVisited[rl].x;
                y = cellsVisited[rl].y;
                
                //keep on the same path until you run into a visited cell
                do {
                    //Knock out a wall and move to an unfinished neighbor
                    if (rnum === 0 && !cellList[x][y].top){
                        if (cellWallRemover(cellList, x, y, 0)){
                            cellsFinished[x][y] = true;
                            --y;
                            cellsVisited.push({x: x, y: y});
                            cellsFinished[x][y] = true;
                        }
                    }
                    else if (rnum === 1 && !cellList[x][y].right){
                        if (cellWallRemover(cellList, x, y, 1)){
                            ++x;
                            cellsVisited.push({x: x, y: y});
                            cellsFinished[x][y] = true;
                        }
                    }
                    else if (rnum === 2 && !cellList[x][y].bottom){
                        if (cellWallRemover(cellList, x, y, 2)){
                            ++y;
                            cellsVisited.push({x: x, y: y});
                            cellsFinished[x][y] = true;
                        }
                    }
                    else if (rnum === 3 && !cellList[x][y].left){
                        if (cellWallRemover(cellList, x, y, 3)){
                            --x;
                            cellsVisited.push({x: x, y: y});
                            cellsFinished[x][y] = true;
                        }
                    }

                } while (!cellsFinished[x][y]);

            }
        }

        myCellList = makeCellList();
        removeWalls(myCellList);

        function canMove(location, direction){ 
            if (direction === 1 && myCellList[location.x][location.y].right){
                return true;
            }
            else if (direction === 2 && myCellList[location.x][location.y].bottom){
                return true;
            }
            else if (direction === 3 && myCellList[location.x][location.y].left){
                return true;
            }
            else if (direction === 0 && myCellList[location.x][location.y].top){
                return true;
            }
            return false;
        }
            
        let maze = {
            width: width,
            height: height,
            cellList: myCellList,
            canMove: canMove
        };
        return maze;
    }


    return {
        generateMaze: generateMaze
    };

}()); 
