import supabase from '../supabase/config';
import { NewsArticle, FilterSettings } from '../models/types';

class SupabaseService {
  // 뉴스 기사 실시간 구독
  public subscribeToNews(onNewsUpdate: (articles: NewsArticle[]) => void) {
    // 초기 데이터 로드
    this.getLatestNews().then(onNewsUpdate);

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
          this.getLatestNews().then(onNewsUpdate);
        }
      )
      .subscribe();

    // 구독 해제 함수 반환
    return () => {
      subscription.unsubscribe();
    };
  }

  // 최신 기사 가져오기
  public async getLatestNews(): Promise<NewsArticle[]> {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

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
    }));
  }

  // 기사 읽음 상태 업데이트
  public async markArticleAsRead(id: string, userId?: string): Promise<void> {
    // 기사 상태 업데이트
    const { error } = await supabase
      .from('news_articles')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('기사 상태 업데이트 오류:', error);
    }

    // 사용자별 읽음 상태 기록 (로그인한 경우)
    if (userId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('article_id', id)
        .eq('user_id', userId);
    }
  }

  // 사용자 설정 저장
  public async saveUserSettings(
    userId: string,
    settings: FilterSettings
  ): Promise<void> {
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      keywords: settings.keywords,
      refresh_interval: settings.refreshInterval,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('사용자 설정 저장 오류:', error);
    }
  }

  // 푸시 알림 구독 등록
  public async savePushSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<void> {
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: JSON.stringify({
        p256dh: subscription.toJSON().keys?.p256dh,
        auth: subscription.toJSON().keys?.auth,
      }),
    });

    if (error) {
      console.error('푸시 구독 저장 오류:', error);
    }
  }
}

export default new SupabaseService();
