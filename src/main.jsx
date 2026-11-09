import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AcademyProvider } from './context/AcademyContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AcademyProvider>
      <App />
    </AcademyProvider>
  </React.StrictMode>
);

