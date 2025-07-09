import NewsModel from '../models/NewsModel';
import { NewsArticle } from '../models/types';
import SupabaseService from '../services/SupabaseService';

class NewsController {
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    // NewsService는 더 이상 직접 사용되지 않음
  }

  // 뉴스 데이터 초기 로드
  public async initializeNews(): Promise<void> {
    try {
      // SupabaseService에서 직접 초기 기사 로드
      const articles = await SupabaseService.getNewsArticles(0, 50);
      NewsModel.addArticles(articles); // NewsModel에 기사 추가
    } catch (error) {
      console.error('뉴스 초기화 오류:', error);
      throw error;
    }
  }

  // 새로운 뉴스 가져오기 (실시간 업데이트용)
  public async fetchLatestNews(): Promise<void> {
    try {
      // SupabaseService에서 최신 기사 로드 (구독을 통해 처리되므로 여기서는 필요 없을 수 있음)
      // 하지만 강제 새로고침 시 사용될 수 있으므로 유지
      const latestArticles = await SupabaseService.getNewsArticles(0, 50); // 또는 다른 로직
      NewsModel.addArticles(latestArticles);
    } catch (error) {
      console.error('뉴스 업데이트 오류:', error);
      throw error;
    }
  }

  // 자동 새로고침 시작
  public startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.fetchLatestNews();
    }, 300 * 1000); // 5분(초 단위)
  }

  // 자동 새로고침 중지
  public stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // 기사 읽음 상태 변경
  public async markArticleAsRead(articleId: string): Promise<void> {
    await NewsModel.markArticleAsRead(articleId);
  }

  // 기사 필터링 (키워드 기반)
  public filterArticlesByKeyword(keyword: string): NewsArticle[] {
    return NewsModel.filterArticlesByKeyword(keyword);
  }

  // 추가 뉴스 기사 가져오기
  public async fetchMoreNews(
    offset: number,
    limit: number
  ): Promise<NewsArticle[]> {
    // 반환 타입 변경
    try {
      const moreArticles = await SupabaseService.getMoreNewsArticles(
        offset,
        limit
      );
      if (moreArticles.length > 0) {
        NewsModel.addArticles(moreArticles);
      } else {
        console.log('더 이상 기사가 없습니다.');
      }
      return moreArticles; // 가져온 기사 반환
    } catch (error) {
      console.error('추가 뉴스 가져오기 오류:', error);
      throw error;
    }
    return []; // 오류 발생 시 빈 배열 반환
  }

  // 기사 상세 조회
  public async getArticleDetail(
    articleId: string
  ): Promise<NewsArticle | undefined> {
    return await NewsModel.getArticleById(articleId);
  }
}

export default NewsController;
