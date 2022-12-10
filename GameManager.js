//odleglosc miedzy = 315

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
let infoScreen = new SVGNode({selector: "#info_screen"});
let scoreTxtObj = new TextNode({selector: ".scoreTxt"});
let audio = new Audio("media/9-26-17.mp3");

//GameObjects
let blocks = [];
let player = new Player({selector: "#player"});

document.addEventListener("keydown", (event) => {

    if (start && !end) {
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
    }
    else if (!start) {
        if (event.key == " ") {
            startScreen.setAttribute("class", "hidden");
            start = true;
            audio.play();
        }
    }
    else if (end) {
        if (event.key == "r" && event.ctrlKey) {
            document.location.reload();
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

    infoScreen.set("opacity", from-value);

    if(count == 100){
        return;
    }

    setTimeout(animateOpacity, time, to, time, value, count+1);
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
        onUpdate()
        onSpawnUpdate()
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
    else{
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
    }

    setTimeout(onUpdate, 0);
}

async function onSpawnUpdate() {

    if (end) {
        return;
    }

    if (info) {
        info = false;
    }
    else{
        if (animCount == 1) {
            animateInfoOpacity(0, 0.35);
        }
        spawn()
    }

    setTimeout(onSpawnUpdate, spawnTime)
}

async function onMoveUpdate() {

    if (end) {
        return;
    }

    blocks.forEach(element => {
        element.move(speed);
        if (element.y >= 1503){
            element.remove(game_board);
            blocks.splice(blocks.indexOf(element), 1);
            score++;
        }
    });

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

onStart()