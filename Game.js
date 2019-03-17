const config = {
	type: Phaser.AUTO,
	width: 600,
	height: 600,
	scene: [BoardScene]
};

let game = new Phaser.Game(config); 

const TILE_SIZE = 50;
const BORDER_SIZE = 100;
const RELATIVE_BORDER_POSITION = (config.width - (BORDER_SIZE * 2 + TILE_SIZE * 8)) / 2; //Relative to the solution