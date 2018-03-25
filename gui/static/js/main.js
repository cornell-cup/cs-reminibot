var React = require('react');
var ReactDOM = require('react-dom');

class HelloWorld extends React.Component{
    render() {
        return (
        	<div>h3llo2 world</div>
        )
    }
}

ReactDOM.render(
    <HelloWorld/>, document.getElementById('root')
);