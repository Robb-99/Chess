class BoardScene extends Phaser.Scene {
	constructor(){
		super({key: "BoardScene"});
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
		this.startLineup();
		this.focus = this.add.sprite(10000, 10000, 'focus');
		this.focus.alpha -= 0.7;
		this.input.on('pointerdown', event => {
			let clickedTile = this.getClickedTile(event);
			if(clickedTile === null || clickedTile === this.focusedTile || clickedTile.figure === null){
				this.focus.x = 10000;
				this.focus.y = 10000;
				document.getElementById('focus').innerHTML = null;
				return;
			}
			this.focus.x = clickedTile.x;
			this.focus.y = clickedTile.y;
			this.focusedTile = clickedTile;
			document.getElementById('focus').innerHTML = "Im Fokus: <b>" + this.focusedTile.figure.type + "</b> von <b> Spieler" + this.focusedTile.figure.player + "</b>";
		})
	}

	getClickedTile(event){
		if(event.x < BORDER_SIZE + RELATIVE_BORDER_POSITION || event.y < BORDER_SIZE  + RELATIVE_BORDER_POSITION) return null;
		for(let row of this.boardMatrix){
			for(let tile of row){
				if((tile.x > event.x + (TILE_SIZE / 2) || tile.x > event.x - (TILE_SIZE / 2)) && (tile.y > event.y + (TILE_SIZE / 2) || tile.y > event.y - (TILE_SIZE / 2))) return tile;
			}
		}
		return null;
	}

	startLineup(){
		Object.values(this.player1.figureList).forEach(type => {
			type.forEach(figure => {
				this.boardMatrix[figure.positionY][figure.positionX].figure = {
					sprite: this.add.sprite(this.boardMatrix[figure.positionY][figure.positionX].x, this.boardMatrix[figure.positionY][0].y, figure.asset),
					type: figure.constructor.name,
					player: figure.team
				};
			})
		})
		Object.values(this.player2.figureList).forEach(type => {
			type.forEach(figure => {
				this.boardMatrix[figure.positionY][figure.positionX].figure = {
					sprite: this.add.sprite(this.boardMatrix[figure.positionY][figure.positionX].x, this.boardMatrix[figure.positionY][0].y, figure.asset),
					type: figure.constructor.name,
					player: figure.team
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