
import logo from './logo.svg';
import './App.css';
import { useState } from './hook/useState';
import { useEffect } from 'react';
function App() {
  const [state, setState] = useState('Kamal');
  const [x, setX] = useState(1, "x");
  useEffect(() => {
    console.log(state);
  }, [state])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
          <h2 onClick={() => setX(x + 1)}>
            Hello {x}
          </h2>
        <input type={'text'} name="name" onChange={(e) => setState(e.target.value)} />
      </header>
    </div>
  );
}

export default App;
