import NotificationModel from '../models/NotificationModel';
import NewsModel from '../models/NewsModel';
import { Notification } from '../models/types';
import NotificationService from '../services/NotificationService';

class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    this.initializeNotificationPermission();
  }

  // 알림 권한 초기화
  private async initializeNotificationPermission(): Promise<void> {
    await this.notificationService.requestPermission();
  }

  // 모든 알림 조회
  public getAllNotifications(): Notification[] {
    return NotificationModel.getNotifications();
  }

  // 읽지 않은 알림만 조회
  public getUnreadNotifications(): Notification[] {
    const notifications = NotificationModel.getNotifications();
    return notifications.filter((notification) => !notification.isRead);
  }

  // 특정 알림 읽음 처리
  public markAsRead(notificationId: string): void {
    NotificationModel.markNotificationAsRead(notificationId);
  }

  // 모든 알림 읽음 처리
  public markAllAsRead(): void {
    NotificationModel.markAllNotificationsAsRead();
  }

  // 특정 알림 삭제
  public removeNotification(notificationId: string): void {
    NotificationModel.removeNotification(notificationId);
  }

  // 모든 알림 삭제
  public clearAllNotifications(): void {
    NotificationModel.clearNotifications();
  }

  // 알림 클릭 처리 (기사로 이동)
  public handleNotificationClick(notificationId: string): string | null {
    const notification = NotificationModel.getNotificationById(notificationId);
    if (!notification) return null;

    // 알림을 읽음 상태로 변경
    this.markAsRead(notificationId);

    // 해당 기사가 있는지 확인
    const article = NewsModel.getArticleById(notification.articleId);
    if (!article) return null;

    // 기사도 읽음 상태로 변경
    NewsModel.markArticleAsRead(notification.articleId);

    // 기사 ID 반환 (이동에 사용)
    return notification.articleId;
  }

  // 새 알림 테스트 (개발용)
  public async testNotification(title: string, body: string): Promise<void> {
    const testNotification: Notification = {
      id: Date.now().toString(),
      articleId: 'test',
      title,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    NotificationModel.addNotification(testNotification);
    await this.notificationService.showNotification(testNotification);
  }

  // 알림 서비스 반환 (서비스 워커 등록용)
  public getNotificationService(): NotificationService {
    return this.notificationService;
  }
}

export default NotificationController;
