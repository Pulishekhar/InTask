import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProjectsProvider } from './context/ProjectsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ProjectsProvider>
            <App />
          </ProjectsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);