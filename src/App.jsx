import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => {
    document.body.classList.toggle('light');
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-container">
      <h1 className="title typewriter">🌍 <span className="rainbow-text">@venky-AI</span> Q&A App</h1>
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>
      <ChatBox />
    </div>
  );
}

export default App;
