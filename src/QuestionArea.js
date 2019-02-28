import React, {Component} from "react";
import PropTypes from 'prop-types';
//import * as d3 from "d3";

class QuestionArea extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.buttonVisibility = 1
		}


	static propTypes = {submitAnswer: PropTypes.func.isRequired,
						toggleMode: PropTypes.func.isRequired};

	componentWillMount(){/*update the graph after the component mounts (and the svg is created)*/
		this.submitAnswer = this.props.submitAnswer;
	}

	toggleMode(){

		if(this.buttonVisibility === 1){
			this.buttonVisibility = 0;
			this.refs.toggle.style.color = "white";
			this.submitAnswer = ()=>{};
		} else {
			this.buttonVisibility = 1;
			this.refs.toggle.style.color = "black"
			this.submitAnswer = this.props.submitAnswer;
		}
		this.refs.yes.style.visibility =  this.buttonVisibility;
		this.refs.no.style.visibility = this.buttonVisibility;
		this.props.toggleMode();
	}

	render() {
		return(
			<div width="100%">
				<button ref="yes" onClick={d=>this.submitAnswer(1)} disabled={this.buttonVisibility ? "" : "disabled"} style={
					{//"width":'40%',
					x:'0%',
					//padding:'10px 24px',
					borderRadius:'10px',
					backgroundColor: 'rgba(0,0,0,0)',
					textAlign: 'center',
					textDecoration: 'none',
					fontSize: '16px',
					border: '2px solid #4CAF50',
					color: 'black',
					padding: '15px 32px',
					display: 'inline-block',
					"-webkit-appearance": 'none',
					"-moz-appearance": 'none',
					appearance: 'none',
					opacity:this.buttonVisibility
					}
				}>Background IS Pastel</button>
				<button ref="toggle" onClick={d=>this.toggleMode()} style={
					{//"width":'20%',
					 x:'0%',
					 backgroundColor: 'rgba(0,0,0,0)',
					 textAlign:'center',
					 textDecoration: 'none',
					 fontSize: '16px',
					 border: 'none',
					 color: 'black',
					 padding: '15px 32px',
					 margin:'auto',
					 display: 'inline-block',
					}
				}>{this.buttonVisibility === 'visible' ? 'View Results': 'Map Colors' }</button>
				<button ref="no" onClick={d=>this.submitAnswer(0)} disabled={this.buttonVisibility ? "" : "disabled"} style={
					{//"width":'40%',
					 //padding:'10px 24px',
					 borderRadius:'10px',
					 backgroundColor: 'rgba(0,0,0,0)',
					 textAlign: 'center',
					 textDecoration: 'none',
					 fontSize: '16px',
					 border: '2px solid #F44336',
					 color: 'black',
					 padding: '15px 32px',
					 display: 'inline-block',
					 opacity:this.buttonVisibility
					}
				}>Background NOT Pastel</button>
			</div>)
		//return (<svg ref="svg" viewBox="0 0 100 100" height='100%' width='100%'/>);
	}
}

export default QuestionArea;
