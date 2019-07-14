/*jshint esversion: 6 */

//#region constants

const C_WIDTH = 120;                //Card width
const C_HEIGHT = 200;               //Card height
const HEART = 'h';                  //single letter card face shaves off a cpu cycles when comparing two strings
const CLOVER = 'c';
const DIAMOND = 'd';
const SPADE = 's';
const C_SHADE = 'rgba(0,0,0,0.2)';  //try to keep the colors standard as constant, easier to change for everything
const LANDER_REC = 'gold';
const C_HILIGHT ='rgba(48, 176, 255,0.4)'; //yellowish

//#endregion

//#region support classes


class card {
    /**
     * constructor for a card
     * @param {number} x x-coord to place
     * @param {number} y y coord to place
     * @param {string} face one of the Heart, Clover,Diamond,Spade constants
     * @param {number} index card number 0 to 12, this will also help pull the image from the map
     */
    constructor(x = 0, y = 0, face = HEART, index = 0) {
        this.R = new rect(x, y, C_WIDTH, C_HEIGHT);
        this.flipped = false;
        this.startedflip = false;
        this.face = face;
        this.index = index;
        this.allowmove = true;
    }

    /**
     * draws the card, pulling the card face from a map
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     */
    Update(crc = CanvasRenderingcontext2D.prototype) {
        var r = this.R; //just so i don't have to keep typing this.R

        crc.save(); //saves the current context of the layout, importance when clipping
        createRoundedRecPathR(crc,r,10);//10 edge radi to give the cards rounded edges
        crc.clip(); //creates a region that is the only space that can be drawn in

        if (!this.flipped) {
            //draw the card back
            crc.drawImage(_imgback, r.x, r.y, r.width, r.height);
        }
        else {
            //draw the card front
            var x = this.index; //card index is the left to right 0-12 for source image
            var y = 0;          //card face is top down in the source image
            switch (this.face) {
                case HEART:
                    y = 0;
                    break;
                case CLOVER:
                    y = 1;
                    break;
                case DIAMOND:
                    y = 2;
                    break;
                default://spade, or if something wierd was passed
                    y = 3;
                    break;
            }
            crc.drawImage(_imgcardface, x * C_WIDTH, y * C_HEIGHT, C_WIDTH, C_HEIGHT, r.x, r.y, r.width, r.height);
        }
        crc.restore(); //important to remove the cliped mask, so the rest of the screen can be painted
    }

}

/**
 * this is used only when animating a card flip
 */
class flip_card {

    /**
     * constructor for flipping the card
     * @param {*} c  the card needing flipped
     */
    constructor(c = card.prototype) {
        this.card = c;                  //store the instance of the card
        this.done = c.startedflip;      //just incese this card gets added to multiple 'flipps' only one will run
        this.index = 0;                 //create a animation index
        this.card.startedflip = true;   //also just incase another instace has this card
    }

    /**
    * updates the cards animation
    * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
    * @return {boolean} true when animation is complete
    */
    Update(crc = CanvasRenderingcontext2D.prototype, isTimer = false) {
        var ret = false;
        this.index++;
        var r = this.card.R;
        var rate = C_WIDTH / 10;
        if (this.index < 19) {      //20 frames of animation to flip the card
            if (this.index < 10) {  //mid point in the turn
                r.expand(-rate, 0);
            }
            else {
                this.card.flipped = true;
                r.expand(rate, 0);
            }
        }
        else {
            ret = true;
            this.done = true;
        }

        crc.fillStyle = C_SHADE;
        createRoundedRecPath(crc,r.x+20,r.y+20,r.width,r.height,10); //10 radi
        crc.fill();
        this.card.Update(crc);
        return ret;
    }

}

/**
 * this is only used when automating a card move, like double-click or shuffling
 */
class move_card {

    /**
     * constructor for moving a card
     * @param {*} c         //card to move
     * @param {*} too_end   //what lander or source to dump the card once it's done
     * @param {*} delay     //how long to delay the card move so they don't all go at once, mesured in frames
     */
    constructor(c, too_end, delay) {
        this.done = false;
        this.card = c;
        this.index = 0;
        this.end = too_end;
        this.delay = delay;
        var too_pt = new point(too_end.R.x, too_end.R.y);
        var xaddr = (too_pt.x - c.R.x) / 20; 
        var yaddr = (too_pt.y - c.R.y) / 20;
        this.steps = [new point(c.R.x, c.R.y)];
        //create the animation steps, this is currently a straight line
        //from a to b, but it would be nice to put a curved path
        for (var i = 0; i < 20; i++) {//20 frames
            this.steps.push(new point(c.R.x + (i * xaddr), c.R.y + (i * yaddr)));
        }
        this.steps.push(too_pt);//one final one for final location
    }

    /**
     * updates the cards animation
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     * @param {boolean} isTimer only update the animation when it's coming from the animation timer, not other events
     * @return {boolean} true when animation is complete
     */
    Update(crc = CanvasRenderingcontext2D.prototype, isTimer = false) {
        var ret = false;

        if (this.delay > 0) {
            //if this is a timer tick, start the count down before animating
            if (isTimer) this.delay--;
        }
        else {
            //if theis is a timer tick add to the index of animation
            if (isTimer) this.index++;
            if (this.index >= this.steps.length) {
                //animation is over, mark as done, and put the 
                //card into it's new container
                this.end.cards.push(this.card);
                this.done = true;
                ret = true;
            }
            else {
                //update the location
                this.card.R.x = this.steps[this.index].x;
                this.card.R.y = this.steps[this.index].y;

            }
        }

        crc.fillStyle = C_SHADE;
        var r = this.card.R;
        createRoundedRecPath(crc,r.x+20,r.y+20,r.width,r.height,10); //10 radi
        crc.fill();
        this.card.Update(crc);
        return ret;
    }
}

/**
 * final resting place for a card
 */
class lander {
    /**
     * constructor for a lander, landers auto create the Ace card for the dect
     * @param {string} face what Ace card to create
     * @param {rect} rec where the lander is positioned
     */
    constructor(face = HEART, rec = rect.prototype) {
        this.face = face;
        this.R = rec;
        var c = new card(rec.x, rec.y, face, 0);
        c.allowmove = false;
        c.flipped = true;
        this.cards = [c];
    }

    /**
     * updates the lander deck
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     */
    Update(crc = CanvasRenderingcontext2D.prototype) {
        //landers will not show the deck, so only draw the last one
        this.cards.last().Update(crc);
    }

}

/**
 * where to pull cards from, source locations
 */
class source {

    /**
     * constructor for a source pile
     * @param {rect} rec location for the source deck
     */
    constructor(rec = rect.prototype) {
        this.R = rec;
        this.cards = [];
    }

    /**
     * updates the source deck
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     */
    Update(crc = CanvasRenderingcontext2D.prototype) {
        crc.strokeStyle = LANDER_REC;
        crc.roundRect(this.R.x, this.R.y, this.R.width, this.R.height, 10);
        //only draw the last two top cards in the deck (save a little un-necessary processing)
        for (var sour = 0; sour < this.cards.length; sour++)
            if (sour > this.cards.length - 3)
                this.cards[sour].Update(crc);

    }


}

//#endregion

//#region variables
var _mycanvas = HTMLCanvasElement.prototype;    //html canvas control
var _crc = CanvasRenderingContext2D.prototype;  //2d rendering context interface
var _animi = [move_card.prototype];             //array of current cards to animate a move
var _fippl = [flip_card.prototype];             //array of current cards to animate a flip
var _Selected = card.prototype;                 //currently selected card
var _offset = point.prototype;                  //offset from the mouse pointer on the card, when dragging
var _hasMouse = false;                          //if we have captured the mouse on a card
var _currxy = point.prototype;                  //the last known position of the mouse, based on canvis coords
var _landerspecial = lander.prototype;          //special lander that's not visible when dealing or shuffeling the deck
var _highlightdrop;                             //for hilighting a drop (source or lander) to let the user know the card can go there
var _imgback;                                   //backside of the card
var _imgcardface;                               //map of all the card faces
var _imgtable;                                  //background image of the table
var _imgtoolbar;                                //map of all the buttons and states
var _Shufflebtn = imgbutton.prototype;          //Shuffle button
var _newGamebtn = imgbutton.prototype;          //New Game button
var _cheatbtn = imgbutton.prototype;            //Cheat button (reshuffle the source decks)
var _soundtgnbtn = imgbutton.prototype;         //Sound mute button (toggle button) (current does nothing, still need some audo files)
var _clearallbtn = imgbutton.prototype;         //clear all the current scores button
var _cheatedGame = false;                       //if someone has hit the cheat button
var _totalgames = 0;                            //counters for total games - pulled from local storage
var _totalWins = 0;                             //counters for total wins  - pulled from local storage
var _totalcheats = 0;                           //counters for total games cheated  - pulled from local storage
var _isredrawing = false;                       //if we are curretly redrawing the screen, keeping multiples from happining
var _landers = [                                //a list and location of all the landers
    new lander(HEART, new rect(190, 150, C_WIDTH, C_HEIGHT)),
    new lander(CLOVER, new rect(320, 150, C_WIDTH, C_HEIGHT)),
    new lander(DIAMOND, new rect(450, 150, C_WIDTH, C_HEIGHT)),
    new lander(SPADE, new rect(580, 150, C_WIDTH, C_HEIGHT))
];
var _sources = [                                //a list and loaciton of the the sources
    new source(new rect(60, 400, C_WIDTH, C_HEIGHT)),
    new source(new rect(190, 400, C_WIDTH, C_HEIGHT)),
    new source(new rect(320, 400, C_WIDTH, C_HEIGHT)),
    new source(new rect(450, 400, C_WIDTH, C_HEIGHT)),
    new source(new rect(580, 400, C_WIDTH, C_HEIGHT)),
    new source(new rect(710, 400, C_WIDTH, C_HEIGHT)),

    new source(new rect(60, 650, C_WIDTH, C_HEIGHT)),
    new source(new rect(190, 650, C_WIDTH, C_HEIGHT)),
    new source(new rect(320, 650, C_WIDTH, C_HEIGHT)),
    new source(new rect(450, 650, C_WIDTH, C_HEIGHT)),
    new source(new rect(580, 650, C_WIDTH, C_HEIGHT)),
    new source(new rect(710, 650, C_WIDTH, C_HEIGHT))
];

var d = function (id) {                         //quickhand of getting a item from the document
    return document.getElementById(id);
};

var mouse = function(e){                        //convert the mouse coords to current scale and location
    var rect = _mycanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var sclx = _mycanvas.width/_mycanvas.clientWidth ; //get a ratio
    var scly = _mycanvas.height/_mycanvas.clientHeight ;
    return new point(x*sclx,y*scly);
};

//#endregion

/**
 * sets up the canvas for starting the game
 * @param {string} id the canvas id to pull from
 */
function setupCanvas(id = 'thisCanvas') {
    _mycanvas = d(id);
    _crc = _mycanvas.getContext("2d");
    _imgback = d('cardback');
    _imgcardface = d('cardface');
    _imgtable = d('table');
    _imgtoolbar = d('toolbarback');

    _animi.pop();//get rid of the prototype items
    _fippl.pop();
    _Selected = null;
    _cheatedGame = false;

    //get stats
    _totalgames = Number(localStorage.getItem('total'));
    _totalWins = Number(localStorage.getItem("wins"));
    _totalcheats = Number(localStorage.getItem("cheats"));

    //see if there is a saved game in localstorage, if not start a new game
    if (localStorage.getItem('hassave')) {
        try {
            var sav=0;
            for (sav = 0; sav < _sources.length; sav++)
                _sources[sav].cards = cardsFromString(localStorage.getItem('s' + sav), _sources[sav].R.location);

            for (sav = 0; sav < _landers.length; sav++)
                _landers[sav].cards = cardsFromString(localStorage.getItem('l' + sav), _landers[sav].R.location);
        } catch (e) {
            newGame();
        }
    }
    else
        newGame();


    //set up the special invisable lander
    _landerspecial = new lander('', new rect(60, 150, C_WIDTH, C_HEIGHT));
    _landerspecial.cards = []; //by default a lander has a card, this one should not

    //add the buttons to the bar
    _newGamebtn = new imgbutton('toolbarbuttons', new rect(5, 0, 32, 32), _mycanvas, newGame, 1);
    _Shufflebtn = new imgbutton('toolbarbuttons', new rect(37, 0, 32, 32), _mycanvas, reshuffle, 0);
    _cheatbtn = new imgbutton('toolbarbuttons', new rect(69, 0, 32, 32), _mycanvas, cheat, 2);
    _soundtgnbtn = new imgbutton('toolbarbuttons', new rect(101, 0, 32, 32), _mycanvas, Soundtoggle, 3, true);
    _clearallbtn = new imgbutton('toolbarbuttons', new rect(863, 0, 32, 32), _mycanvas, clearallstats, 4);

    //this is virtual pixels, and not actuall screen pixels
    _mycanvas.width = 900;
    _mycanvas.height = 900;

    //set up the animation timer for 30ms, about 33 frames per second, not to tax the system too much
    setInterval(checkforAnimi, 30);


    /**
     * this needs delayed regraw just a bit, while everything loads
     */
    window.onload = function (event) {
        redraw();
    };

    /**
     * attempt to save the current game before it closes
     */
    window.onbeforeunload = function (event) {
        var sav= 0;
        for (sav = 0; sav < _sources.length; sav++)
            localStorage.setItem('s' + sav, cardsToString(_sources[sav].cards));

        for (sav = 0; sav < _landers.length; sav++)
            localStorage.setItem('l' + sav, cardsToString(_landers[sav].cards));

        localStorage.setItem('hassave', true);
    };

    /**
     * capture the mouse down event when grabbin cards
     * causes a redraw, always
     */
    _mycanvas.onmousedown = function (event) {
        if (event.buttons == 1) {
            var pt = mouse(event); 
  
            _Selected = findselected(pt);
            if (_Selected != null) {
                _offset = pt;
                //if the card is not flipped yet, start a new animation
                if (!_Selected.flipped) _fippl.push(new flip_card(_Selected));
                _hasMouse = true;
            }
            else
                _hasMouse = false;
        }
        redraw();
    };

    /**
     * capture the mouse move event, handy for flipping and draging cards
     * this will always cause a redraw trigger
     */
    _mycanvas.onmousemove = function (event) {
        _currxy = mouse(event);
        if (event.buttons == 1) {

            if (_hasMouse && _Selected != null) {
                //move the selected mouse around
                var cpt = _currxy.subtract(_offset); 
                _Selected.R.x += cpt.x;
                _Selected.R.y += cpt.y;
                _Selected.R.keepwithin(new rect(0, 0, _mycanvas.width, _mycanvas.height));
                _offset = _currxy;
                //can we drop the card on what's under the mouse?
                var drop = findAny(_Selected, findsource(drop), _currxy);
                if (drop != null)
                    _highlightdrop = drop;
                else
                    _highlightdrop = null;
            }
            else {
                _highlightdrop = null;
            }
        }
        else {
            _highlightdrop = null;
            //just mouse movement, check to see if any of the cards are not flipped
            for (var i = 0; i < _sources.length; i++) {
                if (_sources[i].R.contains(_currxy)) {
                    if (_sources[i].cards.length > 0) {
                        if (!_sources[i].cards.last().flipped) _fippl.push(new flip_card(_sources[i].cards.last()));
                    }
                }

            }

        }
        redraw();
    };

    /**
     * capture of hte mouse up, this might be a drop, set the selected 
     * card it's last location and check for end of game
     * this will always cause a redraw to trigger
     */
    _mycanvas.onmouseup = function (event) {
        if (_Selected != null) {

            var xy =mouse(event);
            var t = findsource(_Selected);
            if (t != null) {
                var drop = findAny(_Selected, t, xy);
                if (drop != null) {
                    var inx = t.cards.indexOf(_Selected);
                    t.cards.splice(inx, 1);
                    drop.cards.push(_Selected);
                    _Selected.R.x = drop.R.x;
                    _Selected.R.y = drop.R.y;
                    _Selected = null;
                    CheckEndOfGame();
                }
                else {
                    _Selected.R.x = t.R.x;
                    _Selected.R.y = t.R.y;
                }
            }
        }
        _hasMouse = false;
        _Selected = null;

        redraw();
    };

    /**
     * if we find a card with the double click, look for a place to dump
     * the card, if one is found, then start the animation to move the
     * card to it's new location
     * this will always cause a redraw to trigger
     */
    _mycanvas.ondblclick = function (event) {
        var pt = mouse(event);
        var sel = findselected(pt);
        if (sel != null) {
            var l = findlander(sel);
            var f = findsource(sel);
            if (l != null && l.cards.last().index + 1 == sel.index) {
                var inx = f.cards.indexOf(sel);
                f.cards.splice(inx, 1);
                _animi.push(new move_card(sel, l, 0));
            }
        }
        CheckEndOfGame();
        redraw();
    };

}

/**
 * clear all the stats (event is from the button click)
 */
function clearallstats() {
    _totalgames = 0;
    _totalWins = 0;
    _totalcheats = 0;
    localStorage.setItem("total", String(_totalgames));
    localStorage.setItem("wins", String(_totalWins));
    localStorage.setItem("cheats", String(_totalcheats));
}

/**
 * check to see if the game is over, and index some counters
 * it would be nice to put some trigger for a "you won" game animation in the future
 */
function CheckEndOfGame() {
    var cnt = 0;
    for (var a2 = 0; a2 < _sources.length; a2++) {
        cnt += _sources[a2].cards.length;
    }
    if (cnt == 0 && _landerspecial.cards.length == 0) {
        if (_cheatedGame)
            _totalcheats++;
        else
            _totalWins++;

        localStorage.setItem("wins", String(_totalWins));
        localStorage.setItem("cheats", String(_totalcheats));

    }
}

/**
 * creates a new game, clears all arrays, recreates the deck,
 * randomizes the cards and then starts the animation
 */
function newGame() {
    var ng=0;
    //clear any existing game going on
    for (ng = 0; ng < _landers.length; ng++) {
        _landers[ng] = new lander(_landers[ng].face, _landers[ng].R);
    }
    for (ng = 0; ng < _sources.length; ng++) {
        _sources[ng] = new source(_sources[ng].R);
    }
    _landerspecial.cards = [];
    _animi = [];
    _fippl = [];

    //creates 48 cards, 52- the 4 aces
    var cards = [];
    var ttp = [HEART, CLOVER, DIAMOND, SPADE];
    for (var j = 0; j < 4; j++) {
        for (var i = 0; i < 12; i++) {
            var c = new card(60 + i, 150 + i, ttp[j], i + 1);
            cards.push(c);
        }
    }
    shuffledeck(cards);
    for (var z = 0; z < 48; z++) {
        var indx = z % 12;
        _animi.push(new move_card(cards[z], _sources[indx], 48 - z));
    }

    _cheatedGame=false; //start fresh
    _totalgames++;
    localStorage.setItem("total", String(_totalgames));
}

/**
 * from the cheat button, causing the individule source decks to random shuffle thier own cards
 */
function cheat() {
    for (var qq = 0; qq < _sources.length; qq++) {
        shuffledeck(_sources[qq].cards);
    }
    reshuffle();
    _cheatedGame = true;
}

/**
 * stubbed out for future
 */
function Soundtoggle() {
    //temp'd out
}

/**
 * this gathers up all the cards be to the special lander and recounts out
 * all the cards for 4 to a deck or until it runs out of cards
 */
function reshuffle() {
    var tt = 0;
    for (var qq = 0; qq < _sources.length; qq++) {
        for (var j = 0; j < _sources[qq].cards.length; j++) {
            tt++;
            _animi.push(new move_card(_sources[qq].cards[j], _landerspecial, tt));
        }
        _sources[qq].cards = [];
    }

    //2.5 seconds to hold all the cards in the special deck
    //before moving the cards back to the decks
    setTimeout(() => {
        tt = 0;
        for (var qq = 0; qq < _sources.length; qq++) {
            var itms = _landerspecial.cards.splice(0, 4);
            for (var j = 0; j < itms.length; j++) {
                tt++;
                _animi.push(new move_card(itms[j], _sources[qq], tt));
            }
        }
    }, 2500);


}

/**
 * trys to find a lander or source deck the card can move to 
 * @param {card} item the card to look for a new home for
 * @param {source} fromsource where the card came from, so we can ignore that one
 * @param {point} pt the location of the mouse pointer
 * @returns {object} source or lander, or null is none found 
 */
function findAny(item = card.prototype, fromsource = source.prototype, pt = point.prototype) {
    var i =0;
    //check the landers first, they count up
    for (i = 0; i < _landers.length; i++) {
        if (_landers[i].face == item.face && _landers[i].R.contains(pt)) {
            if (_landers[i].cards.last().index + 1 == item.index) {
                return _landers[i];
            }
        }
    }
    //if nothing was found in landers,check sources, they down down
    for (i = 0; i < _sources.length; i++) {
        if (_sources[i].cards.length > 0 && _sources[i] != fromsource && _sources[i].R.contains(pt)) {
            var lc = _sources[i].cards.last();
            if (lc.index - 1 == item.index && lc.face == item.face) {
                return _sources[i];
            }
        }

    }
}

/**
 * trys to find if there is a card below the mouse
 * @param {point} pt where the mouse is currently
 * @returns {card} if a card is found, otherwise null
 */
function findselected(pt = point.prototype) {
    for (var k = 0; k < _sources.length; k++) {
        if (_sources[k].cards.length > 0) {
            var c = _sources[k].cards.last();
            if (c != null & c.R.contains(pt)) {
                return c;
            }
        }
    }
    return null;
}

/**
 * finds the source deck the card came from
 * @param {card} item item to reference
 * @returns {source}
 */
function findsource(item = card.prototype) {
    for (let sz of _sources) {
        if (sz.cards.indexOf(item) > -1)
            return sz;
    }
}

/**
 * finds the correct card lander match the face type
 * @param {card} item a card instance to find where the lander is 
 * @returns {lander}
 */
function findlander(item = card.prototype) {
    for (var i = 0; i < _landers.length; i++) {
        if (_landers[i].face == item.face) {
            return _landers[i];
        }

    }
}

/**
 * shuffels the deck psudo-randomly
 * @param {[card]} cardarray the deck to shuffle
 */
function shuffledeck(cardarray = [card.prototype]) {
    var cnt = cardarray.length;
    var temp;
    var rnd;

    while (0 != cnt) {
        rnd = Math.floor(Math.random() * cnt);
        cnt -= 1;
        temp = cardarray[cnt];
        cardarray[cnt] = cardarray[rnd];
        cardarray[rnd] = temp;
    }
}

/**
 * this is the timer function that will
 * check for any items that will need to be updated
 * and cause a redraw. no items = no redraw
 */
function checkforAnimi() {
    if (_animi.length > 0 || _fippl.length > 0) redraw(true);
}

/**
 * causes the redrawing of the screen
 * @param {boolean} istimer the two sources can call this: mouse and timer, and they need seperation
 */
function redraw(istimer = false) {
    //if another call is already trying to
    //draw the screen, ignore for now
    if (!_isredrawing) {
        _isredrawing = true;


        //draw background
        _crc.drawImage(_imgtable, 0, 0, _mycanvas.width, _mycanvas.height);

        var k =0;
        //draw the lander decks
        for (k = 0; k < _landers.length; k++) {
            _landers[k].Update(_crc);
        }

        //draw the source decks
        for (k = 0; k < _sources.length; k++) {
            _sources[k].Update(_crc);
        }

        //draw the special lander only if it has cards
        if (_landerspecial.cards.length > 0) {
            _landerspecial.Update(_crc);
        }

        //check on the card moving animations
        if (_animi.length > 0) {
            var cntr = 0;
            for (k = 0; k < _animi.length; k++) {
                if (!_animi[k].done) {
                    cntr++;
                    _animi[k].Update(_crc, istimer);
                }
            }
            if (cntr == 0) _animi = []; //clear the whole list all the animations done
        }

        //check on the card flip animations
        if (_fippl.length > 0) {
            var cntrf = 0;
            for (k = 0; k < _fippl.length; k++) {
                if (!_fippl[k].done) {
                    cntrf++;
                    _fippl[k].Update(_crc, istimer);
                }
            }
            if (cntrf == 0) _fippl = []; //clear the whole list all the animations done
        }

        //if the something is set for a highlight, show it
        if (_highlightdrop != null) {
            var r = _highlightdrop.R;
            _crc.fillStyle = C_HILIGHT;
            _crc.fillRect(r.x, r.y, r.width, r.height);
        }

        if (_Selected != null) {
            _crc.fillStyle = C_SHADE;
            createRoundedRecPath(_crc,_Selected.R.x+20,_Selected.R.y+20,_Selected.R.width,_Selected.R.height,10);
            _crc.fill();
            //_crc.fillRect(_Selected.R.x + 20, _Selected.R.y + 20, _Selected.R.width, _Selected.R.height);
            _Selected.Update(_crc);
        }

        //draw the toolbar
        _crc.drawImage(_imgtoolbar, 0, 0, 32, 32, 0, 0, _mycanvas.width, 32);

        //get and draw how many cards are left
        var cardcnt = 0;
        for (k = 0; k < _sources.length; k++)
            cardcnt += _sources[k].cards.length;

        //draw text on the title bar
        _crc.fillStyle = 'white';
        _crc.font = "20px Arial";
        _crc.textAlign = 'left';
        _crc.textBaseline = 'middle';
        var text = 'Cards remaining:' + cardcnt; //default text, unless the mouse is over one of the buttons

        if (_Shufflebtn.hasmouse())
            text = 'Reshuffle deck';
        else if (_newGamebtn.hasmouse())
            text = 'New game?';
        else if (_cheatbtn.hasmouse())
            text = 'Cheat and re-randomize remaining decks';
        else if (_soundtgnbtn.hasmouse()) {
            if (_soundtgnbtn.value)
                text = 'Toggle sound off';
            else
                text = 'Toggle sound on';
        }
        else if (_clearallbtn.hasmouse())
            text = "Clear all stats";

        //draw the stats
        _crc.fillText(text, 140, 16);
        _crc.textAlign = 'right';
        _crc.fillText('Total Games: ' + _totalgames + '  Won: ' + _totalWins + '  cheated: ' + _totalcheats, 863, 16);


        //redraw the button
        _Shufflebtn.update();
        _newGamebtn.update();
        _cheatbtn.update();
        _soundtgnbtn.update();
        _clearallbtn.update();
        _isredrawing = false;
    }
}


/**
 * convers a saved string back into an array of cards
 * @param {string} str a saved string of cards, to convert back
 * @param {point} location where to initally position a deck
 * @returns {[card]} an array of cards if successful
 */
function cardsFromString(str, location) {
    var cards = [];
    var s = str.split(',');
    for (var p=0;p<s.length;p++) {
        si = s[p];
        if (!si.isEmpty()) {
            var c = new card(location.x, location.y, si.substr(0, 1), Number(si.substring(1)));
            c.flipped =true;
            cards.push(c);
        }
    }
    return cards;
}

/**
 * converts an array of cards to a string that can be saved
 * @param {[card]} cards an array of cards
 * @returns {string} a saved string of items 
 */
function cardsToString(cards) {
    var outx = '';
    for (var p = 0; p < cards.length; p++) {
        outx += cards[p].face + cards[p].index + ',';
    }
    return outx;
}