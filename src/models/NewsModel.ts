// src/models/NewsModel.ts
import { NewsArticle } from './types';
import FirebaseService from '../services/FirebaseService';

class NewsModel {
  private articles: NewsArticle[] = [];
  private listeners: Array<() => void> = [];
  private firebaseSubscription: (() => void) | null = null;

  constructor() {
    this.initializeFirebaseSubscription();
  }

  // Firebase 실시간 구독 설정
  private initializeFirebaseSubscription(): void {
    this.firebaseSubscription = FirebaseService.subscribeToNews((articles) => {
      this.articles = articles;
      this.notifyListeners();
    });
  }

  // 모든 기사 가져오기
  public getArticles(): NewsArticle[] {
    return [...this.articles];
  }

  // 특정 ID의 기사 가져오기
  public async getArticleById(id: string): Promise<NewsArticle | undefined> {
    // 로컬 캐시에서 기사 찾기
    const cachedArticle = this.articles.find((article) => article.id === id);
    if (cachedArticle) {
      return cachedArticle;
    }

    // 캐시에 없으면 Firebase에서 직접 조회
    const article = await FirebaseService.getNewsById(id);
    return article || undefined;
  }

  // 기사 읽음 상태 변경
  public async markArticleAsRead(id: string): Promise<void> {
    // Firebase에 읽음 상태 업데이트
    await FirebaseService.markArticleAsRead(id);

    // 로컬 상태도 업데이트 (Firebase 구독으로 자동 업데이트되지만, 즉각적인 UI 반응을 위해)
    this.articles = this.articles.map((article) =>
      article.id === id ? { ...article, isRead: true } : article
    );
    this.notifyListeners();
  }

  // 변경 감지를 위한 리스너 추가
  public addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  // 리스너 제거
  public removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  // 모든 리스너에게 변경 알림
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // 구독 정리 (컴포넌트 unmount 시)
  public cleanup(): void {
    if (this.firebaseSubscription) {
      this.firebaseSubscription();
      this.firebaseSubscription = null;
    }
  }
}

// 싱글톤 패턴 적용
export default new NewsModel();
