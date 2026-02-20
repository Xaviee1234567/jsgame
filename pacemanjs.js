//board 
let board;
const rowCount = 21;
const coloumCount = 19;
const tileSize = 32;
const boardWidth = coloumCount*tileSize;
const boardHeight = rowCount*tileSize;
let context;
 
//Image
 
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let paceUpImage;
let paceDownImage;
let paceRightImage;
let paceLeftImage;
let wallImage;
let lives = 3;
let score = 0;
let gameOver= false;
let paused = false; 

const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];
 
const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;
const directions =['U','D','L','R']
 
window.onload= function(){
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
 
    loadImages();
    loadMap();
    // console.log(walls.size);
    // console.log(foods.size);
    // console.log(ghosts.size);
    for(let ghost of ghosts.values()){
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
    update();
   document.addEventListener("keydown",movePacman);
    // Canvas.addEventListener("keyup",movePacman);
    // canvas.addEventListener("keyup",movePacman);
 
}
 
 
//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
 
 
function loadImages(){
    wallImage = new Image();
    wallImage.src = "./wall.png";
 
    blueGhostImage = new Image();
    blueGhostImage.src ="./blueGhost.png";
    
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./orangeGhost.png";
 
    pinkGhostImage = new Image();
    pinkGhostImage.src = "./pinkGhost.png";
 
    redGhostImage = new Image();
    redGhostImage.src = "./redGhost.png";
 
    paceUpImage = new Image();
    paceUpImage.src = "./pacmanUp.png";
 
    paceDownImage = new Image();
    paceDownImage.src = "./pacmanDown.png";
 
    paceRightImage = new Image();
    paceRightImage.src = "./pacmanRight.png";
 
    paceLeftImage = new Image();
    paceLeftImage.src ="./pacmanLeft.png";
 
}
 
function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();
 
    for(let r = 0 ; r<rowCount; r++){
        for(let c = 0 ; c < coloumCount ; c++){
            const row = tileMap[r];  // first row 
            const tileMapChar = row[c];   // currrent character 
 
            const x = c*tileSize;
            const y = r*tileSize;
            //Ghosts: b = blue, o = orange, p = pink, r = red
            //X = wall, O = skip, P = pac man, ' ' = food
            if(tileMapChar == "X"){
                const wall = new Block(wallImage, x,y,tileSize,tileSize);
                walls.add(wall);
            }else if(tileMapChar == "b"){
                const ghost = new Block(blueGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }else if(tileMapChar == "o"){
                const ghost = new Block(orangeGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }else if(tileMapChar == "p"){
                const ghost = new Block(pinkGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }else if(tileMapChar == "r"){
                const ghost = new Block(redGhostImage,x,y,tileSize,tileSize);
                ghosts.add(ghost);
            }else if(tileMapChar == "P"){
                pacman = new Block(paceRightImage,x,y,tileSize,tileSize);
             } else if (tileMapChar == ' ') { //empty is food
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            }
        }
    }
}
 
 
function update(){
    if(gameOver){
        return;
    }
    if(!paused){
    move();
    }
    draw();
    setTimeout(update, 50); // 20 fps 1 = 1000ms/60 ==>> 50 fps
}
 
function draw(){
    context.clearRect(0,0,board.width,board.height);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    for(let ghost of ghosts.values()){
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for (let wall of walls.values()){
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle="white";
    for(let food of foods.values()){
        context.fillRect( food.x, food.y, food.width, food.height);
    }
 
    context.fillStyle ="white";
    context.font="14px sans-serif";
    if(gameOver){
        context.fillText("Game-Over: " +String(score), tileSize/2, tileSize/2);
    }else{
        context.fillText("X" + String(lives)+ " "+String(score), tileSize/2, tileSize/2);   
    }
}
function move(){
   
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;
    for(let wall of walls.values()){
        if (collisuion(pacman, wall)){
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    for(let ghost of ghosts.values()){

        if(collisuion(ghost, pacman)){
            lives -=1;
             if(lives == 0){
                gameOver = true;
                return;
             }
            resetPosition();
        }
        //   for(let ghost of ghosts.values()){
        //     if(collisuion(ghost, ghost)){
        //      ghost.x -= ghost.velocityX;
        //      ghost.y -= ghost.velocityY;
        //      const  newdirection = directions[Math.floor(Math.random()*4)];
        //      ghost.updateDirection(newdirection);
        //     }
        // }
        for(let ghost of ghosts.values()){
        if(ghost.x == 0*9 ){
            ghost.updateDirection('L');
        }else if (ghost.x == 21*9){
            ghost.updateDirection('R');
        }
    }

        if(ghost.y == tileSize*9 && ghost.direction !='U' && ghost.direction !='D'){
            ghost.updateDirection('U');
        }
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        for(let wall of walls.values()){
            if(collisuion(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth){
             ghost.x -= ghost.velocityX;
             ghost.y -= ghost.velocityY;
             const  newdirection = directions[Math.floor(Math.random()*4)];
             ghost.updateDirection(newdirection);
            }
        }
    }
 
    let foodEaten = null;
    for (let food of foods.values()){
        if(collisuion(pacman, food)){
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);
    if(foods.size == 0){
        loadMap();
        resetPosition();

    }
    // for(let ghost of ghosts.values()){
    // if(collisuion(ghost,pacman)){
    //     lives -= 1;
    //     resetPosition();
    // }
    // }
}
 
function movePacman(e){

    if(gameOver){
        loadMap();
        resetPosition();
        lives =3;
        score =0;
        gameOver = false;
        update();
        return;
    }
    console.log("Key detected");
    if(e.code =="ArrowUp" || e.code == "KeyW"){
        pacman.updateDirection('U')
    }else  if(e.code =="ArrowDown" || e.code == "KeyS"){
        pacman.updateDirection('D')
    }else  if(e.code =="ArrowLeft" || e.code == "KeyA"){
        pacman.updateDirection('L')
    }else  if(e.code =="ArrowRight" || e.code == "KeyD"){
        pacman.updateDirection('R')
    }else if (e.code == "Space"){ 
                paused = !paused;

            // if(paused = false){
            // paused = true;
            // }else{
            //     paused = false;
            // }
    
    
           // setTimeout(update, 50);  
            //console.log(ghost.x + ' x and y ' + ghost.y)
    // }else if(e.code == "KeyP"){
    //     //      for(let ghost of ghosts.values()){
    //     //         console.log(ghost.x + ' x and y ' + ghost.y)
    //     //         ghost.x +=ghost.velocityX;
    //     //         ghost.y +=ghost.velocityY;
    //     //    //setTimeout(update, 2000);
    //     // // pausePosition();
    //     // }
    //     pausePosition();
    }
         
        // for(let ghost of ghosts.values()){
        //     console.log(ghost.x + ' x and y ' + ghost.y)
        //    setTimeout(update, 2000);
        // // pausePosition();
        // }
    
 
    if(pacman.direction == 'U'){
        pacman.image =paceUpImage;
    }else if (pacman.direction == 'D'){
        pacman.image =paceDownImage;
    }else if (pacman.direction == 'L'){
        pacman.image =paceLeftImage;
    }else if (pacman.direction == 'R'){
        pacman.image =paceRightImage;
    }
}
 
function collisuion(a, b){
   return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
 
function resetPosition(){
    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;
 
    for(let ghost of ghosts.values()){
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
}
function pausePosition(){
    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;
 
    for(let ghost of ghosts.values()){
        ghost.set();
        // const newDirection = directions[Math.floor(Math.random()*4)];
        // ghost.updateDirection(newDirection);
    }
}

 
class Block{
    constructor(image, x,y, width, height){
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
 
        this.startX= x;
        this.startY = y;
 
        this.direction= 'R';
        this.velocityX= 0;
        this.velocityY= 0;
    }
    reset(){
        this.x = this.startX;
        this.y = this.startY;
    }
    set(){
        this.x = this.velocityX;
        this.y = this.velocityY;
    }   
    
    //  pauseDirection(direction){
    //     const preDirection= this.direction;
    //     this.direction=direction;
    //    this.updateVelocity();
    //     this.x = this.velocityX;
    //     this.y = this.velocityY;
        
        // for (let wall of walls){
        //     if(collisuion(this, wall)){
        //         this.x -=this.velocityX;
        //         this.y -= this.velocityY;
        //         this.direction=preDirection;
        //         this.updateVelocity();
        //     }
        // }
 
    // }

 
    updateDirection(direction){
        const preDirection= this.direction;
        this.direction=direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        for (let wall of walls){
            if(collisuion(this, wall)){
                this.x -=this.velocityX;
                this.y -= this.velocityY;
                this.direction=preDirection;
                this.updateVelocity();
            }
        }
 
    }
 
    updateVelocity(){
        if(this.direction =="U"){
            this.velocityX=0;
            this.velocityY= -tileSize/4;
        }else if (this.direction =="D"){
             this.velocityX=0;
            this.velocityY= tileSize/4;
        }
        else if (this.direction =="L"){
             this.velocityX=-tileSize/4;
            this.velocityY= 0;
        }else if (this.direction =="R"){
             this.velocityX=tileSize/4;
            this.velocityY= 0;
        }
    }
};
