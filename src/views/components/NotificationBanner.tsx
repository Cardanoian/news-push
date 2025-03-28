import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '../../context/useAppContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const NotificationBanner: React.FC = () => {
  const { state, markAllNotificationsAsRead, handleNotificationClick } =
    useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 읽지 않은 알림 수
  const unreadCount = state.notifications.filter((note) => !note.isRead).length;

  // 알림 클릭 처리
  const onNotificationClick = (id: string) => {
    const articleId = handleNotificationClick(id);
    if (articleId) {
      setIsOpen(false);
      navigate(`/article/${articleId}`);
    }
  };

  // 모두 읽음 처리
  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px]'
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-80 p-0' align='end'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-semibold'>알림</h3>
          {state.notifications.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMarkAllRead}
              className='text-xs h-7'
            >
              모두 읽음 표시
            </Button>
          )}
        </div>

        <ScrollArea className='h-[300px]'>
          {state.notifications.length > 0 ? (
            <div className='divide-y'>
              {state.notifications.map((notification) => {
                const formattedTime = formatDistanceToNow(
                  new Date(notification.timestamp),
                  { addSuffix: true, locale: ko }
                );

                return (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onNotificationClick(notification.id)}
                  >
                    <div className='flex justify-between items-start'>
                      <h4 className='font-medium text-sm'>
                        {notification.title}
                      </h4>
                      <span className='text-xs text-gray-500'>
                        {formattedTime}
                      </span>
                    </div>
                    <p className='text-sm text-gray-700 mt-1 line-clamp-2'>
                      {notification.body}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='flex items-center justify-center h-full text-gray-500'>
              새 알림이 없습니다.
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBanner;
