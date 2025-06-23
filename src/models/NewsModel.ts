import { NewsArticle } from './types';
import supabase from '../supabase/config';
import SupabaseService from '../services/SupabaseService';

class NewsModel {
  private articles: NewsArticle[] = [];
  private listeners: Array<() => void> = [];
  private supabaseSubscription: (() => void) | null = null;

  constructor() {
    this.initializeSupabaseSubscription();
  }

  // Supabase 실시간 구독 설정
  private initializeSupabaseSubscription(): void {
    this.supabaseSubscription = SupabaseService.subscribeToNews((articles) => {
      const readIds = JSON.parse(localStorage.getItem('readArticles') || '[]');
      this.articles = articles.map((article) => ({
        ...article,
        isRead: readIds.includes(article.id),
      }));
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

    // 캐시에 없으면 Supabase에서 직접 조회
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('기사 조회 오류:', error);
      return undefined;
    }

    // Supabase 데이터를 애플리케이션 모델 형식으로 변환
    const article: NewsArticle = {
      id: data.id,
      title: data.title,
      content: data.content,
      source: data.source,
      url: data.url,
      imageUrl: data.image_url,
      publishedAt: data.published_at,
      isRead: data.is_read,
    };

    return article;
  }

  // 기사 읽음 상태 변경
  public async markArticleAsRead(id: string): Promise<void> {
    // localStorage에 읽은 기사 ID 저장
    const readIds = JSON.parse(localStorage.getItem('readArticles') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('readArticles', JSON.stringify(readIds));
    }

    // 로컬 상태도 업데이트 (Supabase 구독으로 자동 업데이트되지만, 즉각적인 UI 반응을 위해)
    this.articles = this.articles.map((article) =>
      article.id === id ? { ...article, isRead: true } : article
    );
    this.notifyListeners();
  }

  // 기사 필터링 (키워드 기반)
  public filterArticlesByKeyword(keyword: string): NewsArticle[] {
    if (!keyword.trim()) return this.articles;

    return this.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.content.toLowerCase().includes(keyword.toLowerCase())
    );
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
    if (this.supabaseSubscription) {
      this.supabaseSubscription();
      this.supabaseSubscription = null;
    }
  }
}

// 싱글톤 패턴 적용
export default new NewsModel();
