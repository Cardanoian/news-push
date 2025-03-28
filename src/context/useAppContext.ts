import { useContext } from 'react';
import { AppContext } from './AppContextInstance';

// 컨텍스트 사용을 위한 커스텀 훅
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
