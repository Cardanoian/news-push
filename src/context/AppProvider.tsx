import { useEffect, useState, ReactNode } from 'react';
import NewsModel from '../models/NewsModel';
import NewsController from '../controllers/NewsController';
import { initialState } from './AppContextTypes';
import { AppContext } from './AppContextInstance';

// 컨텍스트 제공자 컴포넌트
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [newsController] = useState<NewsController>(new NewsController());

  // 뉴스 모델 변경사항 감지 및 상태 업데이트
  useEffect(() => {
    const handleNewsChange = () => {
      setState((prevState) => ({
        ...prevState,
        articles: NewsModel.getArticles(),
      }));
    };

    // 리스너 등록
    NewsModel.addListener(handleNewsChange);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      NewsModel.removeListener(handleNewsChange);
    };
  }, []);

  // 앱 초기화
  useEffect(() => {
    const initializeApp = async () => {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

      try {
        // 초기 뉴스 로드
        await newsController.initializeNews();

        // 자동 새로고침 시작
        newsController.startAutoRefresh();

        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          articles: NewsModel.getArticles(),
        }));
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다.',
        }));
      }
    };

    initializeApp();

    // 컴포넌트 언마운트 시 자동 새로고침 중지
    return () => {
      newsController.stopAutoRefresh();
    };
  }, [newsController]);

  // 뉴스 새로고침
  const refreshNews = async () => {
    setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

    try {
      await newsController.fetchLatestNews();
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        articles: NewsModel.getArticles(),
      }));
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      }));
    }
  };

  // 기사 읽음 표시
  const markArticleAsRead = (id: string) => {
    newsController.markArticleAsRead(id);
  };

  // 추가 뉴스 기사 가져오기
  const fetchMoreNews = async (offset: number, limit: number) => {
    setState((prevState) => ({
      ...prevState,
      isFetchingMoreNews: true,
      error: null,
    }));
    try {
      const fetchedArticles = await newsController.fetchMoreNews(offset, limit); // 반환값 받기
      setState((prevState) => ({
        ...prevState,
        isFetchingMoreNews: false,
        articles: NewsModel.getArticles(), // NewsModel에서 업데이트된 기사 가져오기
      }));
      return fetchedArticles; // 가져온 기사 반환
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        isFetchingMoreNews: false,
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      }));
      return []; // 오류 발생 시 빈 배열 반환
    }
  };

  const contextValue = {
    state,
    refreshNews,
    markArticleAsRead,
    fetchMoreNews, // 새로운 함수 추가
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
