import { AppState, NewsArticle } from '../models/types'; // NewsArticle 추가

// 컨텍스트 타입 정의
export interface AppContextType {
  state: AppState;
  refreshNews: () => Promise<void>;
  markArticleAsRead: (id: string) => void;
  fetchMoreNews: (offset: number, limit: number) => Promise<NewsArticle[]>; // 추가 기사 로드 함수 (반환 타입 변경)
}

// 컨텍스트 초기 상태
export const initialState: AppState = {
  articles: [],
  isLoading: false,
  isFetchingMoreNews: false, // 추가 기사 로딩 상태 초기화
  error: null,
};
