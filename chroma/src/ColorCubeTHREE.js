


import React, {Component} from "react";
import * as d3 from 'd3'; 
import { _3d } from 'd3-3d';
import * as topojson from "topojson";
import './ColorCube.css';

//d3 = _3d;



const world = require('./data/world.js').default;
const names = require('./data/worldnames.js').default;
/*
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
	body: {
		background: '#fcfcfa'
	},

	stroke: {
		fill: 'none',
		stroke: '#000',
		'stroke-width': '1px'
	},

	fill: {
		fill: '#f2f2f2'
	},

	graticule: {
		fill: 'none',
		stroke: '#777',
		'stroke-width': '.5px',
		'stroke-opacity': '.5'
	},

	land: {
		fill: 'darkgrey'
	},

	boundary: {
		fill: 'none',
		stroke: '#fff',
		'stroke-width': '.5px',
	}
})*/

class ColorCube extends Component {
	
	constructor(props) {
		super(props);
		this.state = {};

	};

	static propTypes = {};

 	componentDidMount(){/*update the graph after the component mounts (and the svg is created)*/
		this.update();
 	}

 	update = () => {

		// SCENE
		scene = new THREE.Scene();
		// CAMERA
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
		var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.set(0,150,400);
		camera.lookAt(scene.position);	
		// RENDERER
		var renderer;
		if ( Detector.webgl )
			renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			renderer = new THREE.CanvasRenderer(); 
		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		container = document.getElementById( 'ThreeJS' );
		container.appendChild( renderer.domElement );
		// EVENTS
		THREEx.WindowResize(renderer, camera);
		THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
		// CONTROLS
		var controls = new THREE.OrbitControls( camera, renderer.domElement );
		// STATS
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		// LIGHT
		var light = new THREE.PointLight(0xffffff);
		light.position.set(0,250,0);
		scene.add(light);
		
		
		// RGB color cube
		var size = 80;
		var point;
		var cubeGeometry = new THREE.CubeGeometry( size, size, size, 1, 1, 1 );
		for ( var i = 0; i < cubeGeometry.faces.length; i++ ) 
		{
			face = cubeGeometry.faces[ i ];
			// determine if current face is a tri or a quad
			numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
			// assign color to each vertex of current face
			for( var j = 0; j < numberOfSides; j++ ) 
			{
				vertexIndex = face[ faceIndices[ j ] ];
				// store coordinates of vertex
				point = cubeGeometry.vertices[ vertexIndex ];
				// initialize color variable
				color = new THREE.Color( 0xffffff );
				color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
				face.vertexColors[ j ] = color;
			}
		}
		cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
		cube.position.set( 100, 50, 0 );
		scene.add(cube);
		
	}

	submitAnswer = (event) => {
		this.setState({results:{userAnswer: event.target.value}});
	}

	render() {
		return (<svg ref="svg" preserveAspectRatio="none" viewBox="0 0 950 700" height='100%' width='100%'/>);
	}
}

export default ColorCube;













