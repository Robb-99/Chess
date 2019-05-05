class LocalGame extends Phaser.Scene {
	constructor(){
		super({key: "LocalGame"});
	}
	preload(){
		this.player1 = new Player(1);
		this.player2 = new Player(2);
		this.load.image('boardSides', 'assets/boardSides.png');
		this.load.image('whiteTile', 'assets/whiteTile.png');
		this.load.image('brownTile', 'assets/brownTile.png');
		this.load.image('focus', 'assets/focus.png');
		this.load.image('hit', 'assets/hit.png');
		this.load.image('whitePeasant', 'assets//figures/whitePeasant.png');
		this.load.image('whiteJumper', 'assets/figures/whiteJumper.png');
		this.load.image('whiteKing', 'assets/figures/whiteKing.png');
		this.load.image('whiteLady', 'assets/figures/whiteLady.png');
		this.load.image('whiteRunner', 'assets/figures/whiteRunner.png');
		this.load.image('whiteTower', 'assets/figures/whiteTower.png');

		this.load.image('blackPeasant', 'assets//figures/blackPeasant.png');
		this.load.image('blackJumper', 'assets/figures/blackJumper.png');
		this.load.image('blackKing', 'assets/figures/blackKing.png');
		this.load.image('blackLady', 'assets/figures/blackLady.png');
		this.load.image('blackRunner', 'assets/figures/blackRunner.png');
		this.load.image('blackTower', 'assets/figures/blackTower.png');
		this.boardMatrix = new Array(8);
		for (let i = 0; i < this.boardMatrix.length; i++) {
			this.boardMatrix[i] = [];
		}
		let recentX = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
		let recentY = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
		let tileDesignation = "8A";
		for(let i = 0; i < 8; i++){
			for(let d = 0; d < 8; d++){
				if(i % 2 !== 0){
					var recentGround = (d % 2 !== 0) ? 'brownTile' : 'whiteTile';
				}
				else{
					var recentGround = (d % 2 === 0) ? 'brownTile' : 'whiteTile';
				}
				this.boardMatrix[i][d] = {
					indX: d,
					indY: i,
					x: recentX,
					y: recentY,
					ground: recentGround,
					designation: tileDesignation,
					figure: null,
					moveable: false
				};
				recentX += TILE_SIZE;
				tileDesignation = tileDesignation[0] + String.fromCharCode(tileDesignation.charCodeAt(1) + 1);
			}
			recentY += TILE_SIZE;
			recentX = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
			tileDesignation = tileDesignation[0] - 1 + "A";
		}
	}

	create(){
		this.add.sprite(config.height / 2, config.width / 2, 'boardSides');
		this.boardMatrix.forEach(row => {
			row.forEach(tile => {
				this.add.sprite(tile.x, tile.y, tile.ground);
			})
		})
		this.initFiguresOnMatrix(this.player1);
		this.initFiguresOnMatrix(this.player2);
		this.turn = 1;
		document.getElementById('turn').innerHTML = "Aktueller Spieler: <b> Spieler " + this.turn + "</b>";
		this.focus = this.add.sprite(10000, 10000, 'focus');
		this.focus.alpha -= 0.7;
		this.focusedTile = null;
		this.input.on('pointerdown', event => {
			let clickedTile = this.getClickedTile(event);
			//Triggers when the user clicks out of the field
			if(clickedTile === "Out of bounds"){
				this.defocus();
				return;
			}
			//Triggers when the user moves a figure
			else if(this.focusedTile !== null && clickedTile.figure === null && clickedTile.moveable){
				this.move(clickedTile);
				return;
			}
			//Triggers when the user wants to beat another figure
			else if(clickedTile.figure !== null && clickedTile.figure.figure.hitable){
				this.removeFigure(clickedTile.figure.figure);
				this.move(clickedTile);
				return;
			}
			//Triggers when the user clicks on an opponents figure or an empty tile
			else if (clickedTile.figure === null || clickedTile.figure.figure.team !== this.turn){ 
				this.defocus();
				return
			};
			this.focusFigure(clickedTile);
		})
	}

	getClickedTile(event){
		if(event.x < BORDER_SIZE + RELATIVE_BORDER_POSITION || event.y < BORDER_SIZE  + RELATIVE_BORDER_POSITION) return "Out of bounds";
		for(let row of this.boardMatrix){
			for(let tile of row){
				if((tile.x > event.x + (TILE_SIZE / 2) || tile.x > event.x - (TILE_SIZE / 2)) && (tile.y > event.y + (TILE_SIZE / 2) || tile.y > event.y - (TILE_SIZE / 2))) return tile;
			}
		}
		return "Out of bounds";
	}

	/*
	 Updates the matrix and moves the sprite
	 @param clickedTile: Tile the user wants to move the figure
	 */
	 move(newTile){
	 	let isTransforming = this.focusedTile.figure.figure.move(newTile.indX, newTile.indY);
	 	newTile.figure = this.focusedTile.figure;
	 	this.focusedTile.figure = null;
	 	newTile.figure.sprite.x = this.boardMatrix[newTile.figure.figure.positionY][newTile.figure.figure.positionX].x;
	 	newTile.figure.sprite.y = this.boardMatrix[newTile.figure.figure.positionY][newTile.figure.figure.positionX].y;
	 	this.defocus();

	 	if(isTransforming){
	 		newTile.figure.figure.transform();
	 	}

	 	document.getElementById('lastTurn').innerHTML = "<b>" + newTile.figure.figure.type + "</b> von <b> Spieler" + newTile.figure.figure.team + "</b> auf Feld <b>" + newTile.designation + "</b> verschoben!";
	 	this.changePlayerTurn();
	 }

	 focusFigure(clickedTile){
	 	this.defocus();
	 	this.focus.x = clickedTile.x;
	 	this.focus.y = clickedTile.y;
	 	this.focusedTile = clickedTile;
	 	this.moveableTile(this.focusedTile.figure.figure);
	 	document.getElementById('focus').innerHTML = "Im Fokus: <b>" + this.focusedTile.figure.figure.type + "</b> von <b> Spieler" + this.focusedTile.figure.figure.team + "</b> auf Feld <b>" + this.focusedTile.designation + "</b>";
	 }

	 moveableTile(figure){
	 	let moveable = figure.determineMovePossibilities();
	 	this.moveableSprites = new Array();
	 	this.hitmarker = new Array();
	 	let x = this["player" + figure.team]["apply" + figure.type + "Possibilities"]();
	 	x.call(this, figure, moveable);
	 	this.transparentMarker();
	 }

	 defocus(){
	 	if(this.focusedTile === null) return;

	 	this.focus.x = 10000;
	 	this.focus.y = 10000;
	 	this.focusedTile = null;
	 	document.getElementById('focus').innerHTML = null;

	 	this.boardMatrix.forEach(row => {
	 		row.forEach(tile => {
	 			tile.moveable = false;
	 		})
	 	})

	 	this.boardMatrix.forEach(row => {
	 		row.forEach(tile => {
	 			if (tile.figure !== null){
	 				tile.figure.figure.hitable = false;
	 			}
	 		})
	 	})

	 	this.moveableSprites.forEach(sprite => {
	 		sprite.destroy();
	 	})

	 	this.hitmarker.forEach(sprite => {
	 		sprite.destroy();
	 	})
	 }

	 changePlayerTurn(){
	 	this.turn = (this.turn === 1) ? 2 : 1;
	 	document.getElementById('turn').innerHTML = "Aktueller Spieler: <b> Spieler " + this.turn + "</b>";
	 }

	 removeFigure(figure){
	 	this.boardMatrix[figure.positionY][figure.positionX].figure.sprite.destroy();
	 	this.boardMatrix[figure.positionY][figure.positionX].figure = null;
	 	figure.isAlive = false;
	 }

	 transparentMarker(){
	 	this.moveableSprites.forEach(moveableFocus =>{
			moveableFocus.alpha -= 0.7;
		})
		this.hitmarker.forEach(hit =>{
			hit.alpha -= 0.2;
		})
	 }

	 initFiguresOnMatrix(player){
	 	Object.values(player.figureList).forEach(type => {
	 		type.forEach(figure => {
	 			let tile = this.boardMatrix[figure.positionY][figure.positionX];
	 			tile.figure = {
	 				sprite: this.add.sprite(tile.x, tile.y, figure.asset),
	 				figure: figure
	 			};
	 		})
	 	})
	}

	tilesAroundFigure(figure){
		let x = new Array();
		let operators = {
			'+': function(a, b){return a + b},
			'-': function(a, b){return a - b},
			'=': function(a, b){return a}
		}
		for(let i = 0; i < 8; i++){
			let firstOperator;
			let secondOperator;
			if(i === 0 || i === 4){
				firstOperator = operators['='];
				if(i === 0) secondOperator = operators['-'];
				else if(i === 4) secondOperator = operators['+'];
			}
			else if(i <= 3) {
				firstOperator = operators['+'];
				if(i === 1) secondOperator = operators['-'];
				else if(i === 2) secondOperator = operators['='];
				else if(i === 3) secondOperator = operators['+'];
			}
			else{
				firstOperator = operators['-'];
				if(i === 5) secondOperator = operators['+'];
				else if(i === 6) secondOperator = operators['='];
				else if(i === 7) secondOperator = operators['-'];
			}

			try{
				let tile = this.boardMatrix[firstOperator(figure.positionY, 1)][secondOperator(figure.positionX, 1)];
				x.push(tile);
			}
			catch(err){}
		}
		return x;
	}
}


class Player{
	constructor(number){
		this.number = number;
		var startLane = (this.number === 1) ? 7 : 0;
		let peasantList = new Array();
		for(let i = 0; i < 8; i++){
			this.number === 1 ? peasantList.push(new Peasant(i, startLane - 1, 1)) : peasantList.push(new Peasant(i, startLane + 1, 2));
		}
		this.figureList = {
			Peasant: peasantList,
			Tower: [new Tower(0, startLane, this.number), new Tower(7, startLane, this.number)],
			Jumper: [new Jumper(1, startLane, this.number), new Jumper(6, startLane, this.number)],
			Runner: [new Runner(2, startLane, this.number), new Runner(5, startLane, this.number)],
			Lady: [new Lady(3, startLane, this.number)],
			King: [new King(4, startLane, this.number)]
		};
	}

	applyPeasantPossibilities(){
		switch(this.number){
			case 1:
			return function(figure, moveable) {
				for(let i = 1; i <= moveable.y; i++){
					var tile = this.boardMatrix[figure.positionY - i][figure.positionX];
					if(tile.figure !== null) break;
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}

				//Check if peasant can potentially beat an opponents figure
				if(figure.positionX < 7){
					tile = this.boardMatrix[figure.positionY - 1][figure.positionX + 1];
						if(tile.figure !== null && tile.figure.figure.team !== figure.team){
							tile.figure.figure.hitable = true;
							this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
						}
				}

				if(figure.positionX > 0){
					tile = this.boardMatrix[figure.positionY - 1][figure.positionX - 1];
					if(tile.figure !== null && tile.figure.figure.team !== figure.team){
						tile.figure.figure.hitable = true;
						this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
					}
				}
			}
			case 2:
			return function(figure, moveable) {
				for(let i = 1; i <= moveable.y; i++){
					var tile = this.boardMatrix[figure.positionY + i][figure.positionX];
					if(tile.figure !== null) break;
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}
				
				//Check if peasant can potentially beat an opponents figure
				if(figure.positionX < 7){
					tile = this.boardMatrix[figure.positionY + 1][figure.positionX + 1];
					if(tile.figure !== null && tile.figure.figure.team !== figure.team){
						tile.figure.figure.hitable = true;
						this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
					}
				}
				if(figure.positionX > 0){
					tile = this.boardMatrix[figure.positionY + 1][figure.positionX - 1];
					if(tile.figure !== null && tile.figure.figure.team !== figure.team){
						tile.figure.figure.hitable = true;
						this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
					}
				}
			}
		}
	}

	applyTowerPossibilities(){
		return function(figure, moveable){
			let chooseTile = function(direction, i){
				switch(direction){
					case 'up':
						return this.boardMatrix[figure.positionY - i][figure.positionX];
					case 'down':
						return this.boardMatrix[figure.positionY + i][figure.positionX];
					case 'left':
						return this.boardMatrix[figure.positionY][figure.positionX - i];
					case 'right':
						return this.boardMatrix[figure.positionY][figure.positionX + i];
					default:
						throw new Error('Couldn\'t locate the tile. ' + direction + 'Iteration: ' + i);
				}
			}
			for(let direction in moveable){
				for(let i = 1; i <= moveable[direction]; i++){
					let tile = chooseTile.call(this, direction, i);
					if(tile.figure !== null){
						if(tile.figure.figure.team !== figure.team){
							tile.figure.figure.hitable = true;
							this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
							break;
						}
						else{
							break;
						}
					}
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}
			}
		}
	}
	applyRunnerPossibilities(){
		return function(figure, moveable){
			let chooseTile = function(direction, i){
				switch(direction){
					case 'ne':
						return this.boardMatrix[figure.positionY - i][figure.positionX + i];
					case 'es':
						return this.boardMatrix[figure.positionY + i][figure.positionX + i];
					case 'sw':
						return this.boardMatrix[figure.positionY + i][figure.positionX - i];
					case 'nw':
						return this.boardMatrix[figure.positionY - i][figure.positionX - i];
					default:
						throw new Error('Couldn\'t locate the tile. ' + direction + 'Iteration: ' + i);
				}
			}
			moveable.forEach(direction =>{
				for(let i = 1; true; i++){
					let tile;
					try{
						tile = chooseTile.call(this, direction, i);
					}
					catch(err){}
					if(tile === undefined) break;
					if(tile.figure !== null){
						if(tile.figure.figure.team !== figure.team){
							tile.figure.figure.hitable = true;
							this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
							break;
						}
						break;
					}
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}
			})
		}
	}

	applyJumperPossibilities(){
		return function(figure, moveable){
			for(let direction in moveable){
				for(let tilePosition of moveable[direction]){
					let tile;
					try{
						tile = this.boardMatrix[figure.positionY + tilePosition.y][figure.positionX + tilePosition.x];
					}
					catch(err){}
					if(tile === undefined) continue;
					if(tile.figure !== null){
						if(tile.figure.figure.team !== figure.team){
							tile.figure.figure.hitable = true;
							this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
							continue;
						}
						continue;
					}
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}
			}
		}
	}

	applyKingPossibilities(){
		return function(figure){
			let tiles = this.tilesAroundFigure(figure);
			tiles.forEach(tile =>{
				if(tile.figure !== null){
					if(tile.figure.figure.team !== figure.team){
						tile.figure.figure.hitable = true;
						this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
						return;
					}
					return;
				}
				tile.moveable = true;
				this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
			})
		}
	}

	applyLadyPossibilities(){
		return function(figure, moveable){
			let tiles = this.tilesAroundFigure(figure);
			tiles.forEach(tile =>{
				if(tile.figure !== null){
					if(tile.figure.figure.team !== figure.team){
						tile.figure.figure.hitable = true;
						this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
						return;
					}
					return;
				}
				tile.moveable = true;
				this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
			})

			let chooseTile = function(direction, i){
				switch(direction){
					case 'up':
						return this.boardMatrix[figure.positionY - i][figure.positionX];
					case 'down':
						return this.boardMatrix[figure.positionY + i][figure.positionX];
					case 'left':
						return this.boardMatrix[figure.positionY][figure.positionX - i];
					case 'right':
						return this.boardMatrix[figure.positionY][figure.positionX + i];
					default:
						throw new Error('Couldn\'t locate the tile. ' + direction + 'Iteration: ' + i);
				}
			}
			console.log(moveable.tower);
			for(let direction in moveable.tower){
				for(let i = 1; i <= moveable.tower[direction]; i++){
					let tile = chooseTile.call(this, direction, i);
					if(tile.figure !== null){
						if(tile.figure.figure.team !== figure.team){
							tile.figure.figure.hitable = true;
							this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
							break;
						}
						else{
							break;
						}
					}
					if(tile.moveable) continue;
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}
			}

			chooseTile = function(direction, i){
				switch(direction){
					case 'ne':
						return this.boardMatrix[figure.positionY - i][figure.positionX + i];
					case 'es':
						return this.boardMatrix[figure.positionY + i][figure.positionX + i];
					case 'sw':
						return this.boardMatrix[figure.positionY + i][figure.positionX - i];
					case 'nw':
						return this.boardMatrix[figure.positionY - i][figure.positionX - i];
					default:
						throw new Error('Couldn\'t locate the tile. ' + direction + 'Iteration: ' + i);
				}
			}
			moveable.runner.directions.forEach(direction =>{
				for(let i = 1; true; i++){
					let tile;
					try{
						tile = chooseTile.call(this, direction, i);
					}
					catch(err){}
					if(tile === undefined) break;
					if(tile.figure !== null){
						if(tile.figure.figure.team !== figure.team){
							tile.figure.figure.hitable = true;
							this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
							break;
						}
						break;
					}
					if(tile.moveable) continue;
					tile.moveable = true;
					this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
				}
			})
		}
	}
}