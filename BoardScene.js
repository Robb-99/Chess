class BoardScene extends Phaser.Scene {
	constructor(){
		super({key: "BoardScene"});
	}
	preload(){
		this.load.image('boardSides', 'assets/boardSides.png');
		this.load.image('whiteTile', 'assets/whiteTile.png');
		this.load.image('brownTile', 'assets/brownTile.png');
		this.load.image('focus', 'assets/focus.png');
		this.boardMatrix = new Array(8);
		for (let i = 0; i < this.boardMatrix.length; i++) {
			this.boardMatrix[i] = [];
		}
		let recentX = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
		let recentY = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
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
				};
				recentX += TILE_SIZE;
			}
			recentY += TILE_SIZE;
			recentX = BORDER_SIZE + (TILE_SIZE / 2) + RELATIVE_BORDER_POSITION;
		}
	}

	create(){
		this.add.sprite(config.height / 2, config.width / 2, 'boardSides');
		this.boardMatrix.forEach(row => {
			row.forEach(tile => {
				this.add.sprite(tile.x, tile.y, tile.ground);
			})
		})

		this.focus = this.add.sprite(10000, 10000, 'focus');
		this.focus.alpha -= 0.7;

		this.input.on('pointerdown', event => {
			let clickedTile = this.getClickedTile(event);
			if(event.x < BORDER_SIZE + RELATIVE_BORDER_POSITION || event.y < BORDER_SIZE  + RELATIVE_BORDER_POSITION || clickedTile === null) return;
			this.focus.x = clickedTile.x;
			this.focus.y = clickedTile.y;
		})
	}

	getClickedTile(event){
		for(let i = 0; i < this.boardMatrix.length; i++){
			for(let d = 0; d < this.boardMatrix[i].length; d++){
				if((this.boardMatrix[i][d].x > event.x + (TILE_SIZE / 2) || this.boardMatrix[i][d].x > event.x - (TILE_SIZE / 2)) && (this.boardMatrix[i][d].y > event.y + (TILE_SIZE / 2) || this.boardMatrix[i][d].y > event.y - (TILE_SIZE / 2))) return this.boardMatrix[i][d];
			}
		}
		return null;
	}
}