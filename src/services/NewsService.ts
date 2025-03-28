import { v4 as uuidv4 } from 'uuid';
import { NewsArticle, FilterSettings, NewsApiItem } from '../models/types';

class NewsService {
  private API_URL = '/api/news'; // API 엔드포인트 예시 (실제 구현 필요)

  // 산불 관련 뉴스 가져오기
  public async fetchFireNews(settings: FilterSettings): Promise<NewsArticle[]> {
    try {
      // 실제 환경에서는 여기서 서버 API를 호출하거나 크롤링 서비스를 이용
      // 개발 환경 예시 코드
      const response = await fetch(this.API_URL);

      if (!response.ok) {
        throw new Error('뉴스 데이터를 가져오는 데 실패했습니다.');
      }

      const data = await response.json();
      return this.processNewsData(data, settings);
    } catch (error) {
      console.error('뉴스 서비스 오류:', error);

      // 개발 중 테스트를 위한 샘플 데이터 반환
      return this.getMockData(settings);
    }
  }

  // API 응답 데이터 처리
  private processNewsData(
    data: NewsApiItem[],
    settings: FilterSettings
  ): NewsArticle[] {
    // API 응답 데이터 형식에 맞게 변환 로직 작성
    const articles: NewsArticle[] = data.map((item) => ({
      id: item.id || uuidv4(),
      title: item.title,
      source: item.source,
      url: item.url,
      content: item.content,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      isRead: false,
    }));

    // 필터 설정에 맞게 필터링
    return this.filterArticles(articles, settings);
  }

  // 설정에 따라 기사 필터링
  private filterArticles(
    articles: NewsArticle[],
    settings: FilterSettings
  ): NewsArticle[] {
    let filteredArticles = [...articles];

    // 키워드 필터링
    if (settings.keywords.length > 0) {
      filteredArticles = filteredArticles.filter((article) => {
        return settings.keywords.some(
          (keyword) =>
            article.title.includes(keyword) || article.content.includes(keyword)
        );
      });
    }

    // 출처 필터링
    if (settings.sources.length > 0) {
      filteredArticles = filteredArticles.filter((article) =>
        settings.sources.includes(article.source)
      );
    }

    return filteredArticles;
  }

  // 개발용 샘플 데이터
  private getMockData(settings: FilterSettings): NewsArticle[] {
    const currentDate = new Date().toISOString();

    const mockArticles: NewsArticle[] = [
      {
        id: uuidv4(),
        title: '강원도 양양 산불 발생, 주민 대피령',
        source: '뉴스A',
        url: 'https://example.com/news/1',
        content:
          '오늘 오후 2시경 강원도 양양군에서 산불이 발생했습니다. 현재 소방당국이 진화 작업 중이며, 인근 주민들에게 대피령이 내려졌습니다.',
        imageUrl: 'https://example.com/images/fire1.jpg',
        publishedAt: currentDate,
        isRead: false,
      },
      {
        id: uuidv4(),
        title: '경북 포항 산림 화재, 헬기 5대 투입',
        source: '뉴스B',
        url: 'https://example.com/news/2',
        content:
          '경상북도 포항시 북구 산림지역에서 화재가 발생해 헬기 5대와 소방차 10대가 투입되었습니다. 현재까지 인명피해는 없으며, 진화율은 30%입니다.',
        imageUrl: 'https://example.com/images/fire2.jpg',
        publishedAt: currentDate,
        isRead: false,
      },
      {
        id: uuidv4(),
        title: '제주 서귀포 산불 완전 진화, 피해 조사 중',
        source: '뉴스C',
        url: 'https://example.com/news/3',
        content:
          '어제 발생한 제주 서귀포시 산불이 12시간 만에 완전 진화되었습니다. 산림청은 현재 피해 규모를 조사 중이며, 예비 조사 결과 약 5헥타르의 산림이 소실된 것으로 파악됩니다.',
        imageUrl: 'https://example.com/images/fire3.jpg',
        publishedAt: currentDate,
        isRead: false,
      },
    ];

    return this.filterArticles(mockArticles, settings);
  }
}

export default NewsService;
