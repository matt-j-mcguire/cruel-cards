/*jshint esversion: 6 */
const MAXCARDS = 52;
const C_WIDTH = 120;
const C_HEIGHT = 200;
const HEART = 'h';
const CLOVER = 'c';
const DIAMOND = 'd';
const SPADE = 's';
const C_SHADE = 'rgba(0,0,0,0.2)';
const LANDER_REC = 'gold';


class card {
    constructor(x = 0, y = 0, face = HEART, index = 0) {
        this.R = new rect(x, y, C_WIDTH, C_HEIGHT);
        this.flipped = false;
        this.startedflip = false;
        this.face = face;
        this.index = index;
        this.allowmove = true;
    }

    /**
     * draws the card
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     */
    Update(crc = CanvasRenderingcontext2D.prototype) {
        var r = this.R;
        var f = this.flipped;

        crc.save();
        crc.beginPath();
        var radi = 10;
        crc.moveTo(r.x + radi, r.y);
        crc.arcTo(r.x + r.width, r.y, r.x + r.width, r.y + r.height, radi);
        crc.arcTo(r.x + r.width, r.y + r.height, r.x, r.y + r.height, radi);
        crc.arcTo(r.x, r.y + r.height, r.x, r.y, radi);
        crc.arcTo(r.x, r.y, r.x + r.width, r.y, radi);
        crc.clip();

        crc.fillStyle = C_SHADE;
        crc.fillRect(r.x + 3, r.y + 3, r.width, r.height);

        if (!f) {
            crc.drawImage(_imgback, r.x, r.y, r.width, r.height);
        }
        else {
            var x = this.index;
            var y = 0;
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
                default://spade
                    y = 3;
                    break;
            }
            crc.drawImage(_imgcardface, x * C_WIDTH, y * C_HEIGHT, C_WIDTH, C_HEIGHT, r.x, r.y, r.width, r.height);
        }
        crc.restore();
    }

}

class flip_card {
    constructor(c = card.prototype) {
        this.card = c;
        this.done = c.startedflip; //just incese this card gets added to multiple 'flipps' only one will run
        this.index = 0;
        this.card.startedflip = true;
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
        if (this.index < 19) {
            if (this.index < 10) { //mid point in the turn
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
        crc.fillRect(r.x + 20, r.y + 20, r.width, r.height);
        this.card.Update(crc);
        return ret;
    }

}

class move_card {
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
        for (var i = 0; i < 20; i++) {
            this.steps.push(new point(c.R.x + (i * xaddr), c.R.y + (i * yaddr)));
        }
        this.steps.push(too_pt);
    }

    /**
     * updates the cards animation
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     * @return {boolean} true when animation is complete
     */
    Update(crc = CanvasRenderingcontext2D.prototype, isTimer = false) {
        var ret = false;

        if (this.delay > 0) {
            if (isTimer) this.delay--;
        }
        else {
            if (isTimer) this.index++;
            if (this.index >= this.steps.length) {
                this.end.cards.push(this.card);
                this.done = true;
                ret = true;
            }
            else {
                this.card.R.x = this.steps[this.index].x;
                this.card.R.y = this.steps[this.index].y;

            }
        }

        crc.fillStyle = C_SHADE;
        crc.fillRect(this.card.R.x + 20, this.card.R.y + 20, this.card.R.width, this.card.R.height);
        this.card.Update(crc);
        return ret;
    }
}

class lander {
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
     * does not return anything
     */
    Update(crc = CanvasRenderingcontext2D.prototype) {
        // crc.strokeStyle = LANDER_REC;
        // crc.roundRect(this.R.x, this.R.y, this.R.width, this.R.height, 10);

        // for (i = 0; i < this.cards.length; i++)
        //     this.cards[i].Update(crc);
        this.cards.last().Update(crc);
    }

}

class source {
    constructor(rec = rect.prototype) {
        this.R = rec;
        this.cards = [];
    }

    /**
     * updates the source deck
     * @param {CanvasRenderingcontext2D} crc the handel for where to render the item
     * does not return anything
     */
    Update(crc = CanvasRenderingcontext2D.prototype) {
        crc.strokeStyle = LANDER_REC;
        crc.roundRect(this.R.x, this.R.y, this.R.width, this.R.height, 10);
        for (var sour = 0; sour < this.cards.length; sour++)
            if (sour > this.cards.length - 3)
                this.cards[sour].Update(crc);

    }


}


var _mycanvas = HTMLCanvasElement.prototype;    //html canvas control
var _crc = CanvasRenderingContext2D.prototype;  //2d rendering context interface
var _animi = [move_card.prototype];
var _fippl = [flip_card.prototype];
var _Selected = card.prototype;
var _offset = point.prototype;
var _hasMouse = false;
var _currxy = point.prototype;
var _landerspecial = lander.prototype;
var _highlightdrop;
var _imgback;
var _imgcardface;
var _imgtable;
var _imgtoolbar;
var _Shufflebtn = imgbutton.prototype;
var _newGamebtn = imgbutton.prototype;
var _cheetbtn = imgbutton.prototype;
var _soundtgnbtn = imgbutton.prototype;
var _clearallbtn = imgbutton.prototype;
var _cheetedGame = false;
var _totalgames = 0;
var _totalWins = 0;
var _totalCheets = 0;
var _isredrawing = false;

var _landers = [
    new lander(HEART, new rect(190, 150, C_WIDTH, C_HEIGHT)),
    new lander(CLOVER, new rect(320, 150, C_WIDTH, C_HEIGHT)),
    new lander(DIAMOND, new rect(450, 150, C_WIDTH, C_HEIGHT)),
    new lander(SPADE, new rect(580, 150, C_WIDTH, C_HEIGHT))
];

var _sources = [
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

var d = function (id) {
    return document.getElementById(id);
};

function setupCanvas(id = 'thisCanvas') {
    _mycanvas = document.getElementById(id);
    _crc = _mycanvas.getContext("2d");

    _imgback = d('cardback');
    _imgcardface = d('cardface');
    _imgtable = d('table');
    _imgtoolbar = d('toolbarback');

    _animi.pop();//get rid of the prototype items
    _fippl.pop();
    _Selected = null;
    _cheetedGame = false;

    _totalgames = Number(localStorage.getItem('total'));
    _totalWins = Number(localStorage.getItem("wins"));
    _totalCheets = Number(localStorage.getItem("cheets"));

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



    _landerspecial = new lander('', new rect(60, 150, C_WIDTH, C_HEIGHT));
    _landerspecial.cards = []; //by default a lander has a card, this one should not

    _newGamebtn = new imgbutton('toolbarbuttons', new rect(5, 0, 32, 32), _mycanvas, newGame, 1);
    _Shufflebtn = new imgbutton('toolbarbuttons', new rect(37, 0, 32, 32), _mycanvas, reshuffle, 0);
    _cheetbtn = new imgbutton('toolbarbuttons', new rect(69, 0, 32, 32), _mycanvas, Cheet, 2);
    _soundtgnbtn = new imgbutton('toolbarbuttons', new rect(101, 0, 32, 32), _mycanvas, Soundtoggle, 3, true);
    _clearallbtn = new imgbutton('toolbarbuttons', new rect(863, 0, 32, 32), _mycanvas, clearallstats, 4);

    _mycanvas.width = 900;
    _mycanvas.height = 900;
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

    _mycanvas.onmousedown = function (event) {
        if (event.buttons == 1) {
            var pt = new point(event.x - _mycanvas.offsetLeft, event.y - _mycanvas.offsetTop);

            _Selected = findselected(pt);
            if (_Selected != null) {
                _offset = pt;
                if (!_Selected.flipped) _fippl.push(new flip_card(_Selected));
                _hasMouse = true;
            }
            else
                _hasMouse = false;
        }
        redraw();
    };

    _mycanvas.onmousemove = function (event) {
        _currxy = new point(event.x - _mycanvas.offsetLeft, event.y - _mycanvas.offsetTop);
        if (event.buttons == 1) {

            if (_hasMouse && _Selected != null) {
                var cpt = new point(event.x - _mycanvas.offsetLeft, event.y - _mycanvas.offsetTop).subtract(_offset);
                _Selected.R.x += cpt.x;
                _Selected.R.y += cpt.y;
                _Selected.R.keepwithin(new rect(0, 0, _mycanvas.width, _mycanvas.height));
                _offset = _currxy;
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
            //just mouse movement
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

    _mycanvas.onmouseup = function (event) {
        if (_Selected != null) {

            var xy = new point(event.x - _mycanvas.offsetLeft, event.y - _mycanvas.offsetTop);
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

    _mycanvas.ondblclick = function (event) {
        var pt = new point(event.x - _mycanvas.offsetLeft, event.y - _mycanvas.offsetTop);
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

function clearallstats() {
    _totalgames = 0;
    _totalWins = 0;
    _totalCheets = 0;
    localStorage.setItem("total", String(_totalgames));
    localStorage.setItem("wins", String(_totalWins));
    localStorage.setItem("cheets", String(_totalCheets));
}

function CheckEndOfGame() {
    var cnt = 0;
    for (var a2 = 0; a2 < _sources.length; a2++) {
        cnt += _sources[a2].cards.length;
    }
    if (cnt == 0 && _landerspecial.cards.length == 0) {
        if (_cheetedGame)
            _totalCheets++;
        else
            _totalWins++;

        localStorage.setItem("wins", String(_totalWins));
        localStorage.setItem("cheets", String(_totalCheets));

    }
}


/**
 * creates a new game, clears all arrays, recreates the deck,
 * randomizes the cards and then starts the animation
 */
function newGame() {
    var ng=0;
    for (ng = 0; ng < _landers.length; ng++) {
        _landers[ng] = new lander(_landers[ng].face, _landers[ng].R);
    }
    for (ng = 0; ng < _sources.length; ng++) {
        _sources[ng] = new source(_sources[ng].R);
    }
    _landerspecial.cards = [];
    _animi = [];
    _fippl = [];

    //creates 52 cards
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

    _totalgames++;
    localStorage.setItem("total", String(_totalgames));

}


function reload() {
    location.reload();
}


function Cheet() {
    for (var qq = 0; qq < _sources.length; qq++) {
        shuffledeck(_sources[qq].cards);
    }
    reshuffle();
    _cheetedGame = true;
}


function Soundtoggle() {
    //temp'd out
}


function reshuffle() {
    var tt = 0;
    for (var qq = 0; qq < _sources.length; qq++) {
        for (var j = 0; j < _sources[qq].cards.length; j++) {
            tt++;
            _animi.push(new move_card(_sources[qq].cards[j], _landerspecial, tt));
        }
        _sources[qq].cards = [];
    }

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


function findAny(item = card.prototype, fromsource = source.prototype, pt = point.prototype) {
    var i =0;
    for (i = 0; i < _landers.length; i++) {
        if (_landers[i].face == item.face && _landers[i].R.contains(pt)) {
            if (_landers[i].cards.last().index + 1 == item.index) {
                return _landers[i];
            }
        }
    }
    for (i = 0; i < _sources.length; i++) {
        if (_sources[i].cards.length > 0 && _sources[i] != fromsource && _sources[i].R.contains(pt)) {
            var lc = _sources[i].cards.last();
            if (lc.index - 1 == item.index && lc.face == item.face) {
                return _sources[i];
            }
        }

    }
}


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


function findsource(item = card.prototype) {
    for (let sz of _sources) {
        if (sz.cards.indexOf(item) > -1)
            return sz;
    }
}

/**
 * finds the correct card lander match the face type
 * @param {card} item a card instance to find where the lander is 
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
 * does not return anything
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
 * -does not return anything
 */
function checkforAnimi() {
    if (_animi.length > 0 || _fippl.length > 0) redraw(true);
}

/**
 * causes the redrawing of the screen
 * -does not return anything
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



        if (_highlightdrop != null) {
            var r = _highlightdrop.R;
            _crc.fillStyle = 'rgba(48, 176, 255,0.4)';
            _crc.fillRect(r.x, r.y, r.width, r.height);
        }

        if (_Selected != null) {
            _crc.fillStyle = C_SHADE;
            _crc.fillRect(_Selected.R.x + 20, _Selected.R.y + 20, _Selected.R.width, _Selected.R.height);
            _Selected.Update(_crc);
        }

        //draw the toolbar
        _crc.drawImage(_imgtoolbar, 0, 0, 32, 32, 0, 0, _mycanvas.width, 32);

        //get and draw how many cards are left
        var cardcnt = 0;
        for (k = 0; k < _sources.length; k++)
            cardcnt += _sources[k].cards.length;

        _crc.fillStyle = 'white';
        _crc.font = "20px Arial";
        _crc.textAlign = 'left';
        _crc.textBaseline = 'middle';
        var text = 'Cards remaining:' + cardcnt;

        if (_Shufflebtn.hasmouse())
            text = 'Reshuffle deck';
        else if (_newGamebtn.hasmouse())
            text = 'New game?';
        else if (_cheetbtn.hasmouse())
            text = 'Cheet and re-randomize remaining decks';
        else if (_soundtgnbtn.hasmouse()) {
            if (_soundtgnbtn.value)
                text = 'Toggle sound off';
            else
                text = 'Toggle sound on';
        }
        else if (_clearallbtn.hasmouse())
            text = "Clear all stats";

        _crc.fillText(text, 140, 16);
        _crc.textAlign = 'right';
        _crc.fillText('Total Games: ' + _totalgames + '  Won: ' + _totalWins + '  Cheeted: ' + _totalCheets, 863, 16);


        //redraw the button
        _Shufflebtn.update();
        _newGamebtn.update();
        _cheetbtn.update();
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