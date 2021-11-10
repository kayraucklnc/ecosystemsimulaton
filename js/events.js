function mouseDown(event) {
  mouseInit = vec2(event.clientX, event.clientY);

  if (mouseInit[0] < canvas.width && mouseInit[1] < canvas.height) {
    if (event.which == 1) {
      leftMouseDownBehaviour(event);
    } else if (event.which == 2) {
      middleMouseDownBehaviour(event);
    }
  }
}

function leftMouseDownBehaviour(event) {
  leftDrag = true;
}

function middleMouseDownBehaviour(event) {
  middleDrag = true;
}

function mouseMove(event) {
  if (leftDrag) {
    leftDragBehaviour(event);
  } else if (middleDrag) {
    middleDragBehaviour(event);
  }
}

function middleDragBehaviour(event) {
  middleDragAmount = vec2(
    (event.clientX - mouseInit[0]) / 100 + lastTranslation[0],
    (event.clientY - mouseInit[1]) / 100 + lastTranslation[1]
  );
}

function leftDragBehaviour(event) {
  leftDragAmount = vec2(
    (event.clientX - mouseInit[0]) / 100 + lastRotation[0],
    (-event.clientY + mouseInit[1]) / 100 + lastRotation[1]
  );
}

function mouseUp(event) {
  lastRotation = leftDragAmount;
  lastTranslation = middleDragAmount;
  leftDrag = false;
  middleDrag = false;
}

function scroll(event) {
  if (event.deltaY > 0) {
    zoom *= 1.2;
  } else {
    zoom /= 1.2;
  }
  console.log(event);
}
