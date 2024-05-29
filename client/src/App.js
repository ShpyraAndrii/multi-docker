import logo from './logo.svg';
import './App.css';
import Fib from './Fib';
import OtherPages from './OtherPages';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function App() {
  console.log("abc")
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Welcome to React</h1>
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <div>
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPages} />
        </div>
      </div>
    </Router>
  );
}

export default App;
