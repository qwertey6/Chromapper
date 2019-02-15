import React, {Component} from "react";
import * as d3 from "d3";

class ColorSample extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    }
  };

	static propTypes = {};

  componentDidMount(){/*update the graph after the component mounts (and the svg is created)*/
    this.update();
  }

	update = (color) => {
    let svg = d3.select(this.refs.svg)
    
    svg.selectAll("rect")
        .data([1])
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", color)
	}

  submitAnswer = (event) => {
    this.setState({results:{userAnswer: event.target.value}});
  }

  render() {
    return (<svg ref="svg" preserveAspectRatio="none" viewBox="0 0 100 100" height='100%' width='100%'/>);
  }
}

export default ColorSample;
