//if you want to test this out look into the MainPage.html
var canvas;
var h1;
var change;
var x = 5;
var y = 150;
var xDirection = 1;
var xSpeed = 3;
var button;
var input;
var nameP;
var createRepo;

function setup() {
  canvas = createCanvas(displayWidth, displayHeight);
  canvas.position(400,500);
  button = createButton("Change the Text");
  createRepo = createButton("Create Repo Folder");
  button.mousePressed(textChanger);
  input = createInput("Type your name here");
  nameP = createP("Your Name!");
  h1 = createElement('h1', 'Click On the Page to see an Easter Egg');
  h1.position(x,y);
  change = 0;
}

function repoCreater(){
  
}

function textChanger(){
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
  background(200);
  fill(255,0,0);
  rect(100,100,50,50);
  nameP.html(input.value());
  text(input.value(),10,20);
  x = x + xSpeed * xDirection;
  if(x > 400){
    xDirection*=-1;
  }
  if(x < 5){
    xDirection *=-1;
  }
  h1.position(x,y);
  
}