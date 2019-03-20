class Figure{
	constructor(positionX, positionY, team){
		this.positionX = positionX;
		this.positionY = positionY;
		this.team = team;
		this.type = this.constructor.name;
	}
	determineMovePossibilities(){
		//throw new Error('Need to implement this method!');
	}
}

class Peasant extends Figure{
	constructor(positionX, positionY, team){
		super(positionX, positionY, team);
		//this.asset = (this.team === 1) ? 'whitePeasant' : 'blackPeasant';
		this.asset = 'whitePeasant';
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