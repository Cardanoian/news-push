export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  isRead: boolean;
  category: string;
}

export interface AppState {
  articles: NewsArticle[];
  isLoading: boolean;
  isFetchingMoreNews: boolean; // 추가 기사 로딩 상태
  error: string | null;
}

export interface NewsApiItem {
  id?: string;
  title: string;
  source: string;
  url: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
}
