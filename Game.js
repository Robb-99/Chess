const config = {
	type: Phaser.AUTO,
	width: 600,
	height: 600,
	scene: [BoardScene]
};

let game = new Phaser.Game(config); 

/*
 * TILE_SIZE indicates the height and the width of the assets from the tiles.
 * Height and width of the asset gotta be the exact same
*/

const TILE_SIZE = 50;

/*
 * BORDER_SIZE indicates the size of the borders from the board.
 * For the upper and lower border, the height gotta be the same
 * For the left and right border, the width gotta be the same
 * For a clean canvas, the TILE_SIZE and the BORDER_SIZE gotta match the width and the height of the config
*/

const BORDER_SIZE = 100;
/*
 * Just used, if BORDER_SIZE and TILE_SIZE does not match the width/height of the config.
 * The Tile Matrix will be placed relative, ensure the functionality
*/
const RELATIVE_BORDER_POSITION = (config.width - (BORDER_SIZE * 2 + TILE_SIZE * 8)) / 2; //Relative to the resolution