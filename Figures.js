class Figure{
	constructor(positionX, positionY, team){
		this.positionX = positionX;
		this.positionY = positionY;
		this.team = team;
		this.type = this.constructor.name;
		this.moveCount = 0;
	}

	determineMovePossibilities(){
		throw new Error("Class " + this.type + " lacks in implentation of this method!");
	}

	move(x, y){
		this.positionX = x;
		this.positionY = y;
		this.moveCount++;
	}
}

class Peasant extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whitePeasant' : 'blackPeasant';
		this.asset = 'whitePeasant';
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
}

class Jumper extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whiteJumper' : 'blackJumper';
		this.asset = 'whiteJumper';
	}
}

class Runner extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whiteJumper' : 'blackJumper';
		this.asset = 'whiteRunner';
	}
}

class Tower extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whiteTower' : 'blackTower';
		this.asset = 'whiteTower';
	}

}

class Lady extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whiteLady' : 'blackLady';
		this.asset = 'whiteLady';
	}
}

class King extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whiteKing' : 'blackKing';
		this.asset = 'whiteKing';
	}
}