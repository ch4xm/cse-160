// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false;
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  const v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, 'red');
}

function drawVector(vector, color) {
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false;
  } 
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = color;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = 20;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + vector.elements[0] * scale, centerY - vector.elements[1] * scale); // End at the vector's coordinates
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  const redX = Number(document.getElementById('redX').value);
  const redY = Number(document.getElementById('redY').value);
  const redVector = new Vector3([redX, redY, 0]);
  drawVector(redVector, 'red');

  const blueX = Number(document.getElementById('blueX').value);
  const blueY = Number(document.getElementById('blueY').value);
  const blueVector = new Vector3([blueX, blueY, 0]);
  drawVector(blueVector, 'blue');
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  
  const redX = Number(document.getElementById('redX').value);
  const redY = Number(document.getElementById('redY').value);
  const redVector = new Vector3([redX, redY, 0]);
  drawVector(redVector, 'red');

  const blueX = Number(document.getElementById('blueX').value);
  const blueY = Number(document.getElementById('blueY').value);
  const blueVector = new Vector3([blueX, blueY, 0]);
  drawVector(blueVector, 'blue');

  const scalar = Number(document.getElementById('scalar').value);
  
  const operation = document.getElementById('operation').value;
  if (operation === 'add') {
    redVector.add(blueVector);
    drawVector(redVector, 'green');
  } else if (operation === 'subtract') {
    redVector.sub(blueVector);
    drawVector(redVector, 'green');
  } else if (operation === 'multiply') {
    redVector.mul(scalar);
    blueVector.mul(scalar);
    drawVector(redVector, 'green');
    drawVector(blueVector, 'green');
  } else if (operation === 'divide') {
    redVector.div(scalar);
    blueVector.div(scalar);
    drawVector(redVector, 'green');
    drawVector(blueVector, 'green');
  } else if (operation === 'magnitude') {
    const redMagnitude = redVector.magnitude()
    const blueMagnitude = blueVector.magnitude()
    console.log('Magnitude v1:', redMagnitude);
    console.log('Magnitude v2:', blueMagnitude);
  } else if (operation === 'normalize') {
    redVector.normalize();
    blueVector.normalize();
    drawVector(redVector, 'green');
    drawVector(blueVector, 'green');
  } else if (operation === 'angle') {
    const dot = Vector3.dot(redVector, blueVector);
    const redMagnitude = redVector.magnitude();
    const blueMagnitude = blueVector.magnitude();
    const angle = Math.acos(dot / (redMagnitude * blueMagnitude)) * (180 / Math.PI);
    console.log('Angle:', angle);
  } else if (operation === 'area') {
    const area = Vector3.cross(redVector, blueVector).magnitude() / 2;
    console.log('Area:', area);
  }
}