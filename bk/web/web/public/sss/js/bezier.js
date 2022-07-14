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
var chooseBezier = document.getElementsByClassName('bezier');
var machIndex;
var BezierSFP = [];//Array for Start/Finish control points
var j = 0;
var deltaCenter = null;
var CPQS = [];
var CPQF = [];
const TENSION = 0.1;

/**
 * Classes
*/

class Bezier{
  static choose(){
    mainShadow.style.visibility = 'visible';
    startX = startY = undefined;
    drawType = 'Bezier';
    ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
  }

  static draw(){
    switch (drawType){
      case 'Bezier':
        if (startX === undefined && startY === undefined){ //If Start Point missing, then create
          startX = mouseX;
          startY = mouseY;
        } else {//If Start Point already created, then create Finish Point
          ctxShadow.beginPath();//Create line between points
            ctxShadow.moveTo(startX, startY);
            ctxShadow.lineTo(mouseX, mouseY);
          ctxShadow.stroke();

          BezierSFP[j] = new LineB(startX, startY, mouseX, mouseY);//Save Finish and Start points coordinates

          startX = mouseX;//Finish point for last = Start point for next
          startY = mouseY;

          let rdx = BezierSFP[j].bezXFinish - BezierSFP[j].bezXStart,//delta-x 
              rdy = BezierSFP[j].bezYFinish - BezierSFP[j].bezYStart,//delta-y 
              rd = sqrtOfSumOfSquares(rdx, rdy),//distance
              dx = rdx / rd,//normalized delta-x 
              dy = rdy / rd;//normalized delta-y 

          let distanceToStart = sqrtOfSumOfSquares(rdx, rdy);//distance point

          let CPXS = BezierSFP[j].bezXStart - (dx * distanceToStart * TENSION), //coordinates of control points
              CPYS = BezierSFP[j].bezYStart - (dy * distanceToStart * TENSION),
              CPXF = BezierSFP[j].bezXFinish + (dx * distanceToStart * TENSION),
              CPYF = BezierSFP[j].bezYFinish + (dy * distanceToStart * TENSION);
        
          CPQS[j] = new CircleB(new Point(CPXS, CPYS), 5);
          CPQF[j] = new CircleB(new Point(CPXF, CPYF), 5);

          CircleB.draw(CPQS[j]);
          CircleB.draw(CPQF[j]);

          Bezier.helpingLines(j);

          j++; 
        }
        break;
    }
  }

  static onlyLine(context, i){
    context.beginPath();
      context.moveTo(BezierSFP[i].bezXStart, BezierSFP[i].bezYStart);
      context.bezierCurveTo(CPQS[i].point.x, CPQS[i].point.y, CPQF[i].point.x, CPQF[i].point.y, BezierSFP[i].bezXFinish, BezierSFP[i].bezYFinish);
    context.stroke(); 
  }

  static onDblclick(exceptLast){
    startX = startY = undefined;
    if (j !== 0) {
      for (let k = 0; k < CPQS.length - exceptLast; k++) {
        Bezier.onlyLine(ctx, k);
      }
      ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
    }
    //clear arrays
    CPQS.splice(0, CPQS.length);
    CPQF.splice(0, CPQF.length);
    BezierSFP.splice(0, BezierSFP.length);
    //clear index
    j = 0;
  }

  static isAnyoneInside(p, CP){
    let ifYes = false;
    searchInside: for (let controlPoint of CP) {
      if(controlPoint.isInside(p)){
        ifYes = true;
        machIndex = CP.indexOf(controlPoint);
        break searchInside;
      }
    }
    return ifYes;
  } 

  static helpingLines(i){
    ctxShadow.strokeStyle = 'grey';

    ctxShadow.beginPath();//Create line between points
      ctxShadow.moveTo(BezierSFP[i].bezXFinish, BezierSFP[i].bezYFinish);
      ctxShadow.lineTo(CPQF[i].point.x, CPQF[i].point.y);
    ctxShadow.stroke();

    ctxShadow.beginPath();//Create line between points
      ctxShadow.moveTo(BezierSFP[i].bezXStart, BezierSFP[i].bezYStart);
      ctxShadow.lineTo(CPQS[i].point.x, CPQS[i].point.y);
    ctxShadow.stroke();

    ctxShadow.strokeStyle = 'black';
  }
}

class DragBezier{
  static start(e, k, CP){
    mousePos(e);
    deltaCenter = new Point(mouseX - CP[k].point.x, mouseY - CP[k].point.y); 
  }

  static do(e, i, CP){
    if(deltaCenter !== null) {
      mousePos(e);


      CP[i].point.x = (mouseX - deltaCenter.x);
      CP[i].point.y = (mouseY - deltaCenter.y);

      ctxShadow.clearRect(0, 0, canvas.width, canvas.height);
      for (var k = 0; k < CP.length; k++) {
        if (k != i){
          Bezier.onlyLine(ctxShadow, k); 
          Bezier.helpingLines(k);          
          CircleB.draw(CPQS[k]);
          CircleB.draw(CPQF[k]);
        } else{
          Bezier.onlyLine(ctxShadow, i);
          Bezier.helpingLines(i);
          CircleB.draw(CPQS[k]);
          CircleB.draw(CPQF[k]);
        }
      }     
    }
  }

  static stop(){
    if (drawType == 'dragBezier') deltaCenter = null;
  }
}

/**
 * functions
*/

function sqrtOfSumOfSquares(x, y) {
  return Math.sqrt((x * x) + (y * y));
}

/**
 * Event Listeners
*/

document.addEventListener('DOMContentLoaded', () => {
  for (let choosen of chooseBezier) {
    choosen.addEventListener('click', Bezier.choose);
  }
});

canvasShadow.onclick = function(){
  switch (drawType){
    case 'Bezier':
      Bezier.draw();
      break;
  }
};

canvasShadow.addEventListener('mousedown', (e) => {
  let p = new Point(mouseX,mouseY);
  if (drawType == 'dragBezier'){
    if(Bezier.isAnyoneInside(p, CPQS)){
      DragBezier.start(e, machIndex, CPQS);
    } else if (Bezier.isAnyoneInside(p, CPQF)){
      DragBezier.start(e, machIndex, CPQF);
    }
  }
});

canvasShadow.addEventListener('mousemove', (e) => {
  let p = new Point(mouseX,mouseY);
  switch (drawType){
    case 'Bezier':
      if(Bezier.isAnyoneInside(p, CPQS) || Bezier.isAnyoneInside(p, CPQF)){
        drawType = 'dragBezier';
      } 
      break;
    case 'dragBezier':
      if(Bezier.isAnyoneInside(p, CPQS)){
        DragBezier.do(e, machIndex, CPQS);
      } else if(Bezier.isAnyoneInside(p, CPQF)){ 
        DragBezier.do(e, machIndex, CPQF);
      }else{
        drawType = 'Bezier';
      }
      break;
  }
});

canvasShadow.addEventListener('mouseup', () => {
  switch (drawType){
    case 'dragBezier':
      DragBezier.stop();
      break;
    case 'Bezier':

      break;
  }
});

canvasShadow.addEventListener('mouseout', () => {
  switch (drawType){
    case 'dragBezier':
      DragBezier.stop();
      break;
  }
});

//Save drawed curve on main canvas
canvasShadow.addEventListener('dblclick', () => {
  switch (drawType){
    case 'dragBezier':
      Bezier.onDblclick(0);
      //return drawType to primary 
      drawType = 'Bezier';
      break;
    case 'Bezier':
      Bezier.onDblclick(2);
      break;
  }
});

