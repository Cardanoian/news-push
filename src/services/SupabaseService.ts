import { NewsArticle } from '../models/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
class SupabaseService {
  // 뉴스 기사 실시간 구독
  public subscribeToNews(onNewsUpdate: (articles: NewsArticle[]) => void) {
    // 초기 데이터 로드
    this.getNewsArticles(0, 50).then(onNewsUpdate);

    // 실시간 업데이트 구독
    const subscription = supabase
      .channel('news_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_articles',
        },
        (payload) => {
          // payload 사용하는 방법 1: 콘솔에 로깅
          console.log('새 기사가 추가되었습니다:', payload);

          // 또는 payload 사용하는 방법 2: 특정 정보 추출
          const newArticleId = payload.new?.id;
          console.log('새 기사 ID:', newArticleId);

          // 또는 방법 3: payload 변수를 제거하고 익명 함수 사용
          // 이 방법을 선택하면 다음과 같이 코드를 변경합니다:
          // }, () => {

          // 신규 기사 추가 시 클라이언트에 알림
          this.getNewsArticles(0, 50).then(onNewsUpdate);
        }
      )
      .subscribe();

    // 구독 해제 함수 반환
    return () => {
      subscription.unsubscribe();
    };
  }

  // 뉴스 기사 가져오기 (페이지네이션 적용)
  public async getNewsArticles(
    offset: number,
    limit: number
  ): Promise<NewsArticle[]> {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('뉴스 데이터 가져오기 오류:', error);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      source: item.source,
      url: item.url,
      imageUrl: item.image_url,
      publishedAt: item.published_at,
      isRead: item.is_read,
      category: item.category,
    }));
  }

  // 추가 뉴스 기사 가져오기
  public async getMoreNewsArticles(
    offset: number,
    limit: number
  ): Promise<NewsArticle[]> {
    return this.getNewsArticles(offset, limit);
  }

  // Supabase DB에서 고유한 카테고리 가져오기
  public async getUniqueCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('keywords') // 'keywords' 테이블에서
      .select('category'); // 'category' 컬럼 선택

    if (error) {
      console.error('카테고리 데이터 가져오기 오류:', error);
      return [];
    }

    // 중복 제거 및 문자열 배열로 변환
    const uniqueCategories = Array.from(
      new Set(data.map((item) => item.category))
    );
    return uniqueCategories;
  }
}

export default new SupabaseService();
