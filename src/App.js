import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Welcome message */}
        <h1>Welcome to My React Application</h1>
        <p>This is a simple welcome page using React.</p>
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn LLM
        </a>
      </header>
    </div>
  );
}

export default App;
