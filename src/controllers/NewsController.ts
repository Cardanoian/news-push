import { v4 as uuidv4 } from 'uuid';
import NewsModel from '../models/NewsModel';
import NotificationModel from '../models/NotificationModel';
import { NewsArticle, FilterSettings } from '../models/types';
import NewsService from '../services/NewsService';
import NotificationService from '../services/NotificationService';
import supabase from '../supabase/config';

class NewsController {
  private newsService: NewsService;
  private notificationService: NotificationService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private settings: FilterSettings = {
    keywords: ['산불', '화재', '산림'],
    sources: [],
    refreshInterval: 300, // 5분(초 단위)
  };

  constructor() {
    this.newsService = new NewsService();
    this.notificationService = new NotificationService();
  }

  // 뉴스 데이터 초기 로드
  public async initializeNews(): Promise<void> {
    try {
      const articles = await this.newsService.fetchFireNews(this.settings);

      // 각 기사를 Supabase에 직접 추가
      for (const article of articles) {
        await this.addNewArticleToDatabase(article);
      }
    } catch (error) {
      console.error('뉴스 초기화 오류:', error);
      throw error;
    }
  }

  // 새로운 뉴스 가져오기 및 알림 처리
  public async fetchLatestNews(): Promise<void> {
    try {
      const latestArticles = await this.newsService.fetchFireNews(
        this.settings
      );
      const newArticles: NewsArticle[] = [];

      // 각 기사를 확인하고 새 기사면 추가
      for (const article of latestArticles) {
        const isNew = await this.addNewArticleToDatabase(article);
        if (isNew) {
          newArticles.push(article);
        }
      }

      // 새 기사가 있으면 알림 생성
      if (newArticles.length > 0) {
        for (const article of newArticles) {
          const notification = {
            id: uuidv4(),
            articleId: article.id,
            title: '산불 속보',
            body: article.title,
            timestamp: new Date().toISOString(),
            isRead: false,
          };

          NotificationModel.addNotification(notification);
          await this.notificationService.showNotification(notification);
        }
      }
    } catch (error) {
      console.error('뉴스 업데이트 오류:', error);
      throw error;
    }
  }

  // 새 기사를 데이터베이스에 추가 (헬퍼 메서드)
  private async addNewArticleToDatabase(
    article: NewsArticle
  ): Promise<boolean> {
    // URL 기준으로 중복 확인
    const { data, error } = await supabase
      .from('news_articles')
      .select('id')
      .eq('url', article.url)
      .maybeSingle();

    if (error) {
      console.error('기사 중복 확인 오류:', error);
      return false;
    }

    // 중복이 없는 경우에만 추가
    if (!data) {
      const { error: insertError } = await supabase
        .from('news_articles')
        .insert({
          id: article.id,
          title: article.title,
          content: article.content,
          source: article.source,
          url: article.url,
          image_url: article.imageUrl,
          published_at: article.publishedAt,
          is_read: false,
        });

      if (insertError) {
        console.error('기사 저장 오류:', insertError);
        return false;
      }

      return true;
    }

    return false;
  }

  // 자동 새로고침 시작
  public startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.fetchLatestNews();
    }, this.settings.refreshInterval * 1000);
  }

  // 자동 새로고침 중지
  public stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // 설정 업데이트
  public updateSettings(newSettings: Partial<FilterSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    // 갱신 주기가 변경되었다면 자동 새로고침 재시작
    if (newSettings.refreshInterval && this.refreshInterval) {
      this.stopAutoRefresh();
      this.startAutoRefresh();
    }
  }

  // 기사 읽음 상태 변경
  public async markArticleAsRead(articleId: string): Promise<void> {
    await NewsModel.markArticleAsRead(articleId);

    // 해당 기사의 알림도 읽음 상태로 변경
    const notifications =
      NotificationModel.getNotificationsByArticleId(articleId);
    for (const notification of notifications) {
      await NotificationModel.markNotificationAsRead(notification.id);
    }
  }

  // 기사 필터링 (키워드 기반)
  public filterArticlesByKeyword(keyword: string): NewsArticle[] {
    return NewsModel.filterArticlesByKeyword(keyword);
  }

  // 기사 상세 조회
  public async getArticleDetail(
    articleId: string
  ): Promise<NewsArticle | undefined> {
    return await NewsModel.getArticleById(articleId);
  }
}

export default NewsController;
