var express = require('express');
var app = express();
var port = 3001;
const bodyParser = require('body-parser');
const fs = require('fs');


const concat = (x,y) =>
  x.concat(y)
const flatMap = (f,xs) =>
  xs.map(f).reduce(concat, [])
Array.prototype.flatMap = function(f) {
  return flatMap(f,this)
/* ^ taken from stack overflow. Array.flatMap will SOON be in native ECMAscript*/
}

const firebaser = require('./src/Firebaser.js')
const Delegator = require('./src/Octree.js');

app.use(bodyParser.json());
app.use(express.static('./build/'));
app.enable('trust proxy');

var users = {/*maps IP:CurrentOctreeReference*/};
var delegator = new Delegator();


app.get('/', (req, res) => {
	res.sendFile('./build/index.html');
})

app.get('/data', (req, res) => {
		//if the user is not requesting the html webpage, then send them the octree fringe instead
		//console.log(delegator.getPoints());
		res.json(delegator.getPoints())
});


app.post('/data', (req, res) => {
	console.log("ip: ", req.ip);
	var uid = req.ip;

	if((JSON.stringify(req.body) !== '{}') && (users[uid] !== undefined)) {
		let c = users[uid].center;
		console.log("body: ", req.body);
		if(c.equals(req.body)){
			console.log("users[uid]: ", users[uid])
			delegator.setAnswer(uid, users[uid], req.body.result);
		}
	}
	var question = delegator.getNext(uid);
	console.log(question.center)
	res.json(question);
	users[uid] = question; // track that the user is currently answering this question
})

function shutDown() {
		console.log('Received kill signal, shutting down gracefully');
		server.close(() => {
				console.log('Closed out remaining connections');
				//writeCache(); // call this if running on a system where you can write/read files with permanence
				
				firebaser.saveCache(delegator, ()=>{process.exit(0)});
				//process.exit(0);
		});

		setTimeout(() => {
				console.error('Could not close connections in time, forcefully shutting down (WARNING : THERE WILL BE DATA LOSS)');
				process.exit(1);
		}, 10000);

		//connections.forEach(curr => curr.end());
		//setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
//		writeCache();
}

function writeCache(){
	fs.writeFileSync("./cache.json", JSON.stringify(delegator), {encoding:'utf8', mode:0o666 ,flag:'w+'}); 
	console.log("The cache was succesfully saved!");
}

function readCache(){
	fs.readFile("./cache.json", "utf8", function(err, data) {
		if(err){console.log("Error while reading cache.json: ", err);}

		if(data !== undefined){
			try{
				let cache = JSON.parse(data);
				delegator = new Delegator(cache);
			} catch (error){
				console.log(error);
				console.log("Using fresh delegator")
			}
		}


	});
}//readCache(); // call this if running on a system where you can write/read files with permanence
firebaser.fetchCache((data)=>{
	//console.log("fetchCache returned: ",data)
	if(data !== undefined){
	try{
		let cache = JSON.parse(data);
		delegator = new Delegator(cache);
	} catch (error){
		console.log(error);
		console.log("\nUsing fresh delegator (reason: couldn't parse delegator from firebase's cache.json)\n")
	}
}
})

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);



const server = app.listen(process.env.PORT || port);