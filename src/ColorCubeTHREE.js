import React, {Component} from "react";
import * as d3 from 'd3'; 
import * as THREE from 'three';
import './ColorCube.css';

//import RendererStats from 'three-webgl-stats';

const OrbitControls = require('three-orbitcontrols');



class ColorCube extends Component {
	
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
		//this.controls.e

		//ADD RENDERER
		this.renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true })
		this.renderer.setClearColor(0x000000, 0)
		this.renderer.setSize(width, height)
		this.mount.appendChild(this.renderer.domElement)
		//ADD CUBE

		var cubeSize = 256;

		const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)

		var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.VertexColors } );
		
		var color, face, numberOfSides, vertexIndex;
		
		// faces are indexed using characters
		var faceIndices = [ 'a', 'b', 'c', 'd', 'e', 'f' ];
				
		// RGB color cube
		//var size = 256;
		var point;
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
				color.setRGB( (point.x + cubeSize/2)/cubeSize, (point.y + cubeSize/2)/cubeSize, (point.z + cubeSize/2)/cubeSize);

				face.vertexColors[ j ] = color;
			}
		}

		const ext = cubeSize*1.5; // the extent of our guide lines

		var xline_geometry = new THREE.Geometry();
		xline_geometry.vertices.push(new THREE.Vector3( ext, 0, 0),
									 new THREE.Vector3( -ext, 0, 0));
		var xline_material = new THREE.LineBasicMaterial( {color:0xff0000} );

		this.xline = new THREE.Line(xline_geometry, xline_material)

		var yline_geometry = new THREE.Geometry();
		yline_geometry.vertices.push(new THREE.Vector3( 0, ext,  0),
									 new THREE.Vector3( 0, -ext, 0));
		var yline_material = new THREE.LineBasicMaterial( {color:0x00ff00} );

		this.yline = new THREE.Line(yline_geometry, yline_material)

		var zline_geometry = new THREE.Geometry();
		zline_geometry.vertices.push(new THREE.Vector3( 0, 0, ext),
									 new THREE.Vector3( 0, 0, -ext));
		var zline_material = new THREE.LineBasicMaterial( {color:0x0000ff} );

		this.zline = new THREE.Line(zline_geometry, zline_material)
		

		/*
		this.light = new THREE.PointLight(0xffffff);
		this.light.position.set(0,500,0);
		this.scene.add(this.light);
		*/
		this.cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
		this.group = new THREE.Group();
		this.group.add( this.cube )
		this.group.add( this.xline )
		this.group.add( this.yline )
		this.group.add( this.zline )
		this.scene.add( this.group )
		this.start()

		//console.log(THREE)
		//console.log(this.cube);
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

	update = (x, y, z) => {
		if(x === undefined){return;}
/*
		d3.select(this.mount)
			.on("mousedown", ()=>{
				const pi = Math.PI;
				const transtime = 1000;

				const xi = this.group.rotation.x;
				const xf = xi + 5*pi/4
				const dx = (xf - xi)/transtime

				const yi = this.group.rotation.y;
				const yf = yi + -pi / 4;
				const dy = (yf - yi)/transtime

				const zi = this.group.rotation.z;
				const zf = zi + 0
				const dz = (zf - zi)/transtime

				var trans = d3.timer((t)=>{
					this.group.rotation.x = dx * t
					this.group.rotation.y = dy * t
					this.group.rotation.z = dz * t
					if(t > transtime){trans.stop();}
				})
			})
*/
		x -= 128;
		y -= 128;
		z -= 128;

		const pi = Math.PI;
		const transtime = 6000;

		const xi = this.group.rotation.x;
		const xf = xi + pi * 2// * Math.random()
		const dx = (xf - xi)/transtime

		const yi = this.group.rotation.y;
		const yf = yi + pi * 2// * Math.random()
		const dy = (yf - yi)/transtime

		const zi = this.group.rotation.z;
		const zf = zi + pi * 2// * Math.random()
		const dz = (zf - zi)/transtime

		var trans = d3.timer((t)=>{ // slightly speed up the cube's rotation for the next 10 seconds. Makes this a bit more fun, and encourages users to keep going
			this.group.rotation.x += dx
			this.group.rotation.y += dy
			this.group.rotation.z += dz
			if(t > transtime){trans.stop();}
		})

		const movetime = 400;
		const steps = 30;

		console.log(this.yline.geometry.vertices[0])

		const dxy_slope = (y - this.xline.geometry.vertices[0].y)/steps
		const dxyi = this.xline.geometry.vertices[0].y;
		const dxy = (n) => {return (dxy_slope * n) + dxyi};

		const dxz_slope = (z - this.xline.geometry.vertices[0].z)/steps
		const dxzi = this.xline.geometry.vertices[0].z;
		const dxz = (n) => {return (dxz_slope * n) + dxzi};


		const dyx_slope = (x - this.yline.geometry.vertices[0].x)/steps
		const dyxi = this.yline.geometry.vertices[0].x;
		const dyx = (n) => {return (dyx_slope * n) + dyxi};

		const dyz_slope = (z - this.yline.geometry.vertices[0].z)/steps
		const dyzi = this.yline.geometry.vertices[0].z;
		const dyz = (n) => {return (dyz_slope * n) + dyzi};


		const dzx_slope = (x - this.zline.geometry.vertices[0].x)/steps
		const dzxi = this.zline.geometry.vertices[0].x;
		const dzx = (n) => {return (dzx_slope * n) + dzxi};

		const dzy_slope = (y - this.zline.geometry.vertices[0].y)/steps
		const dzyi = this.zline.geometry.vertices[0].y;
		const dzy = (n) => {return (dzy_slope * n) + dzyi};


		//const d$1 = $ - this.$line.geometry.vertices[1].$
		var i = 0
		console.log(this.xline)
		var trans2 = d3.interval((t)=>{ // slightly speed up the cube's rotation for the next 10 seconds. Makes this a bit more fun, and encourages users to keep going
			i++;
			this.xline.geometry.vertices[0].y = (dxy(i));
			this.xline.geometry.vertices[0].z = (dxz(i));
			
			this.xline.geometry.vertices[1].y = (dxy(i));
			this.xline.geometry.vertices[1].z = (dxz(i));

			this.yline.geometry.vertices[0].x = (dyx(i));
			this.yline.geometry.vertices[0].z = (dyz(i));
			
			this.yline.geometry.vertices[1].x = (dyx(i));
			this.yline.geometry.vertices[1].z = (dyz(i));

			this.zline.geometry.vertices[0].x = (dzx(i));
			this.zline.geometry.vertices[0].y = (dzy(i));
			
			this.zline.geometry.vertices[1].x = (dzx(i));
			this.zline.geometry.vertices[1].y = (dzy(i));
			
			this.xline.geometry.verticesNeedUpdate = true;
			this.yline.geometry.verticesNeedUpdate = true;
			this.zline.geometry.verticesNeedUpdate = true;
				
			if(t > movetime){trans2.stop();}
		}, movetime/steps)

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
				style={{ width: '500px', height: '500px' }}
				ref={(mount) => { this.mount = mount }}
			/>
		)
	}

}

export default ColorCube;













