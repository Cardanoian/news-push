import { createContext } from 'react';
import { AppContextType } from './AppContextTypes';

// 컨텍스트 인스턴스 생성 (초기값은 undefined)
export const AppContext = createContext<AppContextType | undefined>(undefined);
