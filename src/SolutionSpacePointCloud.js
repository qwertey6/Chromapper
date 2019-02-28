import React, {Component} from "react";
//import * as d3 from 'd3'; 
import * as THREE from 'three';
import './ColorCube.css';
//import RendererStats from 'three-webgl-stats';


const OrbitControls = require('three-orbitcontrols');



class SolutionSpacePointCloud extends Component {
	
	componentDidMount(){
		const width = this.mount.clientWidth
		const height = this.mount.clientHeight
		//ADD SCENE
		this.scene = new THREE.Scene();
		//ADD CAMERA
		this.camera = new THREE.PerspectiveCamera(
			75*255,
			width / height,
			0.1*255,
			1000*255
		);
		this.camera.position.z = 4*255


		this.controls = new OrbitControls( this.camera );

		this.controls.enablePan = false;
		this.controls.maxZoom = 1.5;
		this.controls.minZoom = 0.4;

		//ADD RENDERER
		this.renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true })
		this.renderer.setClearColor(0x000000, 0)
		this.renderer.setSize(width, height)
		this.mount.appendChild(this.renderer.domElement)



		var cubeSize = 256;

		//const cubeGeometry = new THREE.EdgesGeometry( new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize) ); 
		// geometry
		var geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );

		// material
		var material = new THREE.MeshPhongMaterial( {} );

		var mesh = new THREE.Mesh( geometry, material );
		var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
		console.log(geo);
		geo.addAttribute( 'color', new THREE.Float32BufferAttribute([1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0], 3))
		var mat = new THREE.LineBasicMaterial( { vertexColors:THREE.VertexColors, linewidth: 2 } );
		var wireframe = new THREE.LineSegments( geo, mat );
		this.cube = wireframe


		this.points = [{x:0, y:0, z:0, ratings:3, rating:[0,0,0]}]
		this.MAX_POINTS = 8;

		this.alphas = new Float32Array( this.MAX_POINTS * 1 ); // 1 alpha value per vertex
		this.colors = new Float32Array( this.MAX_POINTS * 3 ); //an array of colors for our points. 3 values per color
		this.positions = new Float32Array( this.MAX_POINTS * 3 ); //an array of coordinates for rendering. 3 values per position

		var color = new THREE.Color()
		this.count = 0;

		geometry = new THREE.BufferGeometry();

		this.points.forEach(point=>{
			const [rgb, conf] = [[point.x, point.y, point.z], point.rating.reduce((n,c)=>n+c,0)/point.ratings];
			const xyz = [rgb[0] - 128, rgb[1] - 128, rgb[2] - 128];//xyz is memof[-128,128], while rgb is memof[0,256]. So we translate by -128

			this.alphas[this.count] = conf;//assign our alpha for this point

			this.positions[this.count*3 + 0] = xyz[0];// add this points positions
			this.positions[this.count*3 + 1] = xyz[1];// add this points positions
			this.positions[this.count*3 + 2] = xyz[2];// add this points positions

			color.setRGB(rgb[0]/256, rgb[1]/256, rgb[1]/256);//scale rgb by 1/256, as openGL color values are memof[0,1]
			this.colors[this.count*3 + 0] = color.r;
			this.colors[this.count*3 + 1] = color.g;
			this.colors[this.count*3 + 2] = color.b;
			this.count++;
		})
 

		geometry.addAttribute( 'alpha', new THREE.Float32BufferAttribute( this.alphas, 1 ) );
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( this.positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 3 ) );
	
	//var material = new THREE.PointsMaterial( { size: 15, vertexColors: THREE.VertexColors } );
	
	// point cloud material
	this.shaderMaterial = new THREE.ShaderMaterial( {
		vertexShader:`
			attribute float alpha;
			attribute vec3 color;
			varying vec4 rgba;
			void main() {
				//vAlpha = alpha;
				rgba = vec4(color, alpha);
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_PointSize = 8.0;
				gl_Position = projectionMatrix * mvPosition;
			}`,
		fragmentShader:`
			//varying vec3 color;
			//varying float vAlpha;
			varying vec4 rgba;
			void main() {
				gl_FragColor = vec4( rgba );
			}`,
		transparent:true

	});

	// point cloud
	this.cloud = new THREE.Points( geometry, this.shaderMaterial );
	this.cloud.name = "pointcloud";
	this.group = new THREE.Group();
	this.group.add( this.cube )
	this.group.add( this.cloud )
	this.scene.add( this.group );

	this.start()
	}

	componentWillUnmount(){
		this.stop()
		this.mount.removeChild(this.renderer.domElement)
	}

	start = () => {
		if (!this.frameId) {
			this.frameId = requestAnimationFrame(this.animate)
		}
	}

/*******************************************************

var renderer, scene, camera, cloud, uniforms;

init();
animate();

function init() {

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	
	// scene
	scene = new THREE.Scene();

	//camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 400;

	// point cloud geometry
	var geometry = new THREE.SphereBufferGeometry( 100, 16, 8 );

	// add an attribute
	numVertices = geometry.attributes.position.count;
	var this.alphas = new Float32Array( numVertices * 1 ); // 1 values per vertex

	for( var i = 0; i < numVertices; i ++ ) {
	
		// set alpha randomly
		this.alphas[ i ] = Math.random();

	}
 
	geometry.addAttribute( 'alpha', new THREE.BufferAttribute( this.alphas, 1 ) );

	// uniforms
	uniforms = {

		color: { value: new THREE.Color( Math.random()*0xffffff ) },

	};

	// point cloud material
	var shaderMaterial = new THREE.ShaderMaterial( {

		uniforms:	   uniforms,
		vertexShader:   `attribute float alpha;

	varying float vAlpha;

	void main() {

		vAlpha = alpha;

		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

		gl_PointSize = 8.0;

		gl_Position = projectionMatrix * mvPosition;

	}
`,
		fragmentShader: `uniform vec3 color;

	varying float vAlpha;

	void main() {

		gl_FragColor = vec4( color, vAlpha );

	}
`,
		transparent:	true

	});

	// point cloud
	cloud = new THREE.Points( geometry, shaderMaterial );

	scene.add( cloud );

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	var this.alphas = cloud.geometry.attributes.alpha;
	var colors = cloud.geometry.attributes;
	//console.log(colors)
	var count = this.alphas.count;
	
	for( var i = 0; i < count; i ++ ) {
	
		// dynamically change this.alphas
		this.alphas.array[ i ] *= 0.95;
		
		if ( this.alphas.array[ i ] < 0.01 ) { 
			this.alphas.array[ i ] = 1.0;
		}
		
	}

	this.alphas.needsUpdate = true; // important!

	//cloud.rotation.x += 0.005;
	cloud.rotation.y += 0.005;
	
	renderer.render( scene, camera );

}
*//////////////////////////////////////

/*
	setPoints = () => {

		var positions = pointCloud.geometry.attributes.position.array;
		var colors = pointCloud.geometry.attributes.color.array;

		var x, y, z, index;

		var l = currentPoints + nbPoints;
		if (l >= MAX_POINTS) {
			clearInterval(interval);
			console.log('Milliseconds to render ' + MAX_POINTS + ' points: ');
			console.log(Date.now() - startTime);
			console.log('Expected milliseconds: ' + (INTERVAL_DURATION * MAX_POINTS / nbPoints));
		}
		currentPointsIndex = 0
		arr_xyz = data_xyz;
		arr_color = data_color;
		if (currentTimestep == data_xyz.length) {
			currentTimestep = 0
		}

		for (var i = 0; i < arr_xyz.length; i++) {
			point_xyz = arr_xyz[i];
			point_color = arr_color[i];
			positions[currentPointsIndex] = point_xyz[0];
			colors[currentPointsIndex++] = point_color[0];
			positions[currentPointsIndex] = point_xyz[1];
			colors[currentPointsIndex++] = point_color[1];
			positions[currentPointsIndex] = point_xyz[2];
			colors[currentPointsIndex++] = point_color[2];
		}

		currentPoints = currentPointsIndex;
		pointCloud.geometry.attributes.position.needsUpdate = true;
		pointCloud.geometry.attributes.color.needsUpdate = true;
		pointCloud.geometry.setDrawRange(0, currentPoints);
		update();

	}
*/

	createNewGeometry(){
		this.alphas = new Float32Array( this.MAX_POINTS * 1 ); // 1 alpha value per vertex
		this.colors = new Float32Array( this.MAX_POINTS * 3 ); //an array of colors for our points. 3 values per color
		this.positions = new Float32Array( this.MAX_POINTS * 3 ); //an array of coordinates for rendering. 3 values per position

		var geometry = new THREE.BufferGeometry();

		geometry.addAttribute( 'alpha', new THREE.Float32BufferAttribute( this.alphas, 1 ) );
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( this.positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 3 ) );

		this.scene.remove(this.scene.getObjectByName(this.cloud.name))

		this.cloud = new THREE.Points( geometry, this.shaderMaterial );
		this.cloud.name = "pointcloud";

		this.group.add(this.cloud);
	}

	updatePoints = (points) => {
		if(points === undefined){return;}
		this.points = points;
		var needsNewGeometry = false;
		while(this.MAX_POINTS < this.points.length){
			this.MAX_POINTS *= 2; //keep doubling the size of our new buffers until we can take on all of our points again
			needsNewGeometry = true;
		} if (needsNewGeometry){
			this.createNewGeometry();
		}
		//if(this.points === undefined){return;}
		console.log(this.cloud)

		this.count = 0;
		
		this.points.forEach(point=>{
			const [rgb, conf] = [[point.x, point.y, point.z], point.rating.reduce((n,c)=>n+c,0)/point.ratings];
			const xyz = [rgb[0] - 128, rgb[1] - 128, rgb[2] - 128];//xyz is memof[-128,128], while rgb is memof[0,256]. So we translate by -128
			console.log(this.cloud);
			this.cloud.geometry.attributes.alpha.array[this.count] = conf;//assign our alpha for this point

			this.cloud.geometry.attributes.position.array[this.count*3 + 0] = xyz[0];// add this points positions
			this.cloud.geometry.attributes.position.array[this.count*3 + 1] = xyz[1];// add this points positions
			this.cloud.geometry.attributes.position.array[this.count*3 + 2] = xyz[2];// add this points positions

			//color.setRGB(rgb[0]/256, rgb[1]/256, rgb[1]/256);//scale rgb by 1/256, as openGL color values are memof[0,1]
			this.cloud.geometry.attributes.color.array[this.count*3 + 0] = rgb[0]/256;
			this.cloud.geometry.attributes.color.array[this.count*3 + 1] = rgb[1]/256;
			this.cloud.geometry.attributes.color.array[this.count*3 + 2] = rgb[2]/256;
			this.count++;
		})

		this.cloud.geometry.setDrawRange(0, this.count);
		this.cloud.geometry.attributes.alpha.needsUpdate = true;
		this.cloud.geometry.attributes.position.needsUpdate = true;
		this.cloud.geometry.attributes.color.needsUpdate = true;
	 	
	}

	
	stop = () => {
		cancelAnimationFrame(this.frameId)
	}
	
	animate = () => {
		//*
		this.group.rotation.x += 0.001
		this.group.rotation.y += 0.001
		this.group.rotation.z += 0.001
		/**/
		this.renderScene()
		this.frameId = window.requestAnimationFrame(this.animate)
	}
	
	renderScene = () => {
		this.renderer.render(this.scene, this.camera)
	}

	render(){
		return(
			<div
				style={{ width: '700px', height: '700px' }}
				ref={(mount) => { this.mount = mount }}
			/>
		)
	}

}

export default SolutionSpacePointCloud;













