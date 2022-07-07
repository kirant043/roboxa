/**
 * Simple Graphic Editor
 *
 * @Author Oleh Yaroshchuk 
 */

/**
 * Global variables
*/
var mainShadow = document.getElementById('main-shadow');
var canvasShadow = document.getElementById('canvas-shadow');
var ctxShadow = document.getElementById('canvas-shadow').getContext('2d');
var chooseQuadratic = document.getElementsByClassName('quadratic');
var chooseBezier = document.getElementsByClassName('bezier');
var machIndex;
var QuadraticSFP = [];//Array for Start/Finish control points
var BezierSFP = [];   //Array for Start/Finish control points
var j = 0;
var deltaCenter = null;
var CPQ = [];//Control Point array for Quadratic Quadratic 

/**
 * Classes
*/
class LineB{
  constructor(startX, startY, mouseX, mouseY){
    this.bezXStart = startX;
    this.bezYStart = startY;
    this.bezXFinish = mouseX;
    this.bezYFinish = mouseY;
    return this;
  }
}

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
    return this;
  }
}

class CircleB{
  constructor(point, radius) {
    this.point = point;
    this.radius = radius;
    this.isInside = function (p) {
      return Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2) < Math.pow(radius, 2); 
    };
    return this;
  }

  //Draw Control Circle
  static draw(circle){
    ctxShadow.beginPath();
      ctxShadow.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI*2, true);
    ctxShadow.fill();
    ctxShadow.stroke();
  }
}

class Quadratic{
  static choose(){
    mainShadow.style.visibility = 'visible';
    startX = startY = undefined;
    drawType = 'Quadratic';
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }

  //Draw Quadratic Start-Finish Points
  static draw(){
    switch (drawType){
      case 'Quadratic':
        if (startX === undefined && startY === undefined){ //If Start Point missing, then create
          startX = mouseX;
          startY = mouseY;
        } else {//If Start Point already created, then create Finish Point
          ctxShadow.beginPath();//Create line between points
            ctxShadow.moveTo(startX, startY);
            ctxShadow.lineTo(mouseX, mouseY);
          ctxShadow.stroke();

          QuadraticSFP[j] = new LineB(startX, startY, mouseX, mouseY);//Save Finish and Start points coordinates

          startX = mouseX;//Finish point for last = Start point for next
          startY = mouseY;

          let CPX = (QuadraticSFP[j].bezXFinish + QuadraticSFP[j].bezXStart)/2;//X and Y coordinates of line center
          let CPY = (QuadraticSFP[j].bezYFinish + QuadraticSFP[j].bezYStart)/2;  

          CPQ[j] = new CircleB(new Point(CPX, CPY), 5);

          quadraticHelpingLines(j);

          CircleB.draw(CPQ[j]);         

          j++; 
        }
        break;
    }
  }

  static onlyLine(context, i){
    context.beginPath();
      context.moveTo(QuadraticSFP[i].bezXStart, QuadraticSFP[i].bezYStart);
      context.quadraticCurveTo(CPQ[i].point.x, CPQ[i].point.y, QuadraticSFP[i].bezXFinish, QuadraticSFP[i].bezYFinish);
    context.stroke(); 
  }
}

class DragQuadratic{
  static start(e, k){
    mousePos(e);
    deltaCenter = new Point(mouseX - CPQ[k].point.x, mouseY - CPQ[k].point.y); 
  }

  static do(e, i){
    if(deltaCenter !== null) {
      mousePos(e);


      CPQ[i].point.x = (mouseX - deltaCenter.x);
      CPQ[i].point.y = (mouseY - deltaCenter.y);

      ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
      for (var k = 0; k < CPQ.length; k++) {
        if (k != i){
          Quadratic.onlyLine(ctxShadow, k); 
          quadraticHelpingLines(k);          
          CircleB.draw(CPQ[k]);
        } else{
          Quadratic.onlyLine(ctxShadow, i);
          quadraticHelpingLines(i);
          CircleB.draw(CPQ[i]);
        }
      }     
    }
  }

  static stop(){
    if (drawType == 'dragQuadratic') deltaCenter = null;
  }
}

/**
 * functions
*/

function isAnyoneInside(p){
  let ifYes = false;
  searchInside: for (let controlPoint of CPQ) {
    if(controlPoint.isInside(p)){
      ifYes = true;
      machIndex = CPQ.indexOf(controlPoint);
      break searchInside;
    }
  }
  return ifYes;
} 

function drawOnDblclick(exceptLast){
  startX = startY = undefined;
  if (j !== 0) {
    for (let k = 0; k < CPQ.length - exceptLast; k++) {
      Quadratic.onlyLine(ctx, k);
    }
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }
  //clear arrays
  CPQ.splice(0, CPQ.length);
  QuadraticSFP.splice(0, QuadraticSFP.length);
  //clear index
  j = 0;
}

function quadraticHelpingLines(i){
  ctxShadow.strokeStyle = 'grey';

  ctxShadow.beginPath();//Create line between points
    ctxShadow.moveTo(QuadraticSFP[i].bezXFinish, QuadraticSFP[i].bezYFinish);
    ctxShadow.lineTo(CPQ[i].point.x, CPQ[i].point.y);
  ctxShadow.stroke();

  ctxShadow.beginPath();//Create line between points
    ctxShadow.moveTo(QuadraticSFP[i].bezXStart, QuadraticSFP[i].bezYStart);
    ctxShadow.lineTo(CPQ[i].point.x, CPQ[i].point.y);
  ctxShadow.stroke();

  ctxShadow.strokeStyle = 'black';
}

/**
 * Event Listeners
*/

document.addEventListener('DOMContentLoaded', () => {
  for (let choosen of chooseQuadratic) {
    choosen.addEventListener('click', Quadratic.choose);
  }
});

canvasShadow.onclick = function(){
  switch (drawType){
    case 'Quadratic':
      Quadratic.draw();
      break;
    case 'Bezier':
      Bezier.draw();
      break;
  }
};

canvasShadow.addEventListener('mousedown', (e) => {
  let p = new Point(mouseX,mouseY);
  if (drawType == 'dragQuadratic' && isAnyoneInside(p)){
    DragQuadratic.start(e, machIndex);
  } 
});

canvasShadow.addEventListener('mousemove', (e) => {
  let p = new Point(mouseX,mouseY);
  switch (drawType){
    case 'Quadratic':
      if(isAnyoneInside(p)){
        drawType = 'dragQuadratic';
      } 
      break;
    case 'dragQuadratic':
      if(isAnyoneInside(p)){
        DragQuadratic.do(e, machIndex);
      } else{
        drawType = 'Quadratic';
      }
      break;
  }
});

canvasShadow.addEventListener('mouseup', () => {
  switch (drawType){
    case 'dragQuadratic':
      DragQuadratic.stop();
      break;
    case 'Quadratic':

      break;
    case 'dragBezier':
      DragBezier.stop();
      break;
    case 'Bezier':

      break;
    default:
      ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }
});

canvasShadow.addEventListener('mouseout', () => {
  switch (drawType){
    case 'dragQuadratic':
      DragQuadratic.stop();
      break;
  }
});

//Save drawed curve on main canvas
canvasShadow.addEventListener('dblclick', () => {
  switch (drawType){
    case 'dragQuadratic':
      drawOnDblclick(0);
      //return drawType to primary 
      drawType = 'Quadratic';
      break;
    case 'Quadratic':
      drawOnDblclick(2);
      break;
  }
});

