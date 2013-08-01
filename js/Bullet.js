function Bullet(gs, start_x, start_y, target_x, target_y, _speed) {
    var game = gs;

    start_x = start_x || gs.width/2;
    start_y = start_y || gs.height/2;
    target_x = target_x || game.random(0,gs.width);
    target_y = target_y || game.random(0,gs.height);
    _speed = _speed || 10;

    var radius = 5;
    var x = start_x;
    var y = start_y;
    var angle = MathUtil.getAngle(start_x,start_y,target_x,target_y);
    var speed = _speed;

    this.update = function(gs) {
        // move bullet
        x = x + speed * Math.cos(angle);
        y = y + speed * Math.sin(angle);
    }

    this.draw = function(c, gs) {
        // draw bullet
        c.beginPath();
        c.arc(x, y, radius, 0, 2 * Math.PI, false);
        //c.fillStyle = 'green';
        //c.fill();
        c.lineWidth = 1;
        //c.strokeStyle = '#003300';
        c.stroke();
    }
}