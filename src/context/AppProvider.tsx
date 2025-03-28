import { useEffect, useState, ReactNode } from 'react';
import { FilterSettings } from '../models/types';
import NewsModel from '../models/NewsModel';
import NotificationModel from '../models/NotificationModel';
import NewsController from '../controllers/NewsController';
import NotificationController from '../controllers/NotificationController';
import { initialState } from './AppContextTypes';
import { AppContext } from './AppContextInstance';

// 컨텍스트 제공자 컴포넌트
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [newsController] = useState<NewsController>(new NewsController());
  const [notificationController] = useState<NotificationController>(
    new NotificationController()
  );

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

  // 알림 모델 변경사항 감지 및 상태 업데이트
  useEffect(() => {
    const handleNotificationChange = () => {
      setState((prevState) => ({
        ...prevState,
        notifications: NotificationModel.getNotifications(),
      }));
    };

    // 리스너 등록
    NotificationModel.addListener(handleNotificationChange);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      NotificationModel.removeListener(handleNotificationChange);
    };
  }, []);

  // 앱 초기화
  useEffect(() => {
    const initializeApp = async () => {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

      try {
        // 서비스 워커 등록
        await notificationController
          .getNotificationService()
          .registerServiceWorker();

        // 초기 뉴스 로드
        await newsController.initializeNews();

        // 자동 새로고침 시작
        newsController.startAutoRefresh();

        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          articles: NewsModel.getArticles(),
          notifications: NotificationModel.getNotifications(),
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
  }, [newsController, notificationController]);

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

  // 알림 읽음 표시
  const markNotificationAsRead = (id: string) => {
    notificationController.markAsRead(id);
  };

  // 모든 알림 읽음 표시
  const markAllNotificationsAsRead = () => {
    notificationController.markAllAsRead();
  };

  // 설정 업데이트
  const updateSettings = (newSettings: Partial<FilterSettings>) => {
    newsController.updateSettings(newSettings);
    setState((prevState) => ({
      ...prevState,
      settings: { ...prevState.settings, ...newSettings },
    }));
  };

  // 알림 클릭 처리
  const handleNotificationClick = (id: string) => {
    return notificationController.handleNotificationClick(id);
  };

  const contextValue = {
    state,
    refreshNews,
    markArticleAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateSettings,
    handleNotificationClick,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
