// AUTHOR: Muppetsg2

// Game Settings
const horizontal_points = [178, 498, 818];
const blocks_vertical_spawn_point = -70;
const win_score = 9999;
let speed = 10;
const miliseconds = 20;
let spawnTime = 2000;
const player_vertical_pos = 1330;
let score = 0;
let mode = 0; // 0-easy, 1-medium, 2-hard, 3-extreme
let end = false;
let start = false;
let info = true;
let pause = false;
let animCount = 0;

// Prefabs
const blockPrefab = new GroupNode({ selector: ".moving_block" });
const blockBoxPrefab = new GroupNode({ selector: "#rect_destructable_block" });
const blockCirclePrefab = new GroupNode({ selector: "#circle_destructable_block" });
const blockTrianglePrefab = new GroupNode({ selector: "#polygon_destructable_block" });
const destructableBlockPrefabs = [blockBoxPrefab, blockCirclePrefab, blockTrianglePrefab];

// Start Settings
let game_board = document.getElementById("game_board");
let screen = document.getElementById("screen");
let startScreen = document.getElementById("start_screen");
let overScreen = new SVGNode({ selector: "#over_screen" });
let pauseScreen = new SVGNode({ selector: "#pause_screen" });
let infoScreen = new SVGNode({ selector: "#info_screen" });
let scoreTxtObj = new TextNode({ selector: ".scoreTxt" });


// AUDIO
// WEB: https://www.indiegamemusic.com/viewtrack.php?id=5207
// AUTHOR: Tac0zzz1
const audio = new Audio("media/9-26-17.mp3");

// GameObjects
let blocks = [];
let player = new Player({ selector: "#player" });

// Time
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
		switch (event.key) {
			case "ArrowRight":
                player.move("right");
                break;
            case "ArrowLeft":
                player.move("left");
                break;
            case "1":
                player.changeShape(0);
                break;
            case "2":
                player.changeShape(1);
                break;
            case "3":
                player.changeShape(2);
                break;
            case "Escape":
                onPause();
                break;
        }
    }
    else if (!start && event.key == " ") {
		startScreen.setAttribute("class", "hidden");
		start = true;
		audio.play();
    }
    else if (end && event.ctrlKey && event.key == "r") {
		document.location.reload();
    }
    else if(pause && event.key == "Escape"){
		onPauseEnd();
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

	document.querySelectorAll(".moving_block").forEach(block => {
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
    const from = infoScreen.get("opacity");
    if (!pause) {
        infoScreen.set("opacity", from - value);
    }
	
	if (count === 100) return;
	
	setTimeout(animateOpacity, time, to, time, value, pause ? count : count + 1);
}

async function animateInfoOpacity(to, time) {
    const steps = 100.0;
    const from = infoScreen.get("opacity");
    animCount += 1;
    animateOpacity(to, (time * 1000) / steps, (from - to) / steps, 0);
}

function checkStart() {
    if (start) {
        animateInfoOpacity(1, 0.35);
        currentTime = Date.now();
        lastTime = Date.now();
        onUpdate()
        onMoveUpdate()
        return;
    }
    setTimeout(checkStart, 0);
}

function spawn() {
    let tab = [];
    let pos = [...horizontal_points];
    let destructable_blocks = [...destructableBlockPrefabs]

    let destrCounter = Math.floor(-0.33 * mode + 2);

    for (let i = 0; i < destrCounter; ++i) {
        
        const prefab = destructable_blocks.splice(getRandomIntInclusive(0, destructable_blocks.length - 1), 1)[0];
        let block = new GroupNode({ domNode: prefab.duplicateNode() });
        block.setPos(pos.splice(getRandomIntInclusive(0, 2 - i), 1)[0], blocks_vertical_spawn_point);
        tab.push(new GroupNode({ domNode: game_board.appendChild(block.getNode()) }));
    }

    for (let i = 0; i < 3 - destrCounter; ++i) {
        let block = new GroupNode({ domNode: blockPrefab.duplicateNode() })
        block.setPos(pos.splice(getRandomIntInclusive(0, 2 - destrCounter - i), 1)[0], blocks_vertical_spawn_point);
        tab.push(new GroupNode({ domNode: game_board.appendChild(block.getNode()) }));
    }
	
    blocks.push(new ObjectContainer(tab));
}

function onCollision() {
    document.querySelectorAll(".moving_block").forEach(block => {
        let obj = new GroupNode({ domNode: block });
		
		console.log(player.width);
		console.log(player.height);
		
        if (player.collidesWith(obj) && player.shape == block.id.split("_")[0]) {
                block.setAttribute("class", "hidden");
				console.log("HEJ");
		} 
		else if (player.collidesWith(obj) && player.shape != block.id.split("_")[0]) {
			end = true;
			onDead();
		}
    });
}

async function onUpdate(){
    currentTime = Date.now();
    const deltaTime = currentTime - lastTime;

    if (!document.hasFocus() && !pause && !end && start) {
        onPause();
    }

    scoreTxtObj.textContent = score;
    if (score >= win_score){
        end = true;
        onWin();
		return;
    }
    else {
        onCollision();
		if (end) return;
    }

    if (!end && !pause){
        spawnCounterTime -= deltaTime;
		updateMode();
        if (spawnCounterTime <= 0) {
            onSpawnUpdate();
            spawnCounterTime = spawnTime;
        }
    }

    lastTime = currentTime;
    setTimeout(onUpdate, 0);
}

function updateMode() {
    if (score >= 0 && score < 25) {
        mode = 0;
        spawnTime = 3000;
        speed = 10;
    } else if (score < 100) {
        mode = 1;
        spawnTime = 1800;
        speed = 15;
    } else if (score < 300) {
        mode = 2;
        spawnTime = 1200;
        speed = 20;
    } else {
        mode = 3;
        spawnTime = 1000;
        speed = 25;
    }
}

function onSpawnUpdate() {
    if (info) info = false;
    else {
        if (animCount == 1) {
            animateInfoOpacity(0, 0.35);
        }
        spawn();
    }
}

async function onMoveUpdate() {
    if (end) return;

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
    let scoreOverTxtObj = new TextNode({ selector: "#score_overTxt" });
    let overTxtObj = new TextNode({ selector: "#overTxt" });
    overTxtObj.getNode().firstChild.nextSibling.textContent = "OVER";
    overTxtObj.getNode().firstChild.textContent = "GAME";
    scoreOverTxtObj.textContent = `SCORE: ${score}`;
}

function onWin() {
    screen.appendChild(overScreen.duplicateNode());
    let scoreOverTxtObj = new TextNode({ selector: "#score_overTxt" });
    let overTxtObj = new TextNode({ selector: "#overTxt" });
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

onStart();