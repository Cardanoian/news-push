import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 서비스 워커 등록 (필요한 경우)
if ('serviceWorker' in navigator) {
  // 개발 환경에서 기존 서비스 워커 모두 해제
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (const registration of registrations) {
      registration.unregister();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('서비스 워커 등록 성공:', registration.scope);
      })
      .catch((error) => {
        console.error('서비스 워커 등록 실패:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
