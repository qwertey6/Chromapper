import React, { Component } from 'react';
import './App.css';

import ColorCube from './ColorCubeTHREE.js';
import * as d3 from "d3";
//import ColorSample from './ColorSample.js';
import QuestionArea from './QuestionArea.js'

/* TODO :: move model to back-end */
import {Point, Octree, Delegator} from './Octree.js';
import SolutionSpacePointCloud from './SolutionSpacePointCloud.js';
/*console.log(Point, Octree)
*/

class App extends Component {

  constructor(props){
    super(props);
    this.ColorCube =  React.createRef();
    //this.ColorSample = React.createRef();
    this.QuestionArea =  React.createRef();
    this.SolutionSpace = React.createRef();
    this.fakeBackEnd = new Delegator();
    this.state = {viewMode: "map"};//or "view"
  }

  pickNewColor = () => {
    return "#"+Math.floor(Math.random()*16777215).toString(16);
  }

  componentDidMount(){
    this.getQuestion();
  }

  getQuestion = () => {
    this.point = this.fakeBackEnd.getNext("me")
    console.log(this.point);
    let c = this.point.center
    this.changeColor("rgb("+c.x+","+c.y+","+c.z+")");
    this.ColorCube.current.update(c.x, c.y, c.z);
  }

  changeColor = (color) => {
    d3.select("body")
      .transition()
      .style("background-color", color)
  }

  update = () => {
    let c = this.point.center
    this.changeColor("rgb("+c.x+","+c.y+","+c.z+")");
    this.ColorCube.current.update(c.x, c.y, c.z);
  }

  toggleViewMode(){
    if(this.state.viewMode == "map"){
      this.setState({viewMode:"view"})

      this.changeColor("rgb(0,0,0)")
      
    } else {
      this.setState({viewMode:"map"})

      let c = this.point.center
      this.changeColor("rgb("+c.x+","+c.y+","+c.z+")");
    }
  }

  submitResult = (result) => {
    console.log(result);
    this.fakeBackEnd.setAnswer("me", this.point, result)

    console.log(this.SolutionSpace);
    /* TODO : submit result */
    this.getQuestion();
    //this.QuestionArea.update(this.point);
    /**/
  }


  componentDidUpdate(){
    if(this.SolutionSpace.current !== null){
        this.SolutionSpace.current.updatePoints(this.fakeBackEnd.getPoints());
    }
  }

  /*  TODO :: implement this model for viewing the color space:  https://jsfiddle.net/oxwmhs4z/1/  */

  render() {
    //console.log(this.ColorSample);
    //this.update();
    console.log(this.state);
    let viewMode = this.state.viewMode;
    
    console.log(this)
    return (
      <div className="App">
        <header className="App-header">
         {viewMode === "map"  ?  <ColorCube ref={this.ColorCube}/> : null}
         {viewMode === "view" ?  <SolutionSpacePointCloud ref={this.SolutionSpace}/> : null}
         <QuestionArea ref={this.QuestionArea} toggleMode={this.toggleViewMode.bind(this)} submitAnswer={this.submitResult.bind(this)}/>
        </header>
      </div>
    );
  }
}

export default App;
