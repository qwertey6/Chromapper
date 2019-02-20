import React, {Component} from "react";
import * as d3 from "d3";

class ColorSample extends Component {
  constructor(props) {
    super(props);
    this.state = {color:""};
    }


	static propTypes = {};

  componentDidMount(){/*update the graph after the component mounts (and the svg is created)*/
    this.update();
  }

  changeColor = (color) => {
    this.setState({color:color})
    d3.select("body")
      .transition()
      .style("background-color", this.state.color)
  }

	update = () => {
    let svg = d3.select(this.refs.svg)
    
    svg.selectAll("rect")
        .data([1])
        .enter()
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .transition()
        .attr("fill", this.state.color)
	}

  render() {
    this.update();
    return null;//(<svg ref="svg" preserveAspectRatio="none" viewBox="0 0 100 100" height='100' width='100'/>);
  }
}

export default ColorSample;
