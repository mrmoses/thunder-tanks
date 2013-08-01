var MathUtil = new (function() {

    // Returns the angle between two points (in radians)
    this.getAngle = function(x1,y1,x2,y2) {
        var diff_x = (x1 - x2) * -1;
        var diff_y = (y1 - y2) * -1;

        return Math.atan2(diff_y,diff_x);
    };

    // Returns the distance between two points.
    this.getDistance = function(x1, y1, x2, y2) {
        var diff_x = (x1 - x2) * -1;
        var diff_y = (y1 - y2) * -1;

        return Math.sqrt( (diff_x * diff_x) + (diff_y * diff_y));
    };

    /**
     * Convert radians to degree
     * @link http://stackoverflow.com/questions/135909/is-there-a-built-in-method-for-converting-radians-to-degrees
     * @param {number} rad Radians to convert
     * @returns {number} 0 to 360 degrees
     */
    this.radiansToDegrees = function(rad) {
        return rad * (180 / Math.PI);
    };

    /**
     * Convert degrees to radians
     * @param {number} degrees 0 to 360 degrees
     * @returns {number} Numerical value of radians
     */
    this.degreesToRadians = function(degrees) {
        return degrees * (Math.PI / 180);
    };

})();
