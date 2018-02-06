function Ball(game, player, x, y, chargingTime) {
    this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ball.png"), 0, 0, 20, 20, .5, 1, true, false);  // this might be dumb cause it isnt moving
    this.flyingAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ball.png"), 0, 0, 20, 20, .3, 4, true, false);

    this.ctx = game.ctx;
    this.player = player;
    this.x = x;
    this.y = y;
    this.height = 20;
    this.width = 20;
    this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
    this.box = true; // draw box for testing
    this.team = player.team;
    this.speed = 1500;
    this.state = 0;
    if (this.player.triggerUp) {
        this.targetx = (x + this.player.stickx*100) - x;
        this.targety = (y + this.player.sticky*100) - y;
        this.player.triggerUp = false;
    }
    else    {
        this.targetx = this.player.mousex - x - 50;
        this.targety = this.player.mousey - y - 50;
    }

	//minimum charge time required for a boost to xspeed and yspeed is 1.
	if (chargingTime < 1) {
		chargingTime = 0;
	}
	//maximum charge time allowed is 3.
	else if (chargingTime > 3) {
		chargingTime = 3;
	}
	this.chargingTime = chargingTime;
    this.ySpeed = this.targety / (Math.sqrt(Math.pow(this.targetx, 2) + Math.pow(this.targety, 2)));
	//arbitrary calculation for how much charging affects yspeed
	this.ySpeed += (this.ySpeed * (chargingTime/2));
    this.xSpeed = this.targetx / (Math.sqrt(Math.pow(this.targetx, 2) + Math.pow(this.targety, 2)));
	//arbitrary calculation for how much charging affects xspeed
	this.xSpeed += (this.xSpeed * (chargingTime/2));

    Entity.call(this, game, this.x, this.y, 0, 0, true);
}

Ball.prototype = new Entity();
Ball.prototype.constructor = Ball;

Ball.prototype.update = function() {
//console.log(this.team);
    if (this.state === 0)   {
        this.x += this.game.clockTick * this.speed * this.xSpeed;
        this.y += this.game.clockTick * this.speed * this.ySpeed;

        if (this.x > width || this.x < 0) {
            this.xSpeed = -this.xSpeed;
            this.speed -= 100;
        }
        if (this.y > height - 64 || this.y < 0)  {
            this.ySpeed = -this.ySpeed;
            this.speed -= 100;
        }
        if (this.speed < 1500)   {
            this.state++;
        }
    }
    else if (this.state === 1)   {  //If in falling state...
        this.ySpeed += .05; //This adds pseudo-gravity to the ball, making it plummet to the ground.
        this.x += this.game.clockTick * this.speed * this.xSpeed;
        this.y += this.game.clockTick * this.speed * this.ySpeed;
        if (this.x > width || this.x < 0)   {
            this.xSpeed = -this.xSpeed; //xSpeed is retained even in falling
        }
        if (this.y > height - 32)   { //If the ball hits the ground...
            this.y = height - 32;
            this.speed -= 100; //Lower speed overall
            this.ySpeed = -(this.ySpeed/1.5); //Reverse ySpeed on bounce and reduce magnitude.
            if (this.speed <= 0)   { //Once speed is completely depleted, enter state 2
                this.state = 2;
            }
        }
    }
    this.boundingBox = new BoundingBox (this.x, this.y, this.width, this.height);
    Entity.prototype.update.call(this);
}

Ball.prototype.draw = function(ctx) {
    if (this.box) {
        this.boundingBox.draw(ctx);
    }
    if (this.state === 2)   {
        this.idleAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    else {
        this.flyingAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}
