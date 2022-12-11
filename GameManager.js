//AUTHOR: Marceli Antosik

//GameSettings
let horrizontal_points = [178, 498, 818];
let blocks_vertical_spawn_point = -70;
let win_score = 9999;
let speed = 10;
let miliseconds = 15;
let spawnTime = 2000;
let player_vertical_pos = 1330;
let score = 0;
let mode = 0; //0-easy, 1-medium, 2-hard, 3-extreme
let end = false;
let start = false;
let info = true;
let pause = false;
let animCount = 0;

//Prefabs
let blockPrefab = new GroupNode({selector: ".moving_block"});
let blockBoxPrefab = new GroupNode({selector: "#rect_destructable_block"});
let blockCirclePrefab = new GroupNode({selector: "#circle_destructable_block"});
let blockTrianglePrefab = new GroupNode({selector: "#polygon_destructable_block"});

let destructableBlockPrefabs = []
destructableBlockPrefabs.push(blockBoxPrefab, blockCirclePrefab, blockTrianglePrefab);

//StartSettings
let game_board = document.getElementById("game_board");
let screen = document.getElementById("screen");
let startScreen = document.getElementById("start_screen");
let overScreen = new SVGNode({selector: "#over_screen"});
let pauseScreen = new SVGNode({selector: "#pause_screen"});
let infoScreen = new SVGNode({selector: "#info_screen"});
let scoreTxtObj = new TextNode({selector: ".scoreTxt"});


//AUDIO
//WEB: https://www.indiegamemusic.com/viewtrack.php?id=5207
//AUTHOR: Tac0zzz1
let audio = new Audio("media/9-26-17.mp3");

//GameObjects
let blocks = [];
let player = new Player({selector: "#player"});

//Time
let currentTime;
let lastTime;
let spawnCounterTime = spawnTime;

document.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState != "visible" && !pause && !end && start){
        onPause();
    }
});

document.addEventListener("keydown", (event) => {

    if (start && !end && !pause) {

        if (event.key == "ArrowRight"){
            player.move("right");
        }
        else if (event.key == "ArrowLeft"){
            player.move("left");
        }
        else if (event.key == "1"){
            player.changeShape(0);
        }
        else if (event.key == "2"){
            player.changeShape(1);
        }
        else if (event.key == "3"){
            player.changeShape(2);
        }
        else if (event.key == "Escape") {
            onPause();
        }
    }
    else if (!start) {
        if (event.key == " ") {
            startScreen.setAttribute("class", "hidden");
            start = true;
            audio.play();
        }
    }
    else if (end) {
        if (event.ctrlKey && event.key == "r") {
            document.location.reload();
        }
    }
    else if(pause){
        if (event.key == "Escape") {
            onPauseEnd();
        }
    }
});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function onStart() {
    scoreTxtObj.textContent = score;

    screen.removeChild(overScreen.getNode());
    screen.removeChild(pauseScreen.getNode());

    const moving_blocks = document.querySelectorAll(".moving_block");

    moving_blocks.forEach((block) => {
        game_board.removeChild(block);
    });

    infoScreen.set("opacity", 0);

    audio.load();
    audio.loop = true;
    audio.volume = 0.1;
    audio.autoplay = true;
    audio.muted = false;

    checkStart();
}

async function animateOpacity(to, time, value, count) {
    let from = infoScreen.get("opacity");

    if (!pause){
        infoScreen.set("opacity", from-value);
    }

    if(count == 100){
        return;
    }

    if (!pause){
        setTimeout(animateOpacity, time, to, time, value, count+1);
    }
    else {
        setTimeout(animateOpacity, time, to, time, value, count);
    }
}

async function animateInfoOpacity(to, time) {
    let steps = 100.0;
    let from = infoScreen.get("opacity");
    animCount += 1;

    animateOpacity(to, (time*1000)/steps, (from-to)/steps, 0);
}

function checkStart() {

    if (start) {
        animateInfoOpacity(1, 0.35);
        currentTime = new Date().getTime();
        lastTime = new Date().getTime();
        onUpdate()
        onMoveUpdate()
        return;
    }

    setTimeout(checkStart, 0);
}

function spawn() {

    let tab = [];

    let pos = [];

    let destructable_blocks = []

    destructableBlockPrefabs.forEach(element => {
        destructable_blocks.push(element);
    });

    horrizontal_points.forEach(point => {
        pos.push(point);
    });

    let destrCounter = Math.floor(-0.33*mode + 2);

    for (let i = 0; i < destrCounter; ++i) {
        
        let prefab = destructable_blocks.splice(getRandomIntInclusive(0,destructable_blocks.length-1), 1)[0];

        let block = new GroupNode({domNode: prefab.duplicateNode()});

        block.setPos(pos.splice(getRandomIntInclusive(0,2-i),1)[0], blocks_vertical_spawn_point);
        
        let gameBlock = new GroupNode({domNode: game_board.appendChild(block.getNode())});
        tab.push(gameBlock);
    }

    for (let i = 0; i < 3-destrCounter; ++i) {
        let block = new GroupNode({domNode: blockPrefab.duplicateNode()})

        block.setPos(pos.splice(getRandomIntInclusive(0,2-destrCounter-i),1)[0], blocks_vertical_spawn_point);

        let gameBlock = new GroupNode({domNode: game_board.appendChild(block.getNode())});
        tab.push(gameBlock);
    }

    let container = new ObjectContainer(tab);
    blocks.push(container);
}

function onCollision() {

    const moving_blocks = document.querySelectorAll(".moving_block");

    moving_blocks.forEach((block) => {

        let obj = new GroupNode({domNode: block});

        if (player.collidesWith(obj)) {
            
            if (player.shape == block.id.split("_")[0]){
                block.setAttribute("class", "hidden");
            }
            else {
                end = true;
                onDead();
            }
        }
    });
}

async function onUpdate(){

    currentTime = new Date().getTime();

    deltaTime = currentTime-lastTime;

    if (!document.hasFocus() && !pause && !end && start){
        onPause();
    }

    scoreTxtObj.textContent = score;

    if (score >= win_score){
        end = true;
        onWin();
    }
    else {
        onCollision();
    }

    if (end) {
        return;
    }
    else if (!pause){
        spawnCounterTime -= deltaTime;
        
        if (score >= 0 && score < 25) {
            mode = 0;
            spawnTime = 3000;
            speed = 10;
            miliseconds = 20;
        }
        else if (score >= 25 && score < 100) {
            mode = 1;
            spawnTime = 1800;
            speed = 15;
            miliseconds = 20;
        }
        else if (score >= 100 && score < 300) {
            mode = 2;
            spawnTime = 1200;
            speed = 20;
            miliseconds = 20;
        }
        else {
            mode = 3;
            spawnTime = 1000;
            speed = 25;
            miliseconds = 20;
        }

        if (spawnCounterTime <= 0) {
            onSpawnUpdate();
            spawnCounterTime = spawnTime;
        }
    }

    lastTime = currentTime;
    setTimeout(onUpdate, 0);
}

function onSpawnUpdate() {

    if (info) {
        info = false;
    }
    else{
        if (animCount == 1) {
            animateInfoOpacity(0, 0.35);
        }

        spawn();
    }
}

async function onMoveUpdate() {

    if (end) {
        return;
    }

    if(!pause) {
        blocks.forEach(element => {
            element.move(speed);
            if (element.y >= 1503){
                element.remove(game_board);
                blocks.splice(blocks.indexOf(element), 1);
                score++;
            }
        });
    }

    setTimeout(onMoveUpdate, miliseconds)
}

function onDead() {
    screen.appendChild(overScreen.duplicateNode());
    let scoreOverTxtObj = new TextNode({selector: "#score_overTxt"});
    let overTxtObj = new TextNode({selector: "#overTxt"});
    overTxtObj.getNode().firstChild.nextSibling.textContent = "OVER";
    overTxtObj.getNode().firstChild.textContent = "GAME";
    scoreOverTxtObj.textContent = `SCORE: ${score}`;
}

function onWin() {
    screen.appendChild(overScreen.duplicateNode());
    let scoreOverTxtObj = new TextNode({selector: "#score_overTxt"});
    let overTxtObj = new TextNode({selector: "#overTxt"});
    overTxtObj.getNode().firstChild.nextSibling.textContent = "WON!";
    overTxtObj.getNode().firstChild.textContent = "YOU";
    scoreOverTxtObj.textContent = `SCORE: ${score}`;
}

function onPause() {
    pause = true;
    screen.appendChild(pauseScreen.duplicateNode());
}

function onPauseEnd() {
    screen.removeChild(document.getElementById("pause_screen"));
    pause = false;
}

onStart()