import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import ReactMarkdown from 'react-markdown';
import { Player } from '@lottiefiles/react-lottie-player';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import clickSound from '../assets/click.mp3';

const ChatBox = () => {
  const [query,setQuery]=useState('');
  const [answer,setAnswer]=useState('');
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const [showHistory,setShowHistory]=useState(false);
  const [bgImage,setBgImage]=useState('');
  const [showAvatar,setShowAvatar]=useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const click = new Audio(clickSound);

  const speak = text => { const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; window.speechSynthesis.speak(u); };

  const fetchBackground = async q => {
    try {
      const res = await fetch(`https://source.unsplash.com/1600x900/?${encodeURIComponent(q)}`);
      setBgImage(res.url);
    } catch {
      setBgImage('');
    }
  };

  const handleAsk = async () => {
    if (!query.trim()) return;
    click.play();
    setLoading(true);
    setAnswer('');
    setShowAvatar(true);
    await fetchBackground(query);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method:'POST',
        headers:{
          'Authorization':`Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          model:'openai/gpt-3.5-turbo',
          messages:[{ role:'user', content:query }]
        })
      });

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || 'No response.';
      setAnswer(reply);
      speak(reply);

      const newH = [...history, { q: query, a: reply }];
      setHistory(newH);
      localStorage.setItem('qa-history', JSON.stringify(newH));
    } catch {
      setAnswer('❌ Error fetching response.');
    }

    setLoading(false);
    setShowAvatar(false);
  };

  const handleKey = e => { if (e.key === 'Enter') handleAsk(); };

  const startListening = () => { click.play(); resetTranscript(); SpeechRecognition.startListening({ continuous: false }); };

  useEffect(() => { setQuery(transcript); }, [transcript]);
  useEffect(() => {
    const saved = localStorage.getItem('qa-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const clearHistory = () => { click.play(); setHistory([]); localStorage.removeItem('qa-history'); };

  const stopSpeaking = () => { click.play(); window.speechSynthesis.cancel(); };

  const exportPDF = () => {
    click.play();
    const doc = new jsPDF();
    doc.text('✅ Q&A History from venky-AI', 14, 20);
    const tableData = history.map((h, i) => [i+1, h.q, h.a]);
    doc.autoTable({ head: [['#','Question','Answer']], body: tableData, startY: 30 });
    doc.save('venky_ai_history.pdf');
  };

  return (
    <div className="chatbox" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}>
      <input
        type="text"
        placeholder="Ask me anything..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        className="input"
      />
      <div className="buttons">
        <button onClick={handleAsk} className="ask-button">Ask</button>
        <button onClick={startListening} className="ask-button">🎤 Voice</button>
        <button onClick={stopSpeaking} className="ask-button">🛑 Stop</button>
        <button onClick={() => setShowHistory(!showHistory)} className="ask-button">📚 {showHistory ? 'Hide' : 'Show'} History</button>
        <button onClick={clearHistory} className="ask-button danger">🧼 Clear</button>
        <button onClick={exportPDF} className="ask-button">📤 Export PDF</button>
      </div>

      {loading &&
        <Player autoplay loop src="https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json" style={{ height: 150, width: 150, margin: '0 auto' }} />
      }

      {answer &&
        <div className="assistant">
          <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Bot"/>
          <div className="bubble"><ReactMarkdown>{answer}</ReactMarkdown></div>
        </div>
      }

      {showHistory && history.length > 0 &&
        <div className="history">
          <h3>🕘 History</h3>
          {history.map((item, i) => (
            <div key={i} className="history-item">
              <p><strong>Q:</strong> {item.q}</p>
              <p><strong>A:</strong><ReactMarkdown>{item.a}</ReactMarkdown></p>
              <hr />
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default ChatBox;
