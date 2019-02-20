import React, {Component} from "react";
import PropTypes from 'prop-types';
import * as d3 from "d3";

class QuestionArea extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		}


	static propTypes = {submitAnswer: PropTypes.func.isRequired};

	componentDidMount(){/*update the graph after the component mounts (and the svg is created)*/
		this.update();
	}

	update = (color) => {
		let svg = d3.select(this.refs.svg)
		
		const data = [[0 , 40, "Pastel",    "rgb(20,200,20)"],
									[60,100, "Not Pastel","rgb(200,20,20)"]]

		let rects = svg.selectAll("rect")
				.data(data)

		rects.enter()
        .append("rect")
				//.enter()
        .attr("x", d=>d[0])
				.attr("y", 10)
				.attr("width", d=>d[1]-d[0])
				.attr("height", 20)
				.attr("fill", d=>d[3])
        .on("mousedown", (d,i)=> this.props.submitAnswer((i===0)*1))

		let text = svg.selectAll("text")
				.data(data)
		/*
    text.enter()
        .append("text")
        .attr("x", d=>(d[1]+d[0])/2)
        .attr("y", 50)
        .text(d=>d[2])
        */
	}

	render() {
		return (<svg ref="svg" viewBox="0 0 100 100" height='100%' width='100%'/>);
	}
}

export default QuestionArea;
