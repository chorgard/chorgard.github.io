
function lerp (a, b, n){
    return a + (b-a) * n;
}
function constrain (x, min, max){
    return Math.max(min, Math.min(max, x));
}
function inMatrix (f=function(){}){
    ctx.save();
    if(f){
        f();
    }
    ctx.restore();
}
/**
 * 
 * Takes in a function and surrounds that function with
 * ctx.save(); and ctx.restore();
 * 
 */
