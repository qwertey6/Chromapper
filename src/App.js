import React, { Component } from 'react';
import './App.css';

import ColorCube from './ColorCubeTHREE.js';
import * as d3 from "d3";
//import ColorSample from './ColorSample.js';
import QuestionArea from './QuestionArea.js'

import {postData, getData} from './ChromapperActions.js'
import SolutionSpacePointCloud from './SolutionSpacePointCloud.js';
/*console.log(Point, Octree)
*/

class App extends Component {

	constructor(props){
		super(props);
		this.ColorCube =	React.createRef();
		//this.ColorSample = React.createRef();
		this.QuestionArea =	React.createRef();
		this.SolutionSpace = React.createRef();
		this.state = {viewMode: "map",//or "view"
						};
	}

	componentWillMount(){
		postData({}, this.getQuestion);
	}

	componentDidMount(){
		this.getQuestion();//this.point);
	}

	getQuestion = (newPoint) => {
		if(this.point === undefined && newPoint === undefined){return;}
		console.log(this.point)
		if(newPoint !== undefined){
			this.point = newPoint;
		}
		console.log(this.point);
		this.update();
	}

	changeColor = (color) => {
		d3.select("body")
			.transition()
			.style("background-color", color)
	}

	update = () => {
		const c = this.point.center
		this.changeColor("rgb("+ c.x+","+c.y+","+c.z+")");
		this.ColorCube.current.update(c.x, c.y, c.z);
	}

	toggleViewMode(){
		if(this.state.viewMode === "map"){
			this.setState({viewMode:"view"})

			this.changeColor("rgb(0,0,0)")
			
		} else {
			this.setState({viewMode:"map"})

			const c = this.point.center
			this.changeColor("rgb("+c.x+","+c.y+","+c.z+")");
		}
	}

	submitResult = (result) => {
		console.log(this);
		console.log(result);

		//postData POSTs the result to the server
		//- the server then responds with a new question,
		//- which is then passed as the argument to this.getQuestion
		const c = this.point.center
		postData({x:c.x, y:c.y, z:c.z, result:result}, this.getQuestion);

		console.log(this.SolutionSpace);
		/* TODO : submit result */
		//this.QuestionArea.update(this.point);
		/**/
	}


	componentDidUpdate(){
		if(this.SolutionSpace.current !== null){ // check if we are in a state where we CAN ask the server for new points to render
			getData((newPoints)=>{//ask for new points to render
					if(this.SolutionSpace.current !== null){ //since this is an async call, let's make sure that we're STILL in a state where we can render the new points before rendering them
						this.SolutionSpace.current.updatePoints(newPoints);
					}
				}
			)
		}
	}

	/*	TODO :: implement this model for viewing the color space:	https://jsfiddle.net/oxwmhs4z/1/	*/

	render() {
		//console.log(this.ColorSample);
		//this.update();
		console.log(this.state);
		let viewMode = this.state.viewMode;
		
		console.log(this)
		return (
			<div className="App">
			<header className="App-header">
				{viewMode === "map" ?	<ColorCube ref={this.ColorCube}/> : null}
				{viewMode === "view"?	<SolutionSpacePointCloud ref={this.SolutionSpace}/> : null}
				<QuestionArea ref={this.QuestionArea} toggleMode={this.toggleViewMode.bind(this)} submitAnswer={this.submitResult.bind(this)}/>
			</header>
			</div>
		);
	}
}

export default App;
