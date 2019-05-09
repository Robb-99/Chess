/*
	Super-type that all figure-types are inherit from
*/
class Figure{
	/*
		Creates new figure instance
	*/
	constructor(positionX, positionY, team){
		this.positionX = positionX;
		this.positionY = positionY;
		this.team = team;
		this.type = this.constructor.name;
		this.moveCount = 0;
		this.isAlive = true;
	}

	/*
		Moves the figure to new location on the board and increments the move count of the figure
	*/
	move(x, y){
		this.positionX = x;
		this.positionY = y;
		this.moveCount++;

		if(this.type === "Peasant" && (this.positionY === 7 || this.positionY === 0)) return true;
	}

	/*
		A javascript-ish abstract method that every subtype has to implement
		Portrays the move-set of the specific type in the specific implementations
		Determines the move opportunites of the specific figure and modifies the board matrix according to the possibilities
		Also used to threat tiles
		@return: Method that selects all tiles and modifies those based on the specified behavior
		returned Method @param figure: Current figure
		returned Method @param actionOne/actionTwo: Methods that will be used to modify the tile
		returned Method @param actionOne: Modify the tile so the figure can move on it
		returned Method @param actionTwo: Modify the tile so the figure that stands on it can be beaten
		To differentiate between the threat and the move/beat method, give the threat method one more argument that is not used in the method 
	*/
	possibilities(){
		throw new Error('Not implemented by type ' + this.type);
	}
}

class Peasant extends Figure{
	/*
		Creates new pesant instance
	*/
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whitePeasant' : 'blackPeasant';
	}

	possibilities(){
		let movePossibilities = (this.moveCount === 0) ? 2 : 1;
		switch(this.team){
			case 1:
			return function(figure, actionOne, actionTwo) {
				for(let i = 1; i <= movePossibilities; i++){
					var tile = this.boardMatrix[figure.positionY - i][figure.positionX];
					if(tile.figure !== null || actionOne.length === 2) break;
					actionOne(tile);
				}

				//Check if peasant can potentially beat an opponents figure
				if(figure.positionX < 7){
					tile = this.boardMatrix[figure.positionY - 1][figure.positionX + 1];
					if(tile.figure !== null && tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2) || actionTwo.length === 2){
						actionTwo(tile);
					}
				}

				if(figure.positionX > 0){
					tile = this.boardMatrix[figure.positionY - 1][figure.positionX - 1];
					if(tile.figure !== null && tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2) || actionTwo.length === 2){
						actionTwo(tile);
					}
				}
			}
			case 2:
			return function(figure, actionOne, actionTwo) {
				for(let i = 1; i <= movePossibilities; i++){
					var tile = this.boardMatrix[figure.positionY + i][figure.positionX];
					if(tile.figure !== null || actionOne.length === 2) break;
					actionOne(tile);
				}
				
				//Check if peasant can potentially beat an opponents figure
				if(figure.positionX < 7){
					tile = this.boardMatrix[figure.positionY + 1][figure.positionX + 1];
					if(tile.figure !== null && tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2) || actionTwo.length === 2){
						actionTwo(tile);
					}
				}
				if(figure.positionX > 0){
					tile = this.boardMatrix[figure.positionY + 1][figure.positionX - 1];
					if(tile.figure !== null && tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2) || actionTwo.length === 2){
						actionTwo(tile);
					}
				}
			}
		}
	}

	//TODO: Transform to either lady, tower, jumper or runner
	transform(type){

	}

}

class Jumper extends Figure{
	/*
		Creates new jumper instance
	*/
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteJumper' : 'blackJumper';
		this.movePossibilities = {
			ne:[{x: 2, y: -1}, {x: 1, y: -2}],
			es:[{x: 2, y: 1}, {x: 1, y: 2}],
			sw:[{x: -1, y: 2}, {x: -2, y: 1}],
			nw:[{x: -2, y: -1}, {x: -1, y: -2}]
		};
	}
	possibilities(){
		let movePossibilities = this.movePossibilities;
		return function(figure, actionOne, actionTwo){
			for(let direction in movePossibilities){
				for(let tilePosition of movePossibilities[direction]){
					let tile;
					try{
						tile = this.boardMatrix[figure.positionY + tilePosition.y][figure.positionX + tilePosition.x];
					}
					catch(err){}
					if(tile === undefined) continue;
					if(tile.figure !== null){
						if(tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2)){
							actionTwo(tile);
							continue;
						}
						continue;
					}
					actionOne(tile);
				}
			}
		}
	}
}

class Runner extends Figure{
	/*
		Creates new runner instance
	*/
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteRunner' : 'blackRunner';
		this.directions = ['ne', 'es', 'sw', 'nw'];
	}

	possibilities(){
		let directions = this.directions;
		return function(figure, actionOne, actionTwo){
			directions.forEach(direction =>{
				for(let i = 1; true; i++){
					let tile;
					try{
						tile = this.chooseTileDiagonally(figure, direction, i);
					}
					catch(err){}
					if(tile === undefined) break;
					if(tile.figure !== null){
						if(tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2)){
							actionTwo(tile);
							break;
						}
						break;
					}
					actionOne(tile);
				}
			})
		}
	}
}

class Tower extends Figure{
	/*
		Creates new tower instance
	*/
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteTower' : 'blackTower';
	}

	possibilities(){
		let movePossibilities = {
			up: this.positionY,
			down: 7 - this.positionY,
			left: this.positionX,
			right: 7 - this.positionX
		};
		return function(figure, actionOne, actionTwo){
			for(let direction in movePossibilities){
				for(let i = 1; i <= movePossibilities[direction]; i++){
					let tile = this.chooseTileSideways(figure, direction, i);
					if(tile.figure !== null){
						if(tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2)){
							actionTwo(tile);
							break;
						}
						else{
							break;
						}
					}
					actionOne(tile);
				}
			}
		}
	}
}

class Lady extends Figure{
	/*
		Creates new lady instance
	*/
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteLady' : 'blackLady';
		this.directions = ['ne', 'es', 'sw', 'nw'];
	}

	possibilities(){
		let movePossibilities = {
			tower: {
				up: this.positionY,
				down: 7 - this.positionY,
				left: this.positionX,
				right: 7 - this.positionX
			},
			runner: this.directions
		};
		return function(figure, actionOne, actionTwo){
			let tiles = this.tilesAroundFigure(figure);
			tiles.forEach(tile =>{
				if(tile.figure !== null){
					if(tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2)){
						actionTwo(tile);
						return;
					}
					return;
				}
				actionOne(tile);
			})

			for(let direction in movePossibilities.tower){
				for(let i = 1; i <= movePossibilities.tower[direction]; i++){
					let tile = this.chooseTileSideways(figure, direction, i);
					if(tile.figure !== null){
						if(tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 2)){
							actionTwo(tile);
							break;
						}
						else{
							break;
						}
					}
					if(tile.movePossibilities) continue;
					actionOne(tile);
				}
			}
			movePossibilities.runner.forEach(direction =>{
				for(let i = 1; true; i++){
					let tile;
					try{
						tile = this.chooseTileDiagonally(figure, direction, i);
					}
					catch(err){}
					if(tile === undefined) break;
					if(tile.figure !== null){
						if(tile.figure.team !== figure.team && (tile.figure.type !== "King" || actionTwo.length === 1)){
							actionTwo(tile);
							break;
						}
						break;
					}
					if(tile.movePossibilities) continue;
					actionOne(tile);
				}
			})
		}
	}
}

class King extends Figure{
	/*
		Creates new king instance
	*/
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteKing' : 'blackKing';
	}

	possibilities(){
		return function(figure, actionOne, actionTwo){
			let tiles = this.tilesAroundFigure(figure);
			tiles.forEach(tile =>{
				if(tile.figure !== null){
					if(tile.figure.team !== figure.team){
						actionTwo(tile);
					}
					return;
				}
				if(tile.threatenedBy.every(threat => threat.team === figure.team) || arguments[2].length === 2){
					actionOne(tile);
				}
			})
		}
	}
}