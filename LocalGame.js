class BoardScene extends Phaser.Scene {
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
		this.load.image('whitePeasant', 'assets//figures/whitePeasant.png');
		this.load.image('whiteJumper', 'assets/figures/whiteJumper.png');
		this.load.image('whiteKing', 'assets/figures/whiteKing.png');
		this.load.image('whiteLady', 'assets/figures/whiteLady.png');
		this.load.image('whiteRunner', 'assets/figures/whiteRunner.png');
		this.load.image('whiteTower', 'assets/figures/whiteTower.png');
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
					figure: null
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
		this.startLineup(this.player1);
		this.startLineup(this.player2);
		this.setPlayerTurn(1);

		this.focus = this.add.sprite(10000, 10000, 'focus');
		this.focus.alpha -= 0.7;
		this.focusedTile = null;
		this.input.on('pointerdown', event => {
			let clickedTile = this.getClickedTile(event);
			if(clickedTile === "Out of bounds"){
				this.defocus();
				return;
			}
			else if(this.focusedTile !== null && clickedTile.figure === null){
				this.move(clickedTile);
				return;
			}
			else if (clickedTile.figure === null || clickedTile.figure.figure.team !== this.turn) return;
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
	move(clickedTile){
		this.focusedTile.figure.figure.move(clickedTile.indX, clickedTile.indY);
		clickedTile.figure = this.focusedTile.figure;
		this.focusedTile.figure = null;
		clickedTile.figure.sprite.x = this.boardMatrix[clickedTile.figure.figure.positionY][clickedTile.figure.figure.positionX].x;
		clickedTile.figure.sprite.y = this.boardMatrix[clickedTile.figure.figure.positionY][clickedTile.figure.figure.positionX].y;
		this.defocus();
		document.getElementById('lastTurn').innerHTML = "<b>" + clickedTile.figure.figure.type + "</b> von <b> Spieler" + clickedTile.figure.figure.team + "</b> auf Feld <b>" + clickedTile.designation + "</b> verschoben!";
		this.turn === 1 ? this.setPlayerTurn(2) : this.setPlayerTurn(1);
		console.log(this.boardMatrix);
	}

	focusFigure(clickedTile){
		this.focus.x = clickedTile.x;
		this.focus.y = clickedTile.y;
		this.focusedTile = clickedTile;
		document.getElementById('focus').innerHTML = "Im Fokus: <b>" + this.focusedTile.figure.figure.type + "</b> von <b> Spieler" + this.focusedTile.figure.figure.team + "</b> auf Feld <b>" + this.focusedTile.designation + "</b>";
	}

	defocus(){
		this.focus.x = 10000;
		this.focus.y = 10000;
		this.focusedTile = null;
		document.getElementById('focus').innerHTML = null;
	}

	setPlayerTurn(number){
		this.turn = number;
		document.getElementById('turn').innerHTML = "Aktueller Spieler: <b> Spieler " + this.turn;
	}

	startLineup(player){
		Object.values(player.figureList).forEach(type => {
			type.forEach(figure => {
				this.boardMatrix[figure.positionY][figure.positionX].figure = {
					sprite: this.add.sprite(this.boardMatrix[figure.positionY][figure.positionX].x, this.boardMatrix[figure.positionY][0].y, figure.asset),
					figure: figure
				};
			})
		})
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
			peasant: peasantList,
			tower: [new Tower(0, startLane, this.number), new Tower(7, startLane, this.number)],
			jumper: [new Jumper(1, startLane, this.number), new Jumper(6, startLane, this.number)],
			runner: [new Runner(2, startLane, this.number), new Runner(5, startLane, this.number)],
			lady: [new Lady(3, startLane, this.number)],
			king: [new King(4, startLane, this.number)]
		};
	}
}