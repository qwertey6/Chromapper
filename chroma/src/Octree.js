

const RATINGS_TARGET = 7;//each node will seek only 7 ratings

class Point{
	constructor(x,y,z){
		this.x = x;
		this.y = y;
		this.z = z;
		this.rating = [];
		this.ratings = 0
	}
	assignRating(r){
		this.rating.push(r);
		this.ratings = this.ratings + 1;
		return this;
	}
	equals(point){
		return (this.x === point.x) && (this.y === point.y) && (this.z === point.z);
	}
}

class Delegator{
	constructor(){
		this.users = {/*will map userID:[points they've rated], to avoid asking the same users the same questions*/};
		this.octree = new Octree(new Point(128, 128, 128), 128);
	}
	getNext(userID){
		var fringe = this.octree.getFringe();
		if(this.users[userID] === undefined){
			return fringe[0];
		}
		var useranswers = this.users[userID];
		var validChoice = true;
		for(let i=0; i<fringe.length; i++){
			if(useranswers.every( d=> !d.equals(fringe[i].center) )){ //if the user hasn't answered this question before,
				return fringe[i];//ask them this question
			}/*
			for(let j=0; j<useranswers.length; j++){
				if(useranswers[j].equals(fringe[i].center)){
					validChoice = false;
					break;//break if the user has already answered for this point
				}else{
					validChoice = true;
				}
			}
			if(validChoice){
				return fringe[i];
			}*/
		}
		console.log("ERROR: should never have reached this point???")
	}

	setAnswer(userID, octree, rating){
		if(this.users[userID] === undefined){
			this.users[userID] = [];
		}
		this.users[userID].push(octree.center);
		octree.assignRating(rating);
		
	}
}

class Octree{
	constructor(center, size){
		this.octants = new Array(8); //an array of undefined or Octree
		this.center = center; //center is a Point
		this.size = size;
		this.subdivided = false;
	}

	assignRating(rating){
		this.center.assignRating(rating)
		if(this.subdivided === false){
			this.subdivide()
		}
		if( this.center.ratings > RATINGS_TARGET ){
			console.log("Caution: more than %RATINGS_TARGET% ratings assigned to an octree. This is expected to occur occasionally, but not often")
		}
		return this
	}

	subdivide(){
		if(this.subdivided === true){
			console.log("Warning: attempted to subdivide octant more than once");
			return;
		}
		this.subdivided = true;

		const cx = this.center.x;
		const cy = this.center.y;
		const cz = this.center.z;
		const s  = this.size/2;

		this.octants[0] = new Octree(new Point(cx-s, cy-s, cz-s), s);
		this.octants[1] = new Octree(new Point(cx-s, cy-s, cz+s), s);
		this.octants[2] = new Octree(new Point(cx-s, cy+s, cz-s), s);
		this.octants[3] = new Octree(new Point(cx-s, cy+s, cz+s), s);
		this.octants[4] = new Octree(new Point(cx+s, cy-s, cz-s), s);
		this.octants[5] = new Octree(new Point(cx+s, cy-s, cz+s), s);
		this.octants[6] = new Octree(new Point(cx+s, cy+s, cz-s), s);
		this.octants[7] = new Octree(new Point(cx+s, cy+s, cz+s), s);

	}
/*
	addPoint(x, y, z, rating){
		if( this.center.rating === undefined ) {
			this.center.assignRating();
		}

		var i = this.getIndex(x,y,z);
		if(this.octants[i.i] === undefined){//if we are trying to add a point to an octant which is unfilled,
			this.octants[i.i] = new Octree(new Point(i.c.x, i.c.y, i.c.z), this.size/2) //subdivide this octant to hold more points
		}
		this.octants[i.i].addPoint(x, y, z, rating);//hand the task off to the 

	}
	
	getIndex(x,y,z){
		const cx = this.center.x;
		const cy = this.center.y;
		const cz = this.center.z;
		const s  = this.size/2;
		if(cx < x && cy < y && cz < z){return {i:0, c:{x:cx-s , y:cy-s , z:cz-s }};} // TODO :: maybe the +'s and -'s need to be swapped..??
		if(cx < x && cy < y && cz > z){return {i:1, c:{x:cx-s , y:cy-s , z:cz+s }};}
		if(cx < x && cy > y && cz < z){return {i:2, c:{x:cx-s , y:cy+s , z:cz-s }};}
		if(cx < x && cy > y && cz > z){return {i:3, c:{x:cx-s , y:cy+s , z:cz+s }};}
		if(cx > x && cy < y && cz < z){return {i:4, c:{x:cx+s , y:cy-s , z:cz-s }};}
		if(cx > x && cy < y && cz > z){return {i:5, c:{x:cx+s , y:cy-s , z:cz+s }};}
		if(cx > x && cy > y && cz < z){return {i:6, c:{x:cx+s , y:cy+s , z:cz-s }};}
		if(cx > x && cy > y && cz > z){return {i:7, c:{x:cx+s , y:cy+s , z:cz+s }};}
	}
*/
	getFringe(){//bfs to get a list of points on the current fringe of the Octree
		var fringe = this.octants.filter( x=>x !== undefined ).filter( x=>x.center.ratings <= RATINGS_TARGET)
		if(!fringe.length){//if fringe is all undefined, or doesn't have enough ratings
			return [this];//return just the center
		} else{//if fringe has nodes
			if(this.center.ratings <= RATINGS_TARGET){//if we need more ratings AND a fringe is defined,
				return [this].concat(this.octants.flatMap( x=>x.getFringe() )).sort((a,b)=>b.size-a.size) ;//return all of the fringe, and add ourselves to it
			} else{
				return this.octants.flatMap( x=>x.getFringe() ).sort((a,b)=>b.size-a.size) ;//if we do not need more ratings, then return all of the fringe without us in it
			}

		}
	}

	getAllRatings(){
		return this._getAllRatings().map( x=>x.center );
	}

	_getAllRatings(){
		if(this.center.ratings > 0){
			return [this].concat(this.octants.flatMap( x=>x._getAllRatings() ));
		} else {
			return [];//return nothing if there are no ratings
		}
	}
}

export {Octree, Point, Delegator}