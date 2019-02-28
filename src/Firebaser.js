const {Storage} = require('@google-cloud/storage')

var config = {
	apiKey: "AIzaSyB1Ej_luC-zb4BG2msa0Qdkpe_5Kv8KzC0",
	authDomain: "chromapper.firebaseapp.com",
	databaseURL: "https://chromapper.firebaseio.com",
	projectId: "chromapper",
	storageBucket: "chromapper.appspot.com",
	messagingSenderId: "163666301610"
};
const bucket = "gs://chromapper.appspot.com";
const projectId = config.projectId;//"chromapper";

const storage = new Storage(config)

const myBucket = storage.bucket(bucket);


// Create a root reference
//var storageRef = firebase.storage().ref();

// Create file metadata including the content type
var metadata = {
	contentType: 'application/json',
};

// Upload the file and metadata
function saveCache(data, onFinish){
	var cacheFile;
	if(onFinish === undefined){
		onFinish = ()=>{};
		cacheFile = myBucket.file('/cache_'+(Math.random()*50).toFixed(0)+'.json')
	}else{
		cacheFile = myBucket.file('/cache.json')
	}

	cacheFile.save(JSON.stringify(data), {resumable:false, public:true, metadata:metadata}, function(err){
		if (!err) {
			// File written successfully.
			console.log("Uploaded cache.json to google cloud storage!")
		}else{
			console.log("Error saving to google-cloud: ", err);
		}
		onFinish();
	})
}

function fetchCache(callback){

	const cacheFile = myBucket.file('/cache.json')

	cacheFile.download().then(function(data) {
		console.log(String(data[0]))
		const file = data[0];
		if(!file){return;}
		console.log("successfully downloaded cache.json from google-cloud")
		callback(String(data[0]))
	}).catch(function(error) {
		console.log("ERROR: while downloading cache : ", error)
		// Handle any errors
	});
}

module.exports = {saveCache, fetchCache}