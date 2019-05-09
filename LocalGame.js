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
		this.load.image('whitePeasant', 'assets/figures/whitePeasant.png');
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
					moveable: false,
					sprite: null
				};
				recentX += TILE_SIZE;
				tileDesignation = tileDesignation[0] + String.fromCharCode(tileDesignation.charCodeAt(1) + 1);
			}
			recentY += TILE_SIZE;
			recentX = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
			tileDesignation = tileDesignation[0] - 1 + "A";
		}
		this.determineThreatsOnBoard();
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
			else if(clickedTile.figure !== null && clickedTile.figure.hitable){
				this.removeFigure(clickedTile.figure);
				this.move(clickedTile);
				return;
			}
			//Triggers when the user clicks on an opponents figure or an empty tile
			else if (clickedTile.figure === null || clickedTile.figure.team !== this.turn){ 
				this.defocus();
				return
			};
			this.focusFigure(clickedTile);
		})
	}

	/*
		Runs every time before a new frame is rendered on-screen - so if the game runs on 60 frames per second, this method runs 60 seconds per seconds
	*/
	update(){
		this.animate();
	}

	/*
		To determine on which tile the user clicked
		@return: Either tile-reference or a string if the user clicked on the board sides
		@param event: click event
	*/
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
	@param newTile: Tile the user wants to move the figure
	*/
	move(newTile){
		let move = this.focusedTile.designation; 
		let isTransforming = this.focusedTile.figure.move(newTile.indX, newTile.indY);
		newTile.figure = this.focusedTile.figure;
		newTile.sprite = this.focusedTile.sprite;
		this.focusedTile.sprite = null;
		this.focusedTile.figure = null;
		this.defocus();
		if(isTransforming){
			newTile.figure.transform();
			//TODO: Dialog to give the player the choice of a new type for the figure
		}
		document.getElementById("moveList").innerHTML += "<li>Player " + this.turn + ":\n" + newTile.figure.type + " " + move + "→" + newTile.designation + "</li>";
		this.changePlayerTurn();
	}

	/*
		Moves the sprite to it's new location on the board matrix
		Runs automatically
	*/
	animate(){
		this.boardMatrix.forEach(row =>{
			row.forEach(tile =>{
				if(tile.sprite !== null){
					if(tile.x > tile.sprite.x) {tile.sprite.x += TILE_SIZE / 20; }
					if(tile.x < tile.sprite.x) {tile.sprite.x -= TILE_SIZE / 20; }
					if(tile.y > tile.sprite.y) {tile.sprite.y += TILE_SIZE / 20; }
					if(tile.y < tile.sprite.y) {tile.sprite.y -= TILE_SIZE / 20; }
				}
			})
		})
	}

	/*
		Focuses tile on the board matrix
		@param clickedTile: board Matrix entry
	*/
	focusFigure(clickedTile){
		this.defocus();
		this.focus.x = clickedTile.x;
		this.focus.y = clickedTile.y;
		this.focusedTile = clickedTile;
		this.moveableTile(this.focusedTile.figure);
	}

	/*
		Determines to which field the figure can move and which hostile figures can be beaten
		@param figure: reference to figure
	*/
	moveableTile(figure){
		this.moveableSprites = new Array(); //References to the current sprites to visualize the moving possibilities
		this.hitmarker = new Array();		//References to the current sprites to visualize the possibilities to beat a hostile figure
		let x = figure.possibilities();
		x.call(this, figure, tile =>{
			tile.moveable = true;
			this.moveableSprites.push(this.add.sprite(tile.x, tile.y, 'focus'));
		}, tile =>{
			tile.figure.hitable = true;
			this.hitmarker.push(this.add.sprite(tile.x, tile.y, 'hit'));
		});
		this.transparentMarker();
	}

	/*
		Clear the current focused tile, clear all moveable and hitable propetries from every tile on the board
	*/
	defocus(){
		if(this.focusedTile === null) return;

		this.focus.x = 10000;
		this.focus.y = 10000;
		this.focusedTile = null;

		this.boardMatrix.forEach(row => {
			row.forEach(tile => {
				tile.moveable = false;
			})
		})

		this.boardMatrix.forEach(row => {
			row.forEach(tile => {
				if (tile.figure !== null){
					tile.figure.hitable = false;
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

	/*
		Changes the current player turn and renews the threat status on the board
		This is the final method that is responsible to end a turn
	*/
	changePlayerTurn(){
		this.determineThreatsOnBoard();
		this.turn = (this.turn === 1) ? 2 : 1;
		document.getElementById('turn').innerHTML = "Aktueller Spieler: <b> Spieler " + this.turn + "</b>";
		if(this.checkKingsStatus(this.player1)) console.log("Spieler 1 steht im Schach"); //TODO: Fade in text to inform the player that he is in check
		if(this.checkKingsStatus(this.player2)) console.log("Spieler 2 steht im Schach");
	}

	/*
		Removes a figure from the board and destroys the sprite for it's graphical represantation
		However, the object will NOT be destroyed, player also holds reference on, considered, dead figures
		@param figure: Figure to be removed
	*/
	removeFigure(figure){
		this.boardMatrix[figure.positionY][figure.positionX].sprite.destroy();
		this.boardMatrix[figure.positionY][figure.positionX].figure = null;
		figure.isAlive = false;
	}

	/*
		Makes all the marker on the board transparent
	*/
	transparentMarker(){
		this.moveableSprites.forEach(moveableFocus =>{
			moveableFocus.alpha -= 0.7;
		})
		this.hitmarker.forEach(hit =>{
			hit.alpha -= 0.2;
		})
	}

	/*
		Registers figures on the matrix and adds sprites for the graphical representation of the figures 
	*/
	initFiguresOnMatrix(player){
		Object.values(player.figureList).forEach(type => {
			type.forEach(figure => {
				let tile = this.boardMatrix[figure.positionY][figure.positionX];
				tile.sprite = this.add.sprite(tile.x, tile.y, figure.asset)
				tile.figure = figure;
			})
		})
	}

	/*
		Used to get all tiles around a figure
		@param figure: Reference to figure on the matrix
		@return: Array with all tiles around the figure
	*/
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
				if(tile !== undefined) x.push(tile);
			}
			catch(err){}
		}
		return x;
	}

	/*
		Cleans the threat status of every field and determines the new threat status based on position of the figures 
	*/
	determineThreatsOnBoard(){
		this.boardMatrix.forEach(row =>{
			row.forEach(tile =>{
				tile.threatenedBy = [];
			})
		})
		for(let i = 1; i <= 2; i++)
		{
			for(let type in this["player" + i].figureList){
				for(let figure of this["player" + i].figureList[type]){
				let x = figure.possibilities();
				x.call(this, figure, (tile, x) => { if(figure.isAlive){tile.threatenedBy.push(figure)}}, (tile, x) =>  { if(figure.isAlive){tile.threatenedBy.push(figure)}});
			}
		}}
	}

	/*
		Check if the king stands on a threatened field
		@player player: Reference to a player
		@return  Boolean: true if the king stands on a threadned field, false if not
	*/
	checkKingsStatus(player){
		let tile = this.boardMatrix[player.figureList.King[0].positionY][player.figureList.King[0].positionX];
		for(let threat of tile.threatenedBy){
			if(player.number !== threat.team) return true;
		}
		return false;
	}

	/*
		Used to get a tile that is located sideways from a figure
		@param figure: Figure you want the tile from
		@param direction: To indicate the direction
		@param distance: How many tiles the tile is away from the figure
	*/
	chooseTileSideways(figure, direction, distance){
		switch(direction){
			case 'up':
				return this.boardMatrix[figure.positionY - distance][figure.positionX];
			case 'down':
				return this.boardMatrix[figure.positionY + distance][figure.positionX];
			case 'left':
				return this.boardMatrix[figure.positionY][figure.positionX - distance];
			case 'right':
				return this.boardMatrix[figure.positionY][figure.positionX + distance];
			default:
				throw new Error('Couldn\'t locate the tile. ' + direction + 'Iteration: ' + distance);
		}
	}

	/*
		Used to get a tile that is located sideways from a figure
		@param figure: Figure you want the tile from
		@param direction: To indicate the direction specified in next cardinal points
		@param distance: How many tiles the tile is away from the figure
	*/
	chooseTileDiagonally(figure, direction, distance){
		switch(direction){
			case 'ne':
				return this.boardMatrix[figure.positionY - distance][figure.positionX + distance];
			case 'es':
				return this.boardMatrix[figure.positionY + distance][figure.positionX + distance];
			case 'sw':
				return this.boardMatrix[figure.positionY + distance][figure.positionX - distance];
			case 'nw':
				return this.boardMatrix[figure.positionY - distance][figure.positionX - distance];
			default:
				throw new Error('Couldn\'t locate the tile. ' + direction + 'Iteration: ' + distance);
		}
	}
}

class Player{
	/*
		Creates new instance of the player class
		@param number: To identify the player
	*/
	constructor(number){
		this.number = number;
		var startLane = (this.number === 1) ? 7 : 0;
		let peasantList = new Array();
		for(let i = 0; i < 8; i++){
			this.number === 1 ? peasantList.push(new Peasant(i, startLane - 1, 1)) : peasantList.push(new Peasant(i, startLane + 1, 2));
		}

		/*
			Object that holds all figure objects from the player
		*/
		this.figureList = {
			Peasant: peasantList,
			Tower: [new Tower(0, startLane, this.number), new Tower(7, startLane, this.number)],
			Jumper: [new Jumper(1, startLane, this.number), new Jumper(6, startLane, this.number)],
			Runner: [new Runner(2, startLane, this.number), new Runner(5, startLane, this.number)],
			Lady: [new Lady(3, startLane, this.number)],
			King: [new King(4, startLane, this.number)]
		};
	}

	getBobbyB(){
		return this.figureList.King[0];
	}
}