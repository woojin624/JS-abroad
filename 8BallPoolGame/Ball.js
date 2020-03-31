function Ball(position, color) {
  this.position = position;
  this.velocity = new Vector2();
  this.moving = false;
  this.sprite = getBallSpriteByColor(color);
  this.color = color;
  this.visible = true;
}

Ball.prototype.update = function(delta) {
  if (!this.visible) {
    return;
  }

  this.position.addTo(this.velocity.mult(delta));

  this.velocity = this.velocity.mult(1 - CONSTANTS.frictionEnergyLoss);

  if (this.velocity.length() < CONSTANTS.minVelocityLength) {
    this.velocity = new Vector2();
    this.moving = false;
  }
};

Ball.prototype.draw = function() {
  if (!this.visible) {
    return;
  }

  Canvas.drawImage(this.sprite, this.position, CONSTANTS.ballOrigin);
};

Ball.prototype.shoot = function(power, rotation) {
  this.velocity = new Vector2(
    power * Math.cos(rotation),
    power * Math.sin(rotation)
  );
  this.moving = true;
};

Ball.prototype.collideWithBall = function(ball) {
  if (!this.visible || !ball.visible) {
    return;
  }

  // 일반 벡터 찾기
  const n = this.position.subtract(ball.position);

  // 거리 찾기
  const dist = n.length();

  if (dist > CONSTANTS.ballDiameter) {
    return;
  }

  // 가장 짧은 전환 거리 찾기
  const mtd = n.mult((CONSTANTS.ballDiameter - dist) / dist);

  // 공 밀어내기
  this.position = this.position.add(mtd.mult(1 / 2));
  ball.position = ball.position.subtract(mtd.mult(1 / 2));

  // 단위 정상 벡터 찾기
  const un = n.mult(1 / n.length());

  // 단위 접선 벡터 찾기
  const ut = new Vector2(-un.y, un.x);

  // Project velocities onto the unit normal and unit tangent vectors
  const v1n = un.dot(this.velocity);
  const v1t = ut.dot(this.velocity);
  const v2n = un.dot(ball.velocity);
  const v2t = ut.dot(ball.velocity);

  // 새로운 정상적인 속도 찾기
  let v1nTag = v2n;
  let v2nTag = v1n;

  // scalar normal과 tangential속도를 벡터로 변환
  v1nTag = un.mult(v1nTag);
  const v1tTag = ut.mult(v1t);
  v2nTag = un.mult(v2nTag);
  const v2tTag = ut.mult(v2t);

  // 속도 업데이트
  this.velocity = v1nTag.add(v1tTag);
  ball.velocity = v2nTag.add(v2tTag);

  this.moving = true;
  ball.moving = true;
};

Ball.prototype.handleBallInPocket = function() {
  if (!this.visible) {
    return;
  }

  let inPocket = CONSTANTS.pockets.some(pocket => {
    return this.position.distFrom(pocket) < CONSTANTS.pocketRadius;
  });

  if (!inPocket) {
    return;
  }

  this.visible = false;
  this.moving = false;
};

Ball.prototype.collideWithTable = function(table) {
  if (!this.moving || !this.visible) {
    return;
  }

  let collided = false;

  if (this.position.y <= table.TopY + CONSTANTS.ballRadius) {
    this.position.y = table.TopY + CONSTANTS.ballRadius;
    this.velocity = new Vector2(this.velocity.x, -this.velocity.y);
    collided = true;
  }

  if (this.position.x >= table.RightX - CONSTANTS.ballRadius) {
    this.position.x = table.RightX - CONSTANTS.ballRadius;
    this.velocity = new Vector2(-this.velocity.x, this.velocity.y);
    collided = true;
  }

  if (this.position.y >= table.BottomY - CONSTANTS.ballRadius) {
    this.position.y = table.BottomY - CONSTANTS.ballRadius;
    this.velocity = new Vector2(this.velocity.x, -this.velocity.y);
    collided = true;
  }

  if (this.position.x <= table.LeftX + CONSTANTS.ballRadius) {
    this.position.x = table.LeftX + CONSTANTS.ballRadius;
    this.velocity = new Vector2(-this.velocity.x, this.velocity.y);
    collided = true;
  }

  if (collided) {
    this.velocity = this.velocity.mult(1 - CONSTANTS.collisionEnergyLoss);
  }
};
