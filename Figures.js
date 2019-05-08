class Figure{
	constructor(positionX, positionY, team){
		this.positionX = positionX;
		this.positionY = positionY;
		this.team = team;
		this.type = this.constructor.name;
		this.moveCount = 0;
		this.isAlive = true;
	}

	determineMovePossibilities(){
		throw new Error("Class " + this.type + " lacks in implentation of this method!");
	}

	move(x, y){
		this.positionX = x;
		this.positionY = y;
		this.moveCount++;

		if(this.type === "Peasant" && (this.positionY === 7 || this.positionY === 0)) return true;
	}
}

class Peasant extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whitePeasant' : 'blackPeasant';
	}

	determineMovePossibilities(){
		if(this.moveCount === 0){
			return {
				x: 0,
				y: 2
			};
		}
		return {
			x: 0,
			y: 1
		};
	}

	transform(type){

	}

}

class Jumper extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteJumper' : 'blackJumper';
	}
	determineMovePossibilities(){
		return{
			ne:[{x: 2, y: -1}, {x: 1, y: -2}],
			es:[{x: 2, y: 1}, {x: 1, y: 2}],
			sw:[{x: -1, y: 2}, {x: -2, y: 1}],
			nw:[{x: -2, y: -1}, {x: -1, y: -2}]
		};
	}
}

class Runner extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteRunner' : 'blackRunner';
	}
	determineMovePossibilities(){
		// return{
		// 	ne: this.positionY - this.positionX,
		// 	es: (this.positionX < this.positionY) ? 7 - this.positionY : this.positionX - this.positionX,
		// 	sw: (this.positionX < this.positionY) ? 7 - this.positionY - this.positionY : this.positionX - this.positionX,
		// 	nw: (this.positionX < this.positionY) ? this.positionX : this.positionX
		// };
		return ['ne', 'es', 'sw', 'nw'];
	}
}

class Tower extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteTower' : 'blackTower';
	}
	determineMovePossibilities(){
		return{
			up: this.positionY,
			down: 7 - this.positionY,
			left: this.positionX,
			right: 7 - this.positionX
		};
	}
}

class Lady extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteLady' : 'blackLady';
	}
	determineMovePossibilities(){
		return{
			tower: {
				up: this.positionY,
				down: 7 - this.positionY,
				left: this.positionX,
				right: 7 - this.positionX
			},
			runner: {
				directions: ['ne', 'es', 'sw', 'nw']
			}
		};
	}
}

class King extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		this.asset = (this.team === 1) ? 'whiteKing' : 'blackKing';
		this.threaded = false;
	}
	determineMovePossibilities(){
		return;
	}
}