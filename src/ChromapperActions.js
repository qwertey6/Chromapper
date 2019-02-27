// Chromapper Actions

function postData(data, callbackfn) {
	const url = '/data'
	// Default options are marked with *
	let input = {
		method: "POST", // *GET, POST, PUT, DELETE, etc.
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		headers: {
			"Content-Type": "application/json",
		},
		body:JSON.stringify(data), // body data type must match "Content-Type" header
	};
	console.log(data, callbackfn)
	return	fetch(url, input)
			.then(response => response.json()) // parses response to JSON
			.then(newQuestion => callbackfn(newQuestion));
}



function getData(callbackfn) {
	const url = '/data';
	//if(callbackfn === undefined){ callbackfn=()=>(); }
	// Default options are marked with *
	return fetch(url, {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		headers: {"Content-Type": "application/json",}
		//body: ""//JSON.stringify(data), // body data type must match "Content-Type" header
	})
	.then(response => response.json()) // parses response to JSON
	.then(data => callbackfn(data) );
}

export {postData, getData};