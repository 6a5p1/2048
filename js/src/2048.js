UT.Games = UT.Games || {};

UT.Games['2048'] = (function() {

    "use strict";

    // constants
    var KEY = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };
    var PREFIX = 'g2o48_';

    return UT.View.extend({
        init: function() {
            this.el.setAttribute('tabindex', '1');
            this.el.style.outline = 'none';
            this.el.focus();
            this.createHtml();
            this.start();
            return this;
        },
        defaults: {
            size: 4
        },
        events: {
            'click'                      : function() { this.el.focus(); },
            'keydown'                    : 'onKeyPress',
            'click      .g2o48_new-game' : 'start',
            'click      .g2o48_undo'     : 'undo',
            'click      .g2o48_auto'     : 'doAuto',
            'swipeleft  .g2o48_game'     : function() { this.do('left') },
            'swiperight .g2o48_game'     : function() { this.do('right') },
            'swipedown  .g2o48_game'     : function() { this.do('down') },
            'swipeup    .g2o48_game'     : function() { this.do('up') }
        },
        changeGridSize: function(size) {
            if (size < 2 || size > 6) return;
            this.options.size = size || 4;
            this.createHtml();
            this.start();
        },
        onKeyPress: function(e) {
            e.preventDefault();
            e.stopPropagation();
            switch (e.keyCode) {
                case KEY.LEFT: return this.do('left');
                case KEY.RIGHT: return this.do('right');
                case KEY.UP: return this.do('up');
                case KEY.DOWN: return this.do('down');
            }
        },
        clearInterval: function() {
            clearInterval(this._interval);
            this._interval = null;
        },
        start: function() {
            this.clearInterval();
            this.matrix = [];
            this.historyArray = [];
            this.scoreArray = [];
            this.score = 0;
            this.move = 0;
            var i, j;
            for (i = 0; i < this.options.size; i++) {
                this.matrix[i] = new Array(this.options.size)
                for (j = 0; j < this.options.size; j++) {
                    this.matrix[i][j] = 0;
                }
            }
            this.addNumber();
            this.addNumber();
            this.pushIntoHistory();
            this.refreshTable();
        },
        pushIntoHistory: function() {
            this.historyArray[this.move] = UT.cloneDeep(this.matrix);
            this.scoreArray[this.move] = this.score;
            this.move++;
        },
        afterMove: function(anyMoveMade, direction) {
            if (anyMoveMade === true) {
                var coords = this.addNumber();
                this.pushIntoHistory();
                this.refreshTable(coords, direction);
                this.testForAvailableMoves();
            }
        },
        areMovesAvailable: function() {
            var i, j;
            for (i = 0; i < this.options.size; i++) {
                for (j = 0; j < this.options.size; j++) {
                    if (this.matrix[i][j] === 0) {
                        return true;
                    }
                    if (j < this.options.size - 1 && this.matrix[i][j] === this.matrix[i][j + 1]) {
                        return true;
                    }
                    if (i < this.options.size - 1 && this.matrix[i][j] === this.matrix[i + 1][j]) {
                        return true;
                    }
                }
            }
            return false;
        },
        testForAvailableMoves: function() {
            if (!this.areMovesAvailable()) {
                setTimeout(function() {
                    alert('Game over! Your score is: ' + this.score);
                }.bind(this), 100);
            }
        },
        isEmptySquare: function() {
            var i, j;
            for (i = 0; i < this.options.size; i++) {
                for (j = 0; j < this.options.size; j++) {
                    if (this.matrix[i][j] === 0) {
                        return true;
                    }
                }
            }
            return false;
        },
        /**
         * return the position of the added number
         */
        addNumber: function() {
            if (!this.isEmptySquare()) {
                return {};
            }

            var x, y, z;
            do {
                x = Math.floor((Math.random() * this.options.size));
                y = Math.floor((Math.random() * this.options.size));
                z = UT.getProbability(90) ? 2 : 4;
            } while(this.matrix[x][y] !== 0)

            this.matrix[x][y] = z;

            return { x: x, y: y };
        },
        swapMatrixCells: function(oldX, oldY, newX, newY) {
            var swap = this.matrix[oldX][oldY];
            this.matrix[oldX][oldY] = this.matrix[newX][newY];
            this.matrix[newX][newY] = swap;
        },
        removeBlanks: function(line, direction) {
            var j, k, anymove = false;
            if (direction === 'right') {
                for (j = 0; j < this.options.size; j++) {
                    if (this.matrix[line][j] === 0) {
                        for (k = j; k >= 1; k--) {
                            anymove = anymove || (this.matrix[line][k] !== this.matrix[line][k-1]);
                            this.swapMatrixCells(line, k, line, k-1);
                        }
                    }
                }
            } else if (direction === 'left') {
                for (j = this.options.size - 1; j >= 0; j--) {
                    if (this.matrix[line][j] === 0) {
                        for (k = j; k < this.options.size - 1; k++) {
                            anymove = anymove || (this.matrix[line][k] !== this.matrix[line][k+1]);
                            this.swapMatrixCells(line, k, line, k+1);
                        }
                    }
                }
            } else if (direction === 'up') {
                for (j = this.options.size - 1; j >= 0; j--) {
                    if (this.matrix[j][line] === 0) {
                        for (k = j; k < this.options.size - 1; k++) {
                            anymove = anymove || (this.matrix[k][line] !== this.matrix[k+1][line]);
                            this.swapMatrixCells(k, line, k+1, line);
                        }
                    }
                }
            } else if (direction === 'down') {
                for (j = 0; j < this.options.size; j++) {
                    if (this.matrix[j][line] === 0) {
                        for (k = j; k >= 1; k--) {
                            anymove = anymove || (this.matrix[k][line] !== this.matrix[k-1][line]);
                            this.swapMatrixCells(k, line, k-1, line);
                        }
                    }
                }
            }
            return anymove;
        },



        /* AUTO feature */
        doAuto: function() {
            if (this._interval) return this.clearInterval();
            this._interval = setInterval(function() {
                var direction = this.getBestMove();
                if (direction) return this.do(direction);
                this.clearInterval();
            }.bind(this), 100)
        },
        getBestMove: function() {
            var oldArray = UT.cloneDeep(this.matrix);
            var position;
            var max = -1, sum;

            if (this.do('right', true)) {
                sum = this.getScore();
                if (sum > max) {
                    max = sum;
                    position = 'right';
                }
            }
            this.matrix = UT.cloneDeep(oldArray);

            if (this.do('down', true)) {
                sum = this.getScore();
                if (sum > max) {
                    max = sum;
                    position = 'down';
                }
            }
            this.matrix = UT.cloneDeep(oldArray);

            if (this.do('left', true)) {
                sum = this.getScore();
                if (sum > max) {
                    max = sum;
                    position = 'left';
                }
            }
            this.matrix = UT.cloneDeep(oldArray);
            if (this.do('up', true)) {
                sum = this.getScore();
                if (sum > max) {
                    max = sum;
                    position = 'up';
                }
            }
            this.matrix = UT.cloneDeep(oldArray);

            return position;
        },
        getScore: function() {
            var index, i, j,
                empty = 0, monoMax = 0, gradMax = 0, max = 0, combo = 0,
                mono = { down: 0, left: 0, up: 0, right: 0 },
                grad = { topLeft: 0, bottomRight: 0, topRight: 0, bottomLeft: 0 };

            for (i = 0; i < this.options.size; i++) {
                for (j = 0; j < this.options.size; j++) {

                    // max
                    if (max < this.matrix[i][j]) {
                        max = this.matrix[i][j];
                    }

                    // empty
                    empty += !!(this.matrix[i][j] === 0);

                    // monotonicity
                    if (i < this.options.size - 1) {
                        mono.up += !!(this.matrix[i][j] > this.matrix[i+1][j]);
                        mono.down += !!(this.matrix[i][j] < this.matrix[i+1][j]);
                        combo += !!(this.matrix[i][j] === this.matrix[i+1][j]);
                    }
                    if (j < this.options.size - 1) {
                        mono.left += !!(this.matrix[i][j] > this.matrix[i][j+1]);
                        mono.right += !!(this.matrix[i][j] < this.matrix[i][j+1]);
                        combo += !!(this.matrix[i][j] === this.matrix[i][j+1]);
                    }

                    // gradients
                    if (i < this.options.size - 1 && j < this.options.size - 1) {
                        grad.topLeft = grad.topLeft && (this.matrix[i][j] >= this.matrix[i][j+1] && this.matrix[i][j] >= this.matrix[i+1][j]);
                        grad.bottomRight = grad.bottomRight && (this.matrix[i][j] <= this.matrix[i][j+1] && this.matrix[i][j] <= this.matrix[i+1][j]);
                        grad.topRight = grad.topRight && (this.matrix[i][j] <= this.matrix[i][j+1] && this.matrix[i][j] >= this.matrix[i+1][j]);
                        grad.bottomLeft = grad.bottomLeft && (this.matrix[i][j] >= this.matrix[i][j+1] && this.matrix[i][j] <= this.matrix[i+1][j]);
                    }
                }
            }


            for (index in mono) {
                if (mono[index] > monoMax) {
                    monoMax = mono[index];
                }
            }

            var gradBool = false;
            for (index in grad) {
                if (grad[index] > gradMax) {
                    gradMax = grad[index];
                }
                gradBool = gradBool || grad[index];
            }

            return max * (empty+combo);
        },
        /* END OF AUTO feature */


        do: function(direction, ignoreUI) {
            var clone = UT.cloneDeep(this.matrix), j;
            for (var i = 0; i < this.options.size; i++) {
                // remove blanks
                this.removeBlanks(i, direction)
                // try sum
                if (direction === 'right') {
                    for (j = this.options.size - 1; j >= 1; j--) {
                        if (this.matrix[i][j] === this.matrix[i][j-1] && this.matrix[i][j]) {
                            this.matrix[i][j] = this.matrix[i][j] + this.matrix[i][j-1];
                            this.score += this.matrix[i][j];
                            this.matrix[i][j-1] = 0;
                        }
                    }
                } else if (direction === 'left') {
                    for (j = 0; j < this.options.size - 1; j++) {
                        if (this.matrix[i][j] === this.matrix[i][j+1] && this.matrix[i][j]) {
                            this.matrix[i][j] = this.matrix[i][j] + this.matrix[i][j+1];
                            this.score += this.matrix[i][j];
                            this.matrix[i][j+1] = 0;
                        }
                    }
                } else if (direction === 'up') {
                    for (j = 0; j < this.options.size - 1; j++) {
                        if (this.matrix[j][i] === this.matrix[j+1][i] && this.matrix[j][i]) {
                            this.matrix[j][i] = this.matrix[j][i] + this.matrix[j+1][i];
                            this.score += this.matrix[j][i];
                            this.matrix[j+1][i] = 0;
                        }
                    }
                } else if (direction === 'down') {
                    for (j = this.options.size - 1; j >= 1; j--) {
                        if (this.matrix[j][i] === this.matrix[j-1][i] && this.matrix[j][i]) {
                            this.matrix[j][i] = this.matrix[j][i] + this.matrix[j-1][i]
                            this.score += this.matrix[j][i]
                            this.matrix[j-1][i] = 0
                        }
                    }
                }
                // remove blanks
                this.removeBlanks(i, direction)
            }

            // add number if there was at least one move
            var moveMade = !UT.arraysEqual(this.matrix, clone);
            if (ignoreUI !== true) {
                this.afterMove(moveMade, direction);
            }
            return moveMade;
        },
        createHtml: function() {
            this.el.innerHTML = UT.template('' +
                '<div class="<%= prefix %>header <%= prefix %>wrapper">' +
                    '<div class="<%= prefix %>1_3">' +
                        '<div class="<%= prefix %>line">' +
                            '<button class="<%= prefix %>new-game <%= prefix %>btn">New game</button>' +
                        '</div>' +
                        '<div class="<%= prefix %>line">' +
                            '<button class="<%= prefix %>undo <%= prefix %>btn">Undo</button>' +
                        '</div>' +
                        '<div class="<%= prefix %>line">' +
                            '<button class="<%= prefix %>auto <%= prefix %>btn">Auto</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="<%= prefix %>1_3">' +
                        '<h1 class="<%= prefix %>title">2048</h1>' +
                        '<div class="<%= prefix %>subtitle">by 6a5p1</div>' +
                    '</div>' +
                    '<div class="<%= prefix %>1_3">' +
                        '<div class="<%= prefix %>line">' +
                            '<div class="<%= prefix %>score-wr <%= prefix %>btn">Score: <div class="<%= prefix %>score"></div></div>' +
                        '</div>' +
                        '<div class="<%= prefix %>line">' +
                            '<div class="<%= prefix %>moves-wr <%= prefix %>btn">Moves: <br><span class="<%= prefix %>moves"></span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="<%= prefix %>game <%= prefix %>wrapper <%= prefix %>game_' + this.options.size + '"></div>',
                {
                    prefix: PREFIX
                }
            );

            this.els = {
                grid: this.q('.' + PREFIX + 'game'),
                score: this.q('.' + PREFIX + 'score'),
                moves: this.q('.' + PREFIX + 'moves')
            };
        },
        refreshTable: function (obj, direction) {
            var i, j, className, value, inlineText = '';
            direction = direction ? PREFIX + direction : '';
            for (i = 0; i < this.options.size; i++) {
                for (j = 0; j < this.options.size; j++) {
                    className = '';
                    if (obj && i === obj.x && j === obj.y) {
                        className += UT.template(' <%= prefix %>appear ', { prefix: PREFIX });
                    } else if (this.move > 1 && this.matrix[i][j] && this.matrix[i][j] != this.historyArray[this.move-2][i][j]) {
                        className += direction + ' ';
                    }
                    value = this.matrix[i][j] || '';
                    className += UT.template('<%= prefix %>field <%= prefix %>num<%= value %>', {
                        prefix: PREFIX,
                        value: value
                    });
                    inlineText += '<div class="' + className + '">' + value + '</div>';
                }
            }
            this.els.grid.innerHTML = inlineText;
            this.els.score.innerHTML = this.score;
            this.els.moves.innerHTML = this.move - 1;
        },
        undo: function() {
            if (this.move - 1 > 0) {
                this.move--;
                this.matrix = UT.cloneDeep(this.historyArray[this.move - 1]);
                this.score = this.scoreArray[this.move - 1];
                this.refreshTable()
            }
        }
    });

})();
