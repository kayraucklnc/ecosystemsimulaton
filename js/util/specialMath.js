function mathCircle(vertexCount, radius, startX, startY) {
  let retArr = [];
  let minAngle = (2 * Math.PI) / vertexCount;
  for (let i = 0; i < vertexCount; i++) {
    let x = startX + radius * Math.sin(minAngle * i);
    let y = startY + radius * Math.cos(minAngle * i);
    retArr.push(x);
    retArr.push(y);
  }
  return retArr;
}
