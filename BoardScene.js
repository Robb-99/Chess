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
		this.focusedTile;
		this.focus = this.add.sprite(10000, 10000, 'focus');
		this.focus.alpha -= 0.7;

		this.input.on('pointerdown', event => {
			let clickedTile = this.getClickedTile(event);
			if(event.x < BORDER_SIZE + RELATIVE_BORDER_POSITION || event.y < BORDER_SIZE  + RELATIVE_BORDER_POSITION || clickedTile === null || clickedTile === this.focusedTile) return;
			this.focus.x = clickedTile.x;
			this.focus.y = clickedTile.y;
			this.focusedTile = clickedTile;
		})
	}

	getClickedTile(event){
		for(let row of this.boardMatrix){
			for(let tile of row){
				if((tile.x > event.x + (TILE_SIZE / 2) || tile.x > event.x - (TILE_SIZE / 2)) && (tile.y > event.y + (TILE_SIZE / 2) || tile.y > event.y - (TILE_SIZE / 2))) return tile;
			}
		}
		return null;
	}
}