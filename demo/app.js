var cnv = document.getElementById("gameScreen");
var ctx = cnv.getContext("2d");
var inp = document.getElementById("aliasIn");
var cht = document.getElementById("gameChat");
cnv.width=500;
cnv.height=400;
//console.log(innerWidth)
cnv.style.left=innerWidth/2-250+"px";
cnv.style.top=innerHeight/2-200+"px";
inp.style.left=innerWidth/2-100+"px";
inp.style.top=innerHeight/2-10+"px";
cht.style.left=innerWidth/2-250+"px";
cht.style.top=innerHeight/2+202+"px";

function randomFromArray(array){
    return array[Math.floor(Math.random() * array.length)]
}
var keys = {};

document.addEventListener("keydown", (e)=>{
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e)=>{
    keys[e.key.toLowerCase()] = false;
});
var player = {
    x:Math.random()*cnv.width,
    y:Math.random()*cnv.height,
};
var playerId = Math.round(Math.random()*10000000);
var players = {};
var playerArr = [];
var playerF = 0;
var frameCount=0;
var inGame=false;
var player = {
    
        x:cnv.width/2,
        y:cnv.height/2,
        xv:0,
        yv:0,
        canJump:false,
        pcj:false,
    chat:"",
    chatTimer:400,
    hitAnimTimer:20,
    currAnim:"idle",
    animFlipped:false,
    animLoops:{
        run:[0, 1, 2, 3, 4, 5, 6],
        idle:[7],
    },
    animSpeed:0.2,
    move:()=>{
        player.currAnim="idle";
        if(keys.d){
            player.x+=2;
            player.currAnim="run";
            player.animFlipped=false;
        }
        if(keys.a){
            player.x-=2;
            player.currAnim="run";
            player.animFlipped=true;
        }
        if(keys.w){
            player.y-=2;
            player.currAnim="run";
        }
        if(keys.s){
            player.y+=2;
            player.currAnim="run";
        }
    },
    draw:(d)=>{
        ctx.save();
        ctx.translate(d.x+10, d.y);
        if(d.animFlipped){
            ctx.scale(-1, 1);
        }
        ctx.drawImage(playerImage, 0.2, 0.2+((player.animLoops[d.currAnim][Math.round((Math.round(frameCount*player.animSpeed)%player.animLoops[d.currAnim].length))])*60), 59, 59, -10, 0, 20, 20);
        ctx.restore();
    },
};








firebase.auth().signInAnonymously();
setInterval(()=>{
    if(keys.enter&&!inGame){
        cnv.style.display = "block";
        cht.style.display = "block";
        inGame = true;
        player.alias=inp.value;
        inp.style.display = "none";
    }
    if(inGame){
        player.chatTimer++;
        if(keys.enter&&cht.value!=""){
            player.chatTimer=0;
            player.chat=cht.value;
            cht.value="";
        }
        frameCount++;
        var allPlayersRef = firebase.database().ref("player");
    
        allPlayersRef.on("value", (object)=>{
            var p;
            players=object.val()||{};
            playerArr=[];
            playerF=0;
            Object.keys(players).forEach((key)=>{
                
                p = players[key];
                
                playerArr[playerF]=p;
                playerF++;
            });
            
    
        });
        //playerId = players.length;
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        ctx.fillStyle="black";
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        //ctx.fillStyle="red";
        //ctx.fillRect(player.x, player.y, 20, 20);
        var playerRef = firebase.database().ref("player/"+playerId);
        
        playerRef.set({
            alias:player.alias,
            name:playerId,
            x:player.x,
            y:player.y,
            currAnim:player.currAnim,
            animFlipped:player.animFlipped,
            chat:player.chat,
            chatTimer:player.chatTimer,
        });
        player.move();
        playerRef.onDisconnect().remove();
        //console.log(players);
        for(var i = 0; i < playerArr.length; i++){
            var pl = playerArr[i];
            /*
            ctx.fillStyle="white";
            ctx.fillRect(pl.x, pl.y, 20, 20);
            */
            player.draw(pl);
            ctx.fillStyle="white";
            ctx.textAlign="center";
            ctx.fillText(pl.alias, pl.x+10, pl.y-2);
            if(pl.chatTimer<400){
                ctx.fillText(pl.chat, pl.x+10, pl.y-20);
            }

        }
        
    }
    
}, 1000/62);
    

