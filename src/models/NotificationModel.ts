import { Notification } from './types';

class NotificationModel {
  private notifications: Notification[] = [];
  private listeners: Array<() => void> = [];

  // 모든 알림 가져오기
  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // 특정 ID의 알림 가져오기
  public getNotificationById(id: string): Notification | undefined {
    return this.notifications.find((notification) => notification.id === id);
  }

  // 특정 기사 ID에 관련된 알림 가져오기
  public getNotificationsByArticleId(articleId: string): Notification[] {
    return this.notifications.filter(
      (notification) => notification.articleId === articleId
    );
  }

  // 새 알림 추가
  public addNotification(notification: Notification): void {
    const readIds = JSON.parse(
      localStorage.getItem('readNotifications') || '[]'
    );
    const updatedNotification = {
      ...notification,
      isRead: readIds.includes(notification.id),
    };
    this.notifications = [updatedNotification, ...this.notifications];
    this.notifyListeners();
  }

  // 알림 읽음 상태 변경
  public markNotificationAsRead(id: string): void {
    // localStorage에 읽은 알림 ID 저장
    const readIds = JSON.parse(
      localStorage.getItem('readNotifications') || '[]'
    );
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
    }
    this.notifications = this.notifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );
    this.notifyListeners();
  }

  // 모든 알림 읽음 상태로 변경
  public markAllNotificationsAsRead(): void {
    this.notifications = this.notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    this.notifyListeners();
  }

  // 알림 삭제
  public removeNotification(id: string): void {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
    this.notifyListeners();
  }

  // 특정 기사에 관련된 모든 알림 삭제
  public removeNotificationsByArticleId(articleId: string): void {
    this.notifications = this.notifications.filter(
      (notification) => notification.articleId !== articleId
    );
    this.notifyListeners();
  }

  // 모든 알림 지우기
  public clearNotifications(): void {
    this.notifications = [];
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
}

// 싱글톤 패턴 적용
export default new NotificationModel();
