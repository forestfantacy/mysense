import ace from 'ace';
import React from 'react';
import ReactDOM from 'react-dom';
import { initializeInput } from './input';
import init from './app';
let input, output;

const render = Component => {
  ReactDOM.render(
    <Component />,
    document.getElementById('root')
  )
}

class App extends React.Component {
  componentDidMount() {
    input = initializeInput($('#editor'), $('#editor_actions'), $('#copy_as_curl'));
    init(input);
    // input.getRequestRange((req) => {
    //   console.log(req);
    // })
  }
  handerClick = (e) => {
    input.getRequestsAsCURL((req) => {
        // console.log(req)
    })
  }
  render() {
    return (
      <div id="editor_output_container">
          <button onClick={this.handerClick}>测试</button>
          <div id="editor_container">
              <div id="editor_actions">
                <button id="copy_as_curl">复制</button>
              </div>
              <div id="editor" style={{height:'500px'}}></div>
              <div id="output_container" data-test-subj="response-editor">
              <div id="output" style={{height:'500px'}}></div>
            </div>
          </div>
      </div>
    );
  }
};

render(App)