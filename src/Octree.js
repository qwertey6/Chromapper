/*	Author: Jacob T. Kaplan
 *	Github: https://github.com/qwertey6
 *
 * (Yet another) Octree by Jacob T. Kaplan
 * Third language I've implemented Octrees in -- they're so useful for managing space subdivisions!
 * 		The implementation here is especially pragmatic, as we are _uniformly_ subdividing/storing points
 *		in  3D rgb space. Note: (x,y,z) ∈ [0,256] === (r,g,b) ⋲ [0, 256]. ie, colors are a 3 dimensional space.
 *		This implementation also benefits from the fact that each octree only stores the point in its center. (a side effect of the uniform subdivisions)
 *		This means that:		
 *			Insertion: 		O(1)	--		--		Since each Octree only stores its center, and no other point, then insertion is constant time.
 *			Search: 		N/a		--		--		Our use case doesn't require search
 *			Delete: 		N/a		--		--		Our use case doesn't require delete
 *			Get Fringe: 	O(n)	--		--		to find the fringe (see def below), we must recursively ask /each/ Octree if it belongs to the fringe
 *
 *	** NOTE: We define the 'Fringe' of an Octree which stores N ratings per node as all nodes which do not have at least N ratings yet
*/

const RATINGS_TARGET = 7;//each node will seek only 7 ratings

class Point{
	constructor(x,y,z, rating){
		this.x = x;
		this.y = y;
		this.z = z;
		this.rating = [];
		this.ratings = 0;
		if(rating !== undefined){
			this.rating = rating;
			this.ratings = rating.length;
		}
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
	constructor(fromCache){
		if(fromCache !== undefined){
			this.octree = new Octree(fromCache.octree);
			this.users = fromCache.users;
			for(let user in this.users){
				this.users[user] = this.users[user].map( d => new Point(d.x, d.y, d.z, d.rating))
			}
			console.log("Succesfully loaded Delegator from cache!")
		} else {
			//if we are not creating a Delegator from cache, then create an empty one with defaults
			this.users = {/*will map userID:[points they've rated], to avoid asking the same users the same questions*/};
			this.octree = new Octree(new Point(128, 128, 128), 128);
		}
	}
	getNext(userID){
		var fringe = this.octree.getFringe();
		if(this.users[userID] === undefined){
			return fringe[0];
		}
		var useranswers = this.users[userID];
		//console.log("useranswers: ", useranswers)
		for(let i=0; i<fringe.length; i++){
			if(useranswers.every( d=> !(d.equals(fringe[i].center)) )){ //if the user hasn't answered this question before,
				return fringe[i];//ask them this question
			}
		}
		console.log("ERROR: should never have reached this point???")
	}

	setAnswer(userID, octree, rating){
		if(this.users[userID] === undefined){
			this.users[userID] = [];
		}
		/*if(!(rating instanceof Point) ){
			rating = new Point()
		}*/
		console.log("octree center: ", octree.center)
		this.users[userID].push(octree.center);
		octree.assignRating(rating);
	}

	getPoints(){
		return this.octree.getAllRatings();// yay recursion
	}
}

class Octree{
	constructor(center, size){

		if(!(center instanceof Point) && size === undefined){ // if this is true, we were passed in cache from JSON.
			let data = center;
			if(data.octants.every(d=>d==null)){//if all the octants here are null
				this.octants = new Array(8);
			} else{this.octants = data.octants.map(d=>new Octree(d))}
			let c = data.center;
			this.center = new Point(c.x, c.y, c.z, c.rating);
			this.size = data.size;
			this.subdivided = data.subdivided;
		} else {
			//otherwise, we are either initializing a new Delegator, or subdividing an existing Octree
			this.octants = new Array(8); //an array of undefined or Octree
			this.center = center; //center is a Point
			this.size = size;
			this.subdivided = false;			
		}
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
		} else if ( Math.floor(this.size/2) === Math.floor(this.size) ){
			console.log("ERROR: Woah! We've filled up the entire solution space!!!")
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

module.exports = Delegator
//export {Octree, Point, Delegator // uncomment this line to export it as an ES6 module