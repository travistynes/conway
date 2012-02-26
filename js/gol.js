// Create the global gol variable.
var gol = {};

/*
Setup properties on the gol object. This is called immediately because
the properties must exist for functions that will run later.
The anonymous function wrapping isn't necessary, but I prefer it.
*/
(function() {
    gol.canvas = document.getElementById("grid"); // The html canvas element.
    gol.c = gol.canvas.getContext("2d"); // The canvas context.
    gol.tickCount = 0; // Game tick counter.
    gol.tickDelay = 100; // Number of milliseconds to wait before next tick runs.

    gol.grid = {}; // Holds any information relating to the game grid.
    gol.grid.squares = []; // Array of arrays, each element being an object holding information relating to an individual square on the grid.
    gol.grid.rowCount = 50; // Number of rows the grid should have.
    gol.grid.colCount = 50; // Number of columns the grid should have.
})();

/*
Called when the window is loaded.
*/
window.onload = function(e) {
    // Setup the game grid.
    gol.grid.setup();

    // Setup the initial grid state.
    gol.grid.setupInitialState();
    
    // Draw the initial grid configuration.
    gol.grid.draw();
    
    // Start game loop.
    window.setTimeout(gol.start, 1000);
};

/*
Perform setup.
*/
gol.grid.setup = function() {    
    // Setup the grid squares.
    for(var i = 0; i < gol.grid.rowCount; i++) {
        gol.grid.squares[i] = [];
        
        for(var j = 0; j < gol.grid.colCount; j++) {
            // Create empty object to represent an individual square which we can attach properties to.
            gol.grid.squares[i][j] = {};
            gol.grid.squares[i][j].isAlive = false;
            gol.grid.squares[i][j].neighbors = []; // Will hold this square's 8 neighbors' positions.
        }
    }
    
    // Compute each grid square's neighbors.
    gol.grid.computeNeighbors();
};

/*
Compute's the eight neighbors of each square on the
grid.
*/
gol.grid.computeNeighbors = function() {
    for(var i = 0; i < gol.grid.rowCount; i++) {        
        for(var j = 0; j < gol.grid.colCount; j++) {
        
            for(var a = 0; a < 8; a++) {
                gol.grid.squares[i][j].neighbors[a] = {};
            }
            
            var n = gol.grid.squares[i][j].neighbors;
            
            n[0].x = i - 1; n[0].y = j - 1;
            n[1].x = i - 1; n[1].y = j;
            n[2].x = i - 1; n[2].y = j + 1;
            n[3].x = i; n[3].y = j - 1;
            n[4].x = i; n[4].y = j + 1;
            n[5].x = i + 1; n[5].y = j - 1;
            n[6].x = i + 1; n[6].y = j;
            n[7].x = i + 1; n[7].y = j + 1;
        }
    }
};

/*
Setup the initial grid configuration.
*/
gol.grid.setupInitialState = function() {
    // Setup initial grid state.
    for(var a = 0; a < 200; a++) {
        var ranX = Math.floor(Math.random() * gol.grid.rowCount);
        var ranY = Math.floor(Math.random() * gol.grid.colCount);
        gol.grid.squares[ranX][ranY].isAlive = true;
    }
};

/*
Starts the game loop.
*/
gol.start = function() {    
    // Run logic.
    gol.logic();
    
    // Draw the grid.
    gol.grid.draw();
    
    // Update tick count.
    document.getElementById("tickCount").innerHTML = "Tick: " + gol.tickCount;
    gol.tickCount++;
    
    // Loop.
    window.setTimeout(gol.start, gol.tickDelay);
};

/*
Run game logic.
*/
gol.logic = function() {
    /*
    Get a copy of the current state of the grid squares.
    Each tick does a pass over the grid squares. This object will allow us to
    build the state of the next grid without disturbing the current "active" grid
    state that we're passing over.
    */
    var gState = JSON.parse(JSON.stringify(gol.grid.squares));
    
    // Loop over the grid.
    for(var i = 0; i < gol.grid.rowCount; i++) {        
        for(var j = 0; j < gol.grid.colCount; j++) {
            var neighbors = gol.grid.squares[i][j].neighbors;
            var liveNeighbors = 0;
            
            for(var a = 0; a < neighbors.length; a++) {
                var n = neighbors[a];
                
                // Don't access outside the bounds of the grid.
                if((n.x >= 0 && n.y >= 0) && (n.x < gol.grid.rowCount && n.y < gol.grid.colCount)) {
                    var square = gol.grid.squares[n.x][n.y];
                    if(square.isAlive) {
                        //console.log(i + ", " + j + " = Neighbor " + n.x + ", " + n.y + " is alive.");
                        liveNeighbors++;
                    } else {
                        //console.log(i + ", " + j + " = Neighbor " + n.x + ", " + n.y + " is dead.");
                    }
                } else {
                    //console.log(i + ", " + j + " = No neighbor at " + n.x + ", " + n.y);
                }
            }
            
            // Apply the rules of the game.
            if(liveNeighbors < 2 || liveNeighbors > 3) {
                gState[i][j].isAlive = false;
            } else if(liveNeighbors == 3) {
                gState[i][j].isAlive = true;
            }
        }
    }
    
    /*
    The next grid state is now set up. All that is left to do is set the
    "active" grid to the new state.
    */
    gol.grid.squares = gState;
};

/*
Draw the game grid.
*/
gol.grid.draw = function() {
    // Clear canvas.
    gol.c.clearRect(0, 0, gol.canvas.width, gol.canvas.height);
    
    // Draw grid squares.
    for(var i = 0; i < gol.grid.rowCount; i++) {        
        for(var j = 0; j < gol.grid.colCount; j++) {
            var w = gol.canvas.width / gol.grid.rowCount;
            var h = gol.canvas.height / gol.grid.colCount;
            var x = i * w;
            var y = j * h;
            
            gol.c.strokeStyle = "#000000";
            gol.c.strokeRect(x, y, w, h);
            
            // If we are alive, draw a colored rect.
            if(gol.grid.squares[i][j].isAlive) {
                gol.c.fillStyle = "#666666";
                gol.c.fillRect(x, y, w, h);
            }
            
            //gol.c.strokeText(i + ", " + j, x + 10, y + 10);
        }
    }
};