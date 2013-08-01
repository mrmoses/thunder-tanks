function Tank(gs) {
    var game = gs;

    var length = 60;
    var width = 50;

    var x = 100; //gs.width / 2; // center of tank
    var y = 100; //gs.height / 2; // center of tank
    var angle = MathUtil.degreesToRadians(45); // angle in radians
    var speed = 0;
    var maxSpeed = 8;

    var aim_angle = MathUtil.degreesToRadians(0);
    var firing = false;
    var fireRate = 5; // number of shots per sec
    var fireCooldown = 0;

    this.update = function(gs) {
        // move tank
        x = x + speed * Math.cos(angle);
        y = y + speed * Math.sin(angle);

        // update aim
        var mouseposition = gs.pointerPosition;
        var mousex = mouseposition[0];
        var mousey = mouseposition[1];
        aim_angle = MathUtil.getAngle(x,y,mousex,mousey);

        if (firing && fireCooldown === 0) {
            this.fireBullet();
        }
        if (fireCooldown > 0) {
            fireCooldown--;
        }
    }

    this.draw = function(c, gs) {
        // draw tank
        c.save(); //save the current draw state
        c.translate(x,y); //set drawing area to where the tank is
        c.rotate(angle); //rotate drawing area to tank's angle
        c.fillRect(-length/2, -width/2, length, width); // draw the tank
        c.restore(); //restore the previous draw state

        // draw cannon
        c.save();
        c.translate(x,y);
        c.rotate(aim_angle);
        c.fillRect(0, 0, length, 5);
        c.restore();
    }

    // up (W)
    this.keyDown_38 = this.keyDown_87 = function () {
        speed = 1;
    }
    this.keyHeld_38 = this.keyHeld_87 = function () {
        if (speed < maxSpeed)
            speed += 1;
    }
    this.keyUp_38 = this.keyUp_87 = function () {
        speed = 0;
    }

    // down (S)
    this.keyDown_40 = this.keyDown_83 = function () {
        speed = -0.3;
    }
    this.keyHeld_40 = this.keyHeld_83 = function () {
        if (speed > -maxSpeed)
            speed -= 0.3;
    }
    this.keyUp_40 = this.keyUp_83 = function () {
        speed = 0;
    }

    // left (A)
    this.keyHeld_37 = this.keyDown_37 = this.keyHeld_65 = this.keyDown_65 = function () {
        angle -= 0.1;
    }

    // right (D)
    this.keyHeld_39 = this.keyDown_39 = this.keyHeld_68 = this.keyDown_68 = function () {
        angle += 0.1;
    }

    this.keyDown = function (keyCode) {
        //console.log(keyCode);

        // w = 87, s = 83, a = 65, d = 68
        // up = 38, down = 40, left = 37, right = 39
    }

    this.pointerDown = function(button) {
        //console.log("tank pointerDown", button);
        switch (button) {
            case 0:
                firing = true;
                break;
            case 2:
                break;
        }
    }

    this.pointerUp = function(button) {
        //console.log("tank pointerUp", button);
        switch (button) {
            case 0:
                firing = false;
                break;
            case 2:
                break;
        }
    }

    this.pointerBox = function() {
        return [0, 0, game.width, game.height];
    }

    this.fireBullet = function() {
        fireCooldown = game.framerate / fireRate;

        var mouseposition = gs.pointerPosition;
        var mousex = mouseposition[0];
        var mousey = mouseposition[1];

        var b = new Bullet(game,x,y,mousex,mousey);
        game.addEntity(b);
    }
}