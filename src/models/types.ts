// 뉴스 기사 타입 정의
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  isRead: boolean;
}

// 알림 타입 정의
export interface Notification {
  id: string;
  articleId: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

// 필터 설정 타입 정의
export interface FilterSettings {
  keywords: string[];
  sources: string[];
  refreshInterval: number; // 초 단위
}

// 앱 상태 타입 정의
export interface AppState {
  articles: NewsArticle[];
  notifications: Notification[];
  settings: FilterSettings;
  isLoading: boolean;
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

export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}
