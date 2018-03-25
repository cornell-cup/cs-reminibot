var React = require('react')
var ReactDOM = require('react-dom');

class HelloWorld extends React.component{

    render() {
        return (
        <div>hi</div>
        )
    }

}


ReactDOM.render(
    <HelloWorld/>, document.getElementById('root')
);