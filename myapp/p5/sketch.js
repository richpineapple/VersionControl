var canvas;
var h1;
var change;
var x = 100;
var y = 200;

function setup() {
  canvas = createCanvas(400, 400);
  canvas.position(400,500);
  h1 = createElement('h1', 'Click On the Page to see an Easter Egg');
  //h1.position(400,600);
  change = 0;
}

function mousePressed(){
  if(change == 0){
    h1.html("Hello There");
  }
  if(change == 1){
    h1.html("General Kenobi");
  }
  if(change == 2){
    h1.html("Ah General Grevious");
  }
  change++;
}

function draw() {
  clear();
  background(200);
  fill(255,0,0);
  rect(100,100,50,50);
  h1.position(x,y);
  
}