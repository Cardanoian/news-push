import { AppState, FilterSettings } from '../models/types';

// 컨텍스트 타입 정의
export interface AppContextType {
  state: AppState;
  refreshNews: () => Promise<void>;
  markArticleAsRead: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updateSettings: (newSettings: Partial<FilterSettings>) => void;
  handleNotificationClick: (id: string) => string | null;
}

// 컨텍스트 초기 상태
export const initialState: AppState = {
  articles: [],
  notifications: [],
  settings: {
    keywords: ['산불', '화재', '산림'],
    sources: [],
    refreshInterval: 300,
  },
  isLoading: false,
  error: null,
};
