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

	update = (color) => {

		
	
		this.state.width = 950;
		this.state.height = 700;
		
		
		this.state.origin = [this.state.width/2, this.state.height/2];
		this.state.scale = 1;
		this.state.j = 10;
		this.state.cubesData = [];
		this.state.alpha = 0;
		this.state.beta = 0;
		this.state.startAngle = Math.PI / 6;
		this.state.zoom = d3.zoom()
					.scaleExtent([1, 40])
					.on("zoom", this.zoomed)
					.on('start', this.zoomStart)
					.on('end', this.zoomEnd);
				
		this.state.svg = d3.select(this.refs.svg).call(this.state.zoom).append('g');
		
		this.state.svg.append("defs")
			.append("linearGradient")
			.attr("x2", "1")
			.attr("y2", "1")
			.attr("id", "testGradient")
			.html(`<stop offset="0%" stop-color="#447799" />
					<stop offset="50%" stop-color="#224488" />
					<stop offset="100%" stop-color="#112266" />`)

		this.state.color = d3.scaleOrdinal(d3.schemeCategory10);
		this.state.cubesGroup = this.state.svg//.append('g').attr('class', 'cubes').attr('transform', 'translate(0,0) scale(1)');
		this.state.mx = undefined;
		this.state.my = undefined;
		this.state.mouseX = undefined;
		this.state.mouseY = undefined;

		this.state.cubes3D = _3d()
				.shape('CUBE')
				.x((d)=> {
					return d.x;
				})
				.y((d)=> {
					return d.y;
				})
				.z((d)=> {
					return d.z;
				})
				.rotateY(this.state.startAngle)
				.rotateX(-this.state.startAngle)
				.origin(this.state.origin)
				.scale(this.state.scale);

		d3.selectAll('button').on('click', this.init);

		this.init();
	}

 zoomStart = () => {
  this.state.mx = d3.event.sourceEvent.x;
  this.state.my = d3.event.sourceEvent.y;
  if (d3.event.sourceEvent !== null && d3.event.sourceEvent.type == 'mousemove' && d3.event.sourceEvent.ctrlKey == true) {
    this.state.cubesGroup.attr("transform", d3.event.transform);
  }
}

 zoomEnd = () => {
  if (d3.event.sourceEvent == null) return;
  this.state.mouseX = d3.event.sourceEvent.x - this.state.mx + this.state.mouseX
  this.state.mouseY = d3.event.sourceEvent.y - this.state.my + this.state.mouseY
}

 zoomed = (d) => {
  if (d3.event.sourceEvent == null) return;

  if (d3.event.sourceEvent !== null && d3.event.sourceEvent.type == 'wheel') {
    this.state.cubesGroup.attr("transform", "scale(" + d3.event.transform['k'] + ")");
  } else if (d3.event.sourceEvent !== null && d3.event.sourceEvent.type == 'mousemove' && d3.event.sourceEvent.ctrlKey == true) {
    this.state.cubesGroup.attr("transform", "translate(" + d3.event.transform['x'] + "," + d3.event.transform['y'] + ") scale(" + d3.event.transform['k'] + ")");
  } else if (d3.event.sourceEvent !== null && d3.event.sourceEvent.type == 'mousemove' && d3.event.sourceEvent.ctrlKey == false) {
    this.state.mouseX = this.state.mouseX || 0;
    this.state.mouseY = this.state.mouseY || 0;
    this.state.beta = (d3.event.sourceEvent.x - this.state.mx + this.state.mouseX) * Math.PI / 230;
    this.state.alpha = (d3.event.sourceEvent.y - this.state.my + this.state.mouseY) * Math.PI / 230 * (-1);
    this.processData(this.state.cubes3D.rotateY(this.state.beta + this.state.startAngle)
      .rotateX(this.state.alpha - this.state.startAngle)(this.state.cubesData), 0);

  };
}

 processData = (data, tt) => {

  /* --------- CUBES ---------*/

  var cubes = this.state.cubesGroup.selectAll('g.cube')
    .data(data, (d)=> {
      return d.id
    });

  var ce = cubes
    .enter()
    .append('g')
    .attr('class', 'cube')
    //.attr('fill', (d)=>"url(#testGradient)")
    .attr('stroke', (d)=>d3.color(this.state.color(d.id)).darker(2))
    .merge(cubes)
    .sort(this.state.cubes3D.sort);

  cubes.exit().remove();

  /* --------- FACES ---------*/

  var faces = cubes.merge(ce)
    .selectAll('path.face')
    .data((d)=> {
        return d.faces;
      },
      (d)=> {
        return d.face;
      }
    );

  faces.enter()
    .append('path')
    .attr('class', 'face RYMW')
    .attr('fill-opacity', 0.50)
    .classed('_3d', true)
    .merge(faces)
    .transition().duration(tt)
    .attr('d', this.state.cubes3D.draw)
    //.attr("fill");

  faces.exit().remove();

  /* --------- TEXT ---------*/

  var texts = cubes.merge(ce)
    .selectAll('text.text').data((d)=>{
      var _t = d.faces.filter((d)=>{
        return d.face === 'top';
      });

      return [{
        height: d.height,
        centroid: _t[0].centroid
      }];
    });

  texts.enter()
    .append('text')
    .attr('class', 'text')
    .attr('dy', '-.7em')
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('font-weight', 'bolder')
    .attr('x', (d)=>{
      return origin[0] + this.state.scale * d.centroid.x
    })
    .attr('y', (d)=>{
      return origin[1] + this.state.scale * d.centroid.y
    })
    .classed('_3d', true)
    .merge(texts)
    .transition().duration(tt)
    .attr('fill', 'black')
    .attr('stroke', 'none')
    .attr('x', (d)=> {return origin[0] + this.state.scale * d.centroid.x})
    .attr('y', (d)=> {
      return origin[1] + this.state.scale * d.centroid.y
    })
    .tween('text', (d)=> {
      var that = d3.select(this);
      var i = d3.interpolateNumber(+that.text(), Math.abs(d.height));
      return (t)=> {
        that.text(i(t).toFixed(1));
      };
    });

  texts.exit().remove();

  /* --------- SORT TEXT & FACES ---------*/
  ce.selectAll('._3d').sort(_3d().sort);


}

 init = () => {
  this.state.cubesData = [];
  var cnt = 0;
  /*for (var z = -j / 2; z <= j / 2; z = z + 5) {
    for (var x = -j; x <= j; x = x + 5) {
      var h = d3.randomUniform(-2, -7)();
      var _cube = this.make256Cube(h, x, z);*/
      var h = 256
      var _cube = this.make256Cube(h, 0, 0);
      _cube.id = 'cube_' + cnt++;
      _cube.height = h;
      this.state.cubesData.push(_cube);
    //}
  //}
  this.processData(this.state.cubes3D(this.state.cubesData), 1000);
}

 dragStart = () => {
  console.log('dragStart')
  this.state.mx = d3.event.x;
  this.state.my = d3.event.y;
}

 dragged = () => {
  console.log('dragged')
  this.state.mouseX = this.state.mouseX || 0;
  this.state.mouseY = this.state.mouseY || 0;
  this.state.beta = (d3.event.x - this.state.mx + this.state.mouseX) * Math.PI / 230;
  this.state.alpha = (d3.event.y - this.state.my + this.state.mouseY) * Math.PI / 230 * (-1);
  this.processData(this.state.cubes3D.rotateY(this.state.beta + this.state.startAngle)
    .rotateX(this.state.alpha - this.state.startAngle)(this.state.cubesData), 0);
}

 dragEnd = () => {
  console.log('dragend')
  this.state.mouseX = d3.event.x - this.state.mx + this.state.mouseX;
  this.state.mouseY = d3.event.y - this.state.my + this.state.mouseY;
}

 make256Cube = (h, x, z) => {
  return [{
      x: x - 128,
      y: h,
      z: z + 128
    }, // FRONT TOP LEFT
    {
      x: x - 128,
      y: 0,
      z: z + 128
    }, // FRONT BOTTOM LEFT
    {
      x: x + 128,
      y: 0,
      z: z + 128
    }, // FRONT BOTTOM RIGHT
    {
      x: x + 128,
      y: h,
      z: z + 128
    }, // FRONT TOP RIGHT
    {
      x: x - 128,
      y: h,
      z: z - 128
    }, // BACK  TOP LEFT
    {
      x: x - 128,
      y: 0,
      z: z - 128
    }, // BACK  BOTTOM LEFT
    {
      x: x + 128,
      y: 0,
      z: z - 128
    }, // BACK  BOTTOM RIGHT
    {
      x: x + 128,
      y: h,
      z: z - 128
    }, // BACK  TOP RIGHT
  ];
}


	submitAnswer = (event) => {
		this.setState({results:{userAnswer: event.target.value}});
	}

	render() {
		return (<svg ref="svg" preserveAspectRatio="none" viewBox="0 0 950 700" height='100%' width='100%'/>);
	}
}

export default ColorCube;
