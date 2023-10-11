var msg = document.getElementById("message");
var cnv = document.getElementById("gameScreen");
var ctx = cnv.getContext("2d");
var inp = document.getElementById("aliasIn");
var cht = document.getElementById("gameChat");
var ant = document.getElementById("animType");
var bkg = new Image();
bkg.src="background.png";
cnv.width = 500;
cnv.height = 400;
//console.log(innerWidth)
cnv.style.left = innerWidth / 2 - 250 + "px";
cnv.style.top = innerHeight / 2 - 200 + "px";
inp.style.left = innerWidth / 2 - 100 + "px";
inp.style.top = innerHeight / 2 - 10 + "px";
cht.style.left = innerWidth / 2 - 250 + "px";
cht.style.top = innerHeight / 2 + 202 + "px";
ant.style.left = innerWidth / 2 - 50 + "px";
ant.style.top = innerHeight / 4 + "px";

var typesArr = ["norm", "speed", "hover"];

function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)]
}
var keys = {};
var keyTimer = 20;
document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
var player = {
    x: Math.random() * cnv.width,
    y: Math.random() * cnv.height,
};
window.onresize = () => {
    cnv.style.left = innerWidth / 2 - 250 + "px";
    cnv.style.top = innerHeight / 2 - 200 + "px";
    inp.style.left = innerWidth / 2 - 100 + "px";
    inp.style.top = innerHeight / 2 - 10 + "px";
    cht.style.left = innerWidth / 2 - 250 + "px";
    cht.style.top = innerHeight / 2 + 202 + "px";
};
var playerId = Math.round(Math.random() * 10000000);
var players = {};
var playerArr = [];
var playerF = 0;
var frameCount = 0;
var inGame = false;
var playerCoor = [];
var player = {

    x: cnv.width / 2-10,
    y: cnv.height / 2,
    xv: 0,
    yv: 0,
    canJump: false,
    pcj: false,
    moveTimer: 20,
    chat: "",
    chatTimer: 400,
    hitAnimTimer: 20,
    currAnim: "idle",
    animFlipped: false,
    moving: false,
    animStyles: {
        norm: playerImage,
        speed: playerImage2,
        hover: playerImage3,
    },
    currStyle32: "norm",
    animLoops: {
        run: [0, 1, 2, 3, 4, 5, 6],
        idle:[7],
    },
    animSpeed: 0.2,
    move: () => {
        player.currAnim = "idle";
        player.moving = !true;
        if (keys.d) {
            player.x += 20;
            player.currAnim = "run";
            player.animFlipped = false;
            player.moving = true;
        }
        if (keys.a) {
            player.x -= 20;
            player.currAnim = "run";
            player.animFlipped = true;
            player.moving = true;
        }
        if (keys.w) {
            player.y -= 20;
            player.currAnim = "run";
            player.moving = true;
        }
        if (keys.s) {
            player.y += 20;
            player.currAnim = "run";
            player.moving = true;
        }
        player.x=constrain(player.x, 0, 480);
        player.y=constrain(player.y, 0, 380);
    },
    draw: (d, d2) => {

        ctx.save();
        ctx.translate(d2.x + 10, d2.y);
        if (d.animFlipped) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(player.animStyles[d.currStyle32], 0.2, 0.2 + ((player.animLoops[d.currAnim][Math.round((Math.round(frameCount * player.animSpeed) % player.animLoops[d.currAnim].length))]) * 60), 59, 59, -10, 0, 20, 20);
        ctx.restore();
    },
};
var unused = null;
var playerRef = firebase.database().ref("player/" + playerId);
var localData = {};

function resetData() {
    localStorage["miniMono"] = undefined;
    localData = {};
}

function playNew() {
    inGame = true;
}

function playLoad() {
    cnv.style.display = "block";
    cht.style.display = "block";
    msg.style.display = "none";
    inGame = true;
    localData = JSON.parse(localStorage["miniMono"]);
    player.alias = localData.alias;
    ant.selectedIndex = localData.antSelectedIndex;
    player.currStyle32 = localData.currStyle32;
    inp.style.display = "none";
}

function save() {
    player.currStyle32 = typesArr[ant.selectedIndex];
    localData.currStyle32 = player.currStyle32;
    localData.antSelectedIndex = ant.selectedIndex;
    localStorage["miniMono"] = JSON.stringify(localData);
    //console.log("saved");
}

function stopKeyPress() {
    //console.log("called");
    keyTimer = 0;
}

for (var i = 0; i < 20; i++) {
    playerCoor[i] = {
        x: 0,
        y: 0
    };
}
firebase.auth().signInAnonymously();
var timeInGame = 0;
var frameCount = 0;
var moves = 0;
window.onbeforeunload = (e)=>{
    playerRef.remove();
    e.returnValue = '';
};
setInterval(() => {
    frameCount++;
    keyTimer++;
    if (keys.enter && !inGame) {
        cnv.style.display = "block";
        cht.style.display = "block";
        msg.style.display = "none";
        localData.alias = inp.value;
        localData.currStyle32 = "norm";
        localData.antSelectedIndex = 0;
        localStorage["miniMono"] = JSON.stringify(localData);
        inGame = true;
        player.alias = inp.value;
        inp.style.display = "none";
        localData = JSON.parse(localStorage["miniMono"]);
    }


    if (inGame) {
        player.chatTimer++;
        if (keys.enter && cht.value != "") {
            player.chatTimer = 0;
            player.chat = cht.value;
            cht.value = "";
        }
        frameCount++;
        var allPlayersRef = firebase.database().ref("player");
        //var pPlayerArr = playerArr;
        allPlayersRef.on("value", (object) => {
            var p;
            players = object.val() || {};
            playerArr = [];
            playerF = 0;
            timeInGame++;
            //console.log(timeInGame);
            Object.keys(players).forEach((key) => {

                p = players[key];

                playerArr[playerF] = p;
                if (moves==1) {
                    //console.log("setup complete");
                    player.moving = true;
                    playerCoor[playerF].x = playerArr[playerF].x;
                    playerCoor[playerF].y = playerArr[playerF].y;
                    moves++;
                }
                playerF++;
            });


        });

        //playerId = players.length;
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.drawImage(bkg, 0, 0, cnv.width, cnv.height);
        //ctx.fillStyle="red";
        //ctx.fillRect(player.x, player.y, 20, 20);
        player.moveTimer++;
        if (player.moveTimer > 20) {
            playerRef = firebase.database().ref("player/" + playerId);
            //console.log(playerRef);
            if (keyTimer > 40) {
                player.move();
            }
            if (player.moving||player.chatTimer<3||moves==0) {
                //console.log("player data sent");
                player.moveTimer = 0;
                moves++;
                playerRef.set({
                    alias: player.alias,
                    name: playerId,
                    x: player.x,
                    y: player.y,
                    currAnim: player.currAnim,
                    animFlipped: player.animFlipped,
                    chat: player.chat,
                    chatTimer: player.chatTimer,
                    currStyle32: player.currStyle32,
                });
            }

            
            
        }


        

        //console.log(players);
        for (var i = 0; i < playerArr.length; i++) {
            var pl = playerArr[i];
            var pl2 = playerCoor[i];
            /*
            ctx.fillStyle="white";
            ctx.fillRect(pl.x, pl.y, 20, 20);
            */
            var a = "idle";
            //console.log(player.animLoops["idle"]);
            
            if (Math.hypot(pl.x - pl2.x, pl.y - pl2.y) > 3) {
                var s = 1;
                if(pl.x>pl2.x){
                    pl2.x+=s;
                }
                if(pl.x<pl2.x){
                    pl2.x-=s;
                }
                if(pl.y>pl2.y){
                    pl2.y+=s;
                }
                if(pl.y<pl2.y){
                    pl2.y-=s;
                }
                //pl2.x += Math.cos(Math.atan2(pl.y - pl2.y, pl.x - pl2.x)) * s;
                //pl2.y += Math.sin(Math.atan2(pl.y - pl2.y, pl.x - pl2.x)) * s;
                
                a="run";
            }else{
                pl2.x=Math.floor((pl2.x+10)/20)*20;
                pl2.y=Math.floor((pl2.y+10)/20)*20;
            }
            pl.currAnim=a;
            ctx.fillStyle = "rgb(100, 100, 100)";
            ctx.fillRect(pl.x, pl.y, 20, 20);
            ctx.textAlign = "center";
            player.draw(pl, pl2);
            ctx.fillStyle = "white";
            ctx.fillText(pl.alias, pl2.x + 10, pl2.y - 2);

            if (pl.chatTimer < 400) {
                var o = 3;
                ctx.drawImage(textEndImage, pl2.x + 10 + pl.chat.length * o, pl2.y - 30, 12, 12);
                ctx.save();
                ctx.translate(pl2.x + 10 - pl.chat.length * o, pl2.y - 30);
                ctx.scale(-1, 1);
                ctx.drawImage(textEndImage, 0, 0, 12, 12);
                ctx.restore();
                ctx.fillRect(pl2.x + 10 - pl.chat.length * o, pl2.y - 30, pl.chat.length * o * 2, 12);
                ctx.fillStyle = "black";
                ctx.fillText(pl.chat, pl2.x + 10, pl2.y - 20);
            }

        }

    }

}, 1000 / 62);
