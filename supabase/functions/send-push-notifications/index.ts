/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';
/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
import webpush from 'https://esm.sh/web-push@3.5.0';

/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// VAPID 설정
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  /* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
  Deno.env.get('PUBLIC_VAPID_KEY') || '',
  /* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
  Deno.env.get('PRIVATE_VAPID_KEY') || ''
);

serve(async () => {
  try {
    // 새로운 알림 확인
    const { data: newNotifications, error } = await supabase
      .from('notifications')
      .select(
        `
        id,
        title,
        body,
        article_id,
        user_id,
        push_subscriptions (
          endpoint,
          keys
        )
      `
      )
      .eq('sent', false)
      .limit(100);

    if (error) {
      throw new Error(`알림 데이터 조회 오류: ${error.message}`);
    }

    let successCount = 0;
    let failureCount = 0;

    // 각 알림에 대해 웹 푸시 전송
    for (const notification of newNotifications) {
      if (
        !notification.push_subscriptions ||
        notification.push_subscriptions.length === 0
      ) {
        continue;
      }

      // 각 사용자의 구독 정보로 푸시 전송
      for (const subscription of notification.push_subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          };

          const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            url: `/article/${notification.article_id}`,
            icon: '/icons/fire-alert-icon.png',
          });

          await webpush.sendNotification(pushSubscription, payload);
          successCount++;
        } catch (error) {
          console.error('푸시 알림 전송 오류:', error);
          failureCount++;

          // 구독이 만료된 경우 삭제
          if (error.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          }
        }
      }

      // 알림을 전송했음으로 표시
      await supabase
        .from('notifications')
        .update({ sent: true })
        .eq('id', notification.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
