/**
 * Simple Graphic Editor
 *
 * @Author Oleh Yaroshchuk 
 */

/**
 * Global variables
*/

var canvas = document.getElementById('canvas');
var ctx = document.getElementById('canvas').getContext('2d');

var video = document.getElementById('remoteVideo');
var source = document.createElement('source');

source.setAttribute('src', 'https://www.w3schools.com/html/mov_bbb.mp4');

video.appendChild(source);
video.play();
 ctx.drawImage(video,0,0,canvas.width,canvas.height);

var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var ctxShadow = document.getElementById('canvas-shadow').getContext('2d');


var mouseX, //mouse X position
    mouseY; //mouse Y position
var startX, 
    startY;
var paint = false;
var drawType; 
var lineLong;
var savedImages = [];
var removedImages = [];
var lineWidthBefore;


var chooseNotDraw = document.getElementById('not-draw');
var chooseCircle = document.getElementsByClassName('circle');
var chooseTriangle = document.getElementsByClassName('triangle');
var chooseRectangle = document.getElementsByClassName('rectangle');
var chooseRegularPolygon = document.getElementsByClassName('regular-polygon');
var regularPolygonNumberOfAngles = document.getElementById('number-of-angles');
var chooseLine = document.getElementsByClassName('line');
var chooseCurvedLine = document.getElementsByClassName('curved');
var colorButton = document.getElementById('color-button');
var eraser = document.getElementById('eraser');
var sprayButton = document.getElementById('spray');
var clearButton = document.getElementById('clear-button');
var undoButton = document.getElementById('undo-button');
var redoButton = document.getElementById('redo-button');
var save = document.getElementById('save');
var colorBefore;
var numberOfSides;

const DENSITY = 50; //densuty of spray tool
var timeout;

var wheel = {
    "borderWidth": 2,
    "color": 'rgb(68, 255, 158)',
    "height": 320,
    "markerRadius": 5,
    "padding": 2,
    "sliderMargin": 24,
    "width": 320
};

var colorWheel = iro.ColorWheel('#colorWheel', wheel);
var colorWheelElement = document.getElementById('colorWheel');

var cml = document.getElementById('context-menu-lines');
var linesMenu = document.getElementById('lines-menu');
var cmrf = document.getElementById('context-menu-right-figures');
var rightFiguresMenu = document.getElementById('right-figures-menu');
var rfItems = document.getElementById('right-figures-items');
var lItems = document.getElementById('lines-items');

/**
 * Classes
*/

class Rectangle{
  choose(){
    drawType = 'Rectangle';
  }

  move(){
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    this.draw(ctxShadow);
  }

  up(){
    this.draw(ctx);
  }

  draw(context){
    context.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
  }
}

class Line{
  static choose(){
    backDrawProperties();
    mainShadow.style.visibility = 'visible'; 
    drawType = 'Line';
    startX = startY = undefined;
  }

  static move(){
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    paint = true;
    ctxShadow.beginPath();
      ctxShadow.moveTo(startX, startY);
      ctxShadow.lineTo(mouseX, mouseY);
    ctxShadow.stroke();
  }
}

class Curved{
  static choose(){
    mainShadow.style.visibility = 'hidden';
    drawType = 'Curved';
    startX = startY = undefined;
  }

  static draw(){
    ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(mouseX, mouseY);
    ctx.closePath();
    ctx.stroke(); 
    startX = mouseX;
    startY = mouseY;
  }

  static up(){
    startX = startY = undefined;
  }
}

class Triangle{
  choose(){
    drawType = 'Triangle';
  }

  move(){
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    lineLength();
    this.draw(ctxShadow);
  }

  up(){
    lineLength();
    this.draw(ctx);
  }

  draw(context){
    context.beginPath();
      context.moveTo(startX, startY - lineLong);
      context.lineTo(startX - lineLong, startY + lineLong);
      context.lineTo(startX + lineLong, startY + lineLong);
      context.lineTo(startX, startY - lineLong);
    context.closePath();
    context.stroke();
  }
}

class Circle{
  choose(){
    drawType = 'Circle';
  }

  move(){
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    lineLength();
    this.draw(ctxShadow);
  }

  up(){
    lineLength();
    this.draw(ctx);
  }

  draw(context){
    context.beginPath();
      context.arc(startX, startY, lineLong, 0, 2 * Math.PI, false);
    context.stroke();
  }
}

class RegularPolygon{
  choose(){
    if (regularPolygonNumberOfAngles.style.display != 'block') {
      regularPolygonNumberOfAngles.style.display = 'block';
    }
    drawType = 'regularPolygon';
  }

  move(){
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    numberOfSides = regularPolygonNumberOfAngles.value;

    lineLength();
    this.draw(ctxShadow);
  }

  up(){
    lineLength();
    this.draw(ctx);
  }

  draw(context){
    context.beginPath();
      context.moveTo(startX + (lineLong * Math.cos(0)), startY + (lineLong * Math.sin(0)));          
      for (let i = 1; i <= numberOfSides; i++) {
        context.lineTo(startX + (lineLong * Math.cos(i * 2 * Math.PI / numberOfSides)), startY + (lineLong * Math.sin(i * 2 * Math.PI / numberOfSides)));
      }
    context.stroke();
  }
}

class Spray{
  static choose(){
    mainShadow.style.visibility = 'hidden';
    drawType = 'Spray';
  }

  down(){
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.moveTo(mouseX, mouseY);
    let that = this;
    timeout = setTimeout(() => {
      that.draw();
    }, 50);
  }

  draw(){
    for (var i = DENSITY; i--;) {
      let angle = getRandomFloat(0, Math.PI*2);
      let radius = getRandomFloat(0, ctx.lineWidth);
      ctx.fillRect(mouseX + (radius * Math.cos(angle)), mouseY + (radius * Math.sin(angle)), 1, 1);
    }
    if (!timeout) return;
    let that = this;
    timeout = setTimeout(() => {
      that.draw();
    }, 50);
  }
}

var triangle = new Triangle();
var regularPolygon = new RegularPolygon();
var circle = new Circle();
var rectangle = new Rectangle();
var spray = new Spray();

/**
 * Functions
*/

function lineLength(){
  lineLong = Math.sqrt(Math.pow(startX - mouseX, 2) + Math.pow(startY - mouseY, 2))/2;
}

function eraserCanvas(){
  saveDrawProperties();
  ctx.strokeStyle = 'white';
  drawType = 'Curved';
}

function saveCanvas(){
  let link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = 'Your_masterpiece.png';
  let event = new MouseEvent('click');//create event
  link.dispatchEvent(event);// open a save as dialog in FF
}

function drawCloseFigureDown() {
  startX = mouseX;
  startY = mouseY;
  paint = true;
}

function mousePos(e){
  var rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;//mouse position
  mouseY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  return(mouseX, mouseY);
}

function onColorChange(color) {
  ctx.strokeStyle = color.hexString;
  ctx.fillStyle = color.hexString; 
  saveDrawProperties();
}

function saveDrawProperties(){
  lineWidthBefore = ctx.lineWidth;
  colorBefore = ctx.strokeStyle;
}

function backDrawProperties(){
  ctx.strokeStyle = colorBefore;
  ctx.lineJoin = 'round';
  ctx.lineWidth = lineWidthBefore;
}

function onUndoCanvas (){  
  //save the current canvas in redo array
  removeImage();
  canvas.width = canvas.width;
  //create an image object and paint 
  var imageObj = document.createElement('img');
  imageObj.onload = function(){
    ctx.drawImage(imageObj, 0, 0);
  };
  //get from array the source for the image object 
  imageObj.src = savedImages.pop();
  //if the stack is empty then disable the undo button
  if (savedImages.length === 0) {
    undoButton.setAttribute('disabled', 'disabled');
  }
  startX = startY = undefined;
}

function onRedoCanvas(){
  //save the current canvas in undo array
  saveImage();
  //clear the canvas
  canvas.width = canvas.width;
  //create an image object and paint 
  var imageObj = document.createElement('img');
  imageObj.onload = function(){
    ctx.drawImage(imageObj, 0, 0);
  };
  //get from array the source for the image object 
  imageObj.src = removedImages.pop();
  //if the stack is empty then disable the redo button
  if (removedImages.length === 0) {
    redoButton.setAttribute('disabled', 'disabled');
  }
  startX = startY = undefined;
}

function removeImage(){
  //save the canvas image to redo array
  var imgSrc = canvas.toDataURL('image/png');
  removedImages.push(imgSrc);
  redoButton.removeAttribute('disabled');    
}

function saveImage(){
  //save the canvas image to undo array 
  if (drawType !==''){
    var imgSrc = canvas.toDataURL('image/png');
    savedImages.push(imgSrc);
    undoButton.removeAttribute('disabled');    
  }
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min)) + min;
}

function hideContextMenu(el){
  el.style.opacity = '0';
  setTimeout(() => {
    el.style.display = 'none';  
  }, 500);
}

function showContextMenu(e, el){
  el.style.left = e.pageX;
  el.style.top = e.pageY;
  el.style.opacity = '1';
  el.style.display = 'block';
}

function onContextMenuChoose(item, menu){
  for (const itemButton of item.children) {
    itemButton.addEventListener('click', () => {
      menu.children[0].innerHTML = itemButton.innerText;//change text at button

      if (itemButton.className != 'regular-polygon') {
        itemButton.style.display = 'none';//hide choose drawing type
      } else {
        regularPolygon.choose();//show input field
      }
      /*Do visible previous menu item*/
      for (const childItem of item.children) {
        if (menu.className == childItem.className){
          childItem.style.display = 'block';  
        }
      }
              
      menu.className = '';//clear class list
      menu.classList.add(itemButton.className);//add new class 
      menu.click();//simulate click
    });
  }
}
  
/**
 * Event Listeners
*/

colorWheel.on('color:change', onColorChange);

document.addEventListener('DOMContentLoaded', () => {
  ctx.strokeStyle = colorWheel.color.hexString;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  saveDrawProperties();

  for (let choosen of chooseRectangle) {
    choosen.addEventListener('click', rectangle.choose());
  }

  for (let choosen of chooseLine) {
    choosen.addEventListener('click', Line.choose());
  }

  for (let choosen of chooseCurvedLine) {
    choosen.addEventListener('click', Curved.choose());
  }

  for (let choosen of chooseTriangle) {
    choosen.addEventListener('click', triangle.choose());
  }

  for (let choosen of chooseCircle) {
    choosen.addEventListener('click', circle.choose());
  }

  for (let choosen of chooseRegularPolygon) {
    choosen.addEventListener('click', regularPolygon.choose());
  }

  rfItems.children[0].style.display = 'none';
  lItems.children[0].style.display = 'none';

  rightFiguresMenu.classList.add('circle');
  linesMenu.classList.add('curved');

  onContextMenuChoose(rfItems, rightFiguresMenu);
  onContextMenuChoose(lItems, linesMenu);

  //disable Undo/Redo buttons
  undoButton.setAttribute('disabled', 'disabled');
  redoButton.setAttribute('disabled', 'disabled');
});

/*Canvas Events*/
canvas.onmousedown = function(e){
  paint = true;
  mousePos(e);
  switch (drawType){
    case 'Curved':
      Curved.draw();
      break;
    case 'Spray':
      spray.down();
      break;
  }
  saveImage();
};

canvas.onmousemove = function(e){
  if (paint){
    mousePos(e);
    switch (drawType){
      case 'Curved':
        Curved.draw();
        break;
    }
  }
};

canvas.onmouseup = function(){
  paint = false;
  switch (drawType){
    case 'Spray':
      clearTimeout(timeout);
      break;
    case 'Curved':
      Curved.up();
      break;
  }
};

/*stop draw when mouse leave canvas*/
canvas.onmouseleave = function(){
  paint = false;
  switch (drawType){
    case 'Spray':
      clearTimeout(timeout);
      break;
  }
};

/*CanvasShadow Events*/
canvasShadow.ondblclick = function(){
  paint = false;
  startX = startY = undefined;
  ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
};

canvasShadow.onmousedown = function(e){
  mousePos(e);
  switch (drawType){
    case 'Triangle':
      drawCloseFigureDown();
      break;
    case 'Rectangle':
      drawCloseFigureDown();
      break;
    case 'Circle':
      drawCloseFigureDown();
      break;
    case 'regularPolygon':
      drawCloseFigureDown();
      break;
    case 'Line':
      Curved.draw();
      break;
  }
  saveImage();
};

canvasShadow.onmousemove = function (e){
  mousePos(e);
  // if we're not dragging, just return
  if (!paint && drawType != 'Line') {
    return;
  }
  switch (drawType){
    case 'Triangle':
      triangle.move();
      break;
    case 'Rectangle':
      rectangle.move();
      break;
    case 'Circle':
      circle.move();
      break;
    case 'Line':
      Line.move();
      break;
    case 'regularPolygon':
      regularPolygon.move();
      break;
  }
};

canvasShadow.onmouseup = function(){
  switch (drawType){
    case 'Triangle':
      triangle.up();
      break; 
    case 'Rectangle':
      rectangle.up();
      break;
    case 'Circle':
      circle.up();
      break;
    case 'regularPolygon':
      regularPolygon.up();
      break;
  }
  paint = false;
};

canvasShadow.onmouseleave = function(){
  paint = false;
};

window.onkeydown = function(e){
  var code = e.keyCode;
  if ((code === 8) || (code === 90 && e.ctrlKey)){ //Undo event on Backspace press ot Ctrl+Z
    if (savedImages.length > 0) {
      onUndoCanvas();
    } else if (savedImages.length == 0) {
      ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } 
    backDrawProperties();
  } else if (code === 89 && e.ctrlKey){ //Redo event on Ctrl+Y press
    if (removedImages.length > 0){
      onRedoCanvas();
      backDrawProperties();
    }
  }
};

chooseNotDraw.onclick = function(){
  mainShadow.style.visibility = 'visible';
  drawType = undefined;
  paint = false;
  startX = startY = undefined;
};

clearButton.onclick = function(){
  ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //clear arrays
  CPQ.splice(0, CPQ.length);
  QuadraticSFP.splice(0, QuadraticSFP.length);
  //clear index
  j = 0;
  startX = startY = undefined;
};

colorButton.onclick = function(){
  colorWheelElement.classList.toggle('colorWheelOpen');
  colorWheelElement.classList.toggle('colorWheelClose');
};

undoButton.onclick = () => {
onUndoCanvas();
};

redoButton.onclick = () => {
onRedoCanvas();
};

eraser.onclick = function(){
  mainShadow.style.visibility = 'hidden';
  eraserCanvas();
};

sprayButton.onclick = function(){
  Spray.choose();
};

save.onclick = () => saveCanvas();

rightFiguresMenu.onclick = function(){
  mainShadow.style.visibility = 'visible';
  backDrawProperties();
  switch(rightFiguresMenu.className){
    case 'circle':
      circle.choose();
      break;
    case 'rectangle':
      rectangle.choose();
      break;
    case 'triangle':
      triangle.choose();
      break;
    case 'regular-polygon':
      regularPolygon.choose();
      break;
  }
};

linesMenu.onclick = function(){
  switch(linesMenu.className){
    case 'curved':
      Curved.choose();
      break;
    case 'line':
      Line.choose();
      break;
    case 'quadratic':
      Quadratic.choose();
      break;
    case 'bezier':
      Bezier.choose();
      break;    
  }
};

linesMenu.oncontextmenu = function(e){
  e.preventDefault();
  showContextMenu(e, cml);
};

rightFiguresMenu.oncontextmenu = function(e){
  e.preventDefault();
  showContextMenu(e, cmrf);
};

cml.onclick = () => hideContextMenu(cml);

cmrf.onclick = function(){
  if (rightFiguresMenu.className != 'regular-polygon') {
    hideContextMenu(this);
  }
};

cml.onmouseleave = () => hideContextMenu(cml);

cmrf.onmouseleave = () => hideContextMenu(cmrf);

/**
 *
*/

////////Used with some changes///////////// http://jsbin.com/dulifezi/2/edit 
function rangeSlider(onDrag) {
  var range = document.getElementById('range-slider'),
    [dragger] = [range.children[0]],
    draggerWidth = 10, // width of your dragger
    down = false,
    rangeWidth, rangeLeft;


  dragger.style.width = `${draggerWidth}px`;
  dragger.style.left = `${-draggerWidth}px`;
  dragger.style.marginLeft = `${draggerWidth / 2}px`;

  range.addEventListener('mousedown', (e) => {
    rangeWidth = range.offsetWidth;
    rangeLeft = range.offsetLeft;
    down = true;
    updateDragger(e);
    return false;
  });

  document.addEventListener('mousemove', (e) => {
    updateDragger(e);
  });

  document.addEventListener('mouseup', () => {
    down = false;
  });

  function updateDragger(e){
    if (down && e.pageX >= rangeLeft && e.pageX <= (rangeLeft + rangeWidth)) {
      dragger.style.left = `${e.pageX - rangeLeft - draggerWidth}px`;
      if (typeof onDrag == 'function') onDrag(Math.round(((e.pageX - rangeLeft) / rangeWidth) * 100));
    }
  }
}

rangeSlider((value) => {
  ctx.lineWidth = value;
  ctxShadow.lineWidth = value;
  saveDrawProperties();
});
/////////////////////////////////////// End of StackOwerflow user code)
