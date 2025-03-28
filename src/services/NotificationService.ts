import {
  Notification as AppNotification,
  ExtendedNotificationOptions,
} from '../models/types';

class NotificationService {
  private hasPermission: boolean = false;

  // 알림 권한 요청
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  // 알림 표시
  public async showNotification(
    notification: AppNotification
  ): Promise<boolean> {
    if (!this.hasPermission) {
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        console.warn('알림 권한이 없습니다.');
        return false;
      }
    }

    try {
      // 서비스 워커 등록 확인
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        const options: ExtendedNotificationOptions = {
          body: notification.body,
          icon: '/icons/fire-alert-icon.png',
          badge: '/icons/badge-icon.png',
          vibrate: [200, 100, 200],
          tag: notification.id,
          data: {
            articleId: notification.articleId,
            url: `/article/${notification.articleId}`,
          },
        };

        // 푸시 알림 보내기
        await registration.showNotification(notification.title, options);

        return true;
      } else {
        // 서비스 워커를 지원하지 않는 경우 기본 알림 사용
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/fire-alert-icon.png',
        });

        return true;
      }
    } catch (error) {
      console.error('알림 표시 오류:', error);
      return false;
    }
  }

  // 서비스 워커 등록
  public async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js'
        );
        console.log('서비스 워커 등록 성공:', registration.scope);
        return true;
      } catch (error) {
        console.error('서비스 워커 등록 실패:', error);
        return false;
      }
    }

    console.warn('이 브라우저는 서비스 워커를 지원하지 않습니다.');
    return false;
  }
}

export default NotificationService;
