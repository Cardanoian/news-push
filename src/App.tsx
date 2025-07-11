import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import HomePage from './views/pages/HomePage';
import NewsDetailPage from './views/pages/NewsDetailPage';

const App: React.FC = () => {
  return (
    <div className='min-h-screen'>
      <AppProvider>
        <Router>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/article/:id' element={<NewsDetailPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </div>
  );
};

export default App;
