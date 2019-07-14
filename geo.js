/*jshint esversion: 6 */


//#region Point class

class point {

    /**
     * constructor for point, default is 0,0
     * @param {number} x coord
     * @param {number} y coord
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * adds two points
     * @param {point} pt 
     * @returns {point} a new point
     */
    add(pt = point.prototype) {
        return new point(this.x + pt.x, this.y + pt.y);
    }

    /**
     * subtracts one point from another
     * @param {point} pt 
     * @returns {point} a new point
     */
    subtract(pt = point.prototype) {
        return new point(this.x - pt.x, this.y - pt.y);
    }
}

//#endregion

//#region size class

class size {

    /**
     * constructor for size, default is 0,0
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }

    /**
     * adds two sizes
     * @param {size} sz 
     * @returns {size} a new size
     */
    add(sz = size.prototype) {
        return new size(this.width + sz.width, this.height + sz.height);
    }

    /**
     * subtracts one size from another
     * @param {size} sz 
     * @returns {size} a new size
     */
    subtract(sz = size.prototype) {
        return new size(this.width - sz.width, this.height - sz.height);
    }
}

//#endregion

//#region Rectangle class

class rect {

    /**
     * constructor for rect, default is an empty rect
     * @param {number} x x coord
     * @param {number} y y coord
     * @param {number} width width of rectangle
     * @param {number} height height of rectangle
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * gives the right x coord
     * @returns {number} x+width
     */
    get right() {
        return this.x + this.width;
    }

    /**
     * givs the botton y coord
     * @returns {number} y+height
     */
    get bottom() {
        return this.y + this.height;
    }

    /**
     * reutrns the current location for the x, y coord
     * @returns {point} point location of the rect
     */
    get location() {
        return new point(this.x, this.y);
    }

    /**
     * sets a new point location for the rect
     * @param {point} pt new point for the x,y coord
     */
    set location(pt = point.prototype) {
        this.x = pt.x;
        this.y = pt.y;
    }

    /**
     * returns if the width or height == 0
     * @returns {boolean} true is width or height ==0
     */
    isEmpty() {
        return (this.width == 0 || this.height == 0);
    }

    /**
    * reutrns the current size for the width & height
    * @returns {size} size of the rect
    */
    get size() {
        return new size(this.width, this.height);
    }

    /**
     * sets a new size for the rect
     * @param {size} sz new size for the rect
     */
    set size(sz = size.prototype) {
        this.width = sz.width;
        this.height = sz.height;
    }

    /**
     * grows or shrinks the rec
     * @param {number} width 
     * @param {number} height 
     */
    expand(width = 0, height = 0) {
        this.width += width;
        this.x -= width / 2;
        this.height += height;
        this.y -= height / 2;
    }

    /**
     * sees if a point exists in this rectangle
     * @param {point} pt a point to check agaist
     * @returns {boolean} true is the value is in this area
     */
    contains(pt = point.prototype) {
        return pt.x >= this.x && pt.x <= this.x + this.width && pt.y >= this.y && pt.y <= this.y + this.height;
    }

    /**
     * checks to see if this rectangle overlaps another rectangle
     * @param {rect} R another rectangle 
     */
    overlaps(R = rect.prototype) {
        if (this.x > R.right || R.x > this.right)
            return false;

        if (this.y > R.bottom || R.y > this.bottom)
            return false;

        return true;
    }

    /**
     * forces this rectangle to stay in another
     * rectangle, does not resize if larger than the
     * passed rectangle
     * @param {rect} R another rectangle 
     */
    keepwithin(R = rect.prototype) {
        if (this.x < R.x) this.x = R.x;
        if (this.y < R.y) this.y = R.y;
        if (this.right > R.right) this.x = R.right - this.width;
        if (this.bottom > R.bottom) this.y = R.bottom - this.height;
    }

}

//#endregion

//#region extentions

/**
 * draws a rounded rect
 * @param {number} x  x-cord
 * @param {number} y: y-cord
 * @param {number} w: width
 * @param {number} h: height
 * @param {number} r: radius in the corners
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radi) {
    createRoundedRecPath(this, x, y, w, h, radi);
    this.stroke();
    return this;
};

/**
 * creates a rounded rect path
 * @param {CanvasrenderingContext2D} context the context to draw with
 * @param {number} x  x-cord
 * @param {number} y: y-cord
 * @param {number} w: width
 * @param {number} h: height
 * @param {number} radi: radius in the corners
 */
function createRoundedRecPath(context, x, y, w, h, radi) {
    if (w < 2 * radi) radi = w / 2;
    if (h < 2 * radi) radi = h / 2;
    context.beginPath();
    context.moveTo(x + radi, y);
    context.arcTo(x + w, y, x + w, y + h, radi);
    context.arcTo(x + w, y + h, x, y + h, radi);
    context.arcTo(x, y + h, x, y, radi);
    context.arcTo(x, y, x + w, y, radi);
    context.closePath();
}


/**
 * creates a rounded rect path
 * @param {CanvasrenderingContext2D} context the context to draw with
 * @param {rect} rec bounding rectangle to use
 * @param {number} radi: radius in the corners
 */
function createRoundedRecPathR(context, rec, radi) {
    createRoundedRecPath(context, rec.x, rec.y, rec.width, rec.height, radi);
}


/**
 * draws a rect with the specified color
 * @param {number} x  x-cord
 * @param {number} y: y-cord
 * @param {number} w: width
 * @param {number} h: height
 * @param {number} color: the color of the line
 */
CanvasRenderingContext2D.prototype.drawRect = function (x, y, w, h, color) {
    this.strokeStyle = color;
    this.beginPath();
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.lineTo(x, y);
    this.closePath();
    this.stroke();
    return this;
};


/**
 * shifts the selected index to the end of the array
 * if index is out of bounds it is ignored
 * @param {number} index any valid index within the array
 */
Array.prototype.shiftToEnd = function (index = 0) {
    if (index > -1 && index < this.length) {
        var x = this[index];
        var l = this.length;
        for (vari = index + 1; i < l; i++) {
            this[i - 1] = this[i];
        }
        this[l - 1] = x;
    }
    return this;
};


/**
 * trys to find the last item in the list
 * @return {*} the last item in the list, otherwise: null
 */
Array.prototype.last = function () {
    var x = this.length;
    if (x > 0) {
        return this[x - 1];
    }
    else {
        return null;
    }
};


/**
 * trys to find the index of the passed item; uses === for equality
 * @param {*} item an item that should be in the list
 * @returns {number} a valid index if found, otherwise -1
 */
Array.prototype.indexOf = function (item) {
    for (var bb = 0; bb < this.length; bb++) {
        if (this[bb] === item)
            return bb;
    }
    return -1; //not found
};


/**
 * takes a point and will change it if it is out of bounds (R)
 * @param {rect} R the rectang to check against
 */
point.prototype.keepwithin = function (R = rect.prototype) {
    if (this.x < R.x) this.x = R.x;
    if (this.y < R.y) this.y = R.y;
    if (this.x > R.right()) this.x = R.right();
    if (this.y > R.bottom()) this.y = R.bottom();
    return this;
};


/**
 * for checking to see if a string is null or empty
 */
String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};


//#endregion


//#region buttons

/**
 * an image button can use a known image with 3 states 
 * verctically alligned to represent: normal, mouseover and mousedown views
 */
class imgbutton {

    /**
     * constructor for a image button
     * @param {string} image a name reference to an image name to be pulled from the html
     * @param {rect} rec the size of the button, this also informs where to extract images from the image
     * @param {HTMLCanvasElement} xcanvas the canvas instance that the image gets pulled from
     * @param {*} callback the click event, parameterless
     * @param {number} pos left image index in the file (column number) this gets multiplied by image width when extracting the images
     * @param {boolean} isToggle if this a toggling button (stays down after click)
     */
    constructor(image = '', rec = rect.prototype, xcanvas = HTMLCanvasElement.prototype, callback = {}, pos = 0, isToggle = false) {
        this.image = d(image);
        this.R = rec;
        this.callback = callback;
        this.xcanvas = xcanvas;
        this.mouseOver = false;
        this.mousedown = false;
        this.pos = pos;
        this.isToggle = isToggle;
        this.value = false;


        xcanvas.addEventListener('mousedown', e => {
            if (this.R.contains(mouse(e) )) {
                if (e.buttons == 1) {
                    this.mousedown = true;
                    if (this.isToggle)
                        this.value = !this.value;
                    else
                        this.value = true;
                }
            }
        });


        xcanvas.addEventListener('mousemove', e => {
            this.mouseOver = this.R.contains(mouse(e));
        });


        xcanvas.addEventListener('mouseup', e => {
            if (this.mouseOver && this.mousedown) {
                this.mousedown = false;
                this.callback();
                if (!this.isToggle)
                    this.value = false;
            }
        });
    }

    /**
     * returns if the mouse is currently hovering over the button
     */
    hasmouse() {
        return this.mouseOver;
    }

    /**
     * this updates the screen drawing, this must be handled by the owner, to keep 
     * the correct rendering order happening.
     */
    update() {
        var crc = this.xcanvas.getContext('2d');
        var mx = 0;
        if (this.mouseOver) mx = 1;
        if (this.mousedown) mx = 2;
        if (this.isToggle && this.value) mx = 2;
        crc.drawImage(this.image, this.pos * this.R.width, this.R.height * mx, this.R.width, this.R.height, this.R.x, this.R.y, this.R.width, this.R.height);
    }

}

//#endregion
