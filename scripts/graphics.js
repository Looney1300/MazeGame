/*
MyGame.graphics is an immediately invoked function with the following sub-functions
  clear()
  Texture(spec)
*/
MyGame.graphics = (function(){
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d');

    function mazeToCanvasCoordinates(maze, coordinate){
        let w;
        maze.width > maze.height ? w = maze.width : w = maze.height;
        return {
            x: (canvas.width/w)*(coordinate.x),
            y: (canvas.height/w)*(coordinate.y)
        }
    }

    function mazeCellWidthUnitsToCanvasUnits(maze, num){
        let w;
        maze.width > maze.height ? w = maze.width : w = maze.height;
        return canvas.width/w * num;
    }

    function mazeCellHeightUnitsToCanvasUnits(maze, num){
        let w;
        maze.width > maze.height ? w = maze.width : w = maze.height;
        return canvas.height/w * num;
    }

    function clear(){
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        //What does this do?
        //context.restore();
    }

    /*
    Texture function passed spec property expects
      spec.imageSrc
      spec.rotation
      spec.center.x
      spec.center.y
      spec.width
      spec.height
     Texture function 'has' the following properties
      .draw
    */
    function Texture(spec){
        let that = {},
            ready = false,
            image = new Image();
        
        image.onload = function(){
            ready = true;
        };
        image.src = spec.imageSrc;
        that.updateRotation = function(angle){
            spec.rotation += angle;
        };

        that.draw = function(spec1){
            if (ready){                
                context.save();
                context.translate(spec1.center.x, spec1.center.y);
                context.rotate(spec1.rotation);
                context.translate(-spec1.center.x, -spec1.center.y);

                context.drawImage(
                    image,
                    spec1.center.x - spec1.width/2,
                    spec1.center.y -spec1.height/2,
                    spec1.width, spec1.height);

                context.restore();   
            }
        };

        return that;
    }

    /*
    Line function is passed a lineList object that has: 
      maxX 
      maxY
      lineList list of {x,y} pairs
     Each pair represents the start and end of a line.
     max x,y are used for calculating the scale on the canvas. 
     It assumes the associated coordinate system is meant to 
     scale the entire canvas, centered on the canvas.
    */
    function Lines(lines){
        let w;
        lines.maxX > lines.maxY ? w = lines.maxX : w = lines.maxY;
        context.beginPath();
        for(let i=0; i < lines.lineList.length; i+=2){
            context.moveTo(lines.lineList[i].x*(canvas.width/w), lines.lineList[i].y*(canvas.height/w));
            context.lineTo(lines.lineList[i+1].x*(canvas.width/w), lines.lineList[i+1].y*(canvas.height/w));
        }
        context.stroke();
        context.closePath();
    }

    //TODO: make a curvy line drawer.
    function Curves(curveList){ }

    /*
    Maze function is passed a maze object with the following:
      width
      height
      cellList
     It uses the Lines to draw the maze with the proper scaling, centered on the canvas.
    */
    function Maze(maze){
        let that = {};
        //Build lineList
        function buildLineList(mazer){
            let lineList = [];
            for (let x = 0; x < mazer.cellList.length; ++x){
                for (let y = 0; y < mazer.cellList[x].length; ++y){
                    if (!mazer.cellList[x][y].top){
                        lineList.push({x: x, y: y});
                        lineList.push({x: x+1, y: y});
                    }
                    if(!maze.cellList[x][y].right){
                        lineList.push({x: x+1, y: y});
                        lineList.push({x: x+1, y: y+1});
                    }
                    if(!maze.cellList[x][y].bottom){
                        lineList.push({x: x, y: y+1});
                        lineList.push({x: x+1, y: y+1});
                    }
                    if(!maze.cellList[x][y].left){
                        lineList.push({x: x, y: y});
                        lineList.push({x: x, y: y+1});
                    }
                }
            }
            //A maze's maxX,Y is the width and height.
            let lines = {
                lineList: lineList,
                maxX: maze.width,
                maxY: maze.height
            };
            return lines;
        }

        that.draw = function(){
            Lines(buildLineList(maze));
        };
        return that;
    }

    function assetToTextureSpec(character, maze){
        let texture = {
            imageSrc: character.src,
            rotation: character.direction*3.14159/2,
            center: mazeToCanvasCoordinates(maze, {x: character.location.x + 0.5, y: character.location.y + 0.5}),
            width: mazeCellWidthUnitsToCanvasUnits(maze, 1),
            height: mazeCellHeightUnitsToCanvasUnits(maze, 1)
        };
        return texture;
    }
    
    function Character(character, maze){
        return Texture(assetToTextureSpec(character, maze));
    }

    function BreadCrumbs(breadCrumbImgSrc, breadCrumbs){
        let crumbsToDraw = [];
        for (let i = 0; i < breadCrumbs.length; ++i){
            let c = {
                src: breadCrumbImgSrc, 
                direction: i%4, 
                location: breadCrumbs[i]
            };
            crumbsToDraw.push(Character(c, maze));
        }
        return crumbsToDraw;
    }

    function ShortestPath(pathImgSrc, shortestPath){
        return BreadCrumbs(pathImgSrc, shortestPath);
    }
    
    return {
        clear: clear,
        Texture: Texture,
        Lines: Lines,
        Maze: Maze,
        Character: Character,
        BreadCrumbs: BreadCrumbs,
        ShortestPath: ShortestPath,
        assetToTextureSpec: assetToTextureSpec
    };

}());