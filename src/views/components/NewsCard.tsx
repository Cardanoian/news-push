import React from 'react';
import { NewsArticle } from '../../models/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../../context/useAppContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (id: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  const { markArticleAsRead } = useAppContext();

  // 날짜 포맷팅
  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: ko,
  });

  // 기사 클릭 처리
  const handleClick = () => {
    if (!article.isRead) {
      markArticleAsRead(article.id);
    }
    onClick(article.id);
  };

  return (
    <Card
      className={`mb-4 overflow-hidden hover:shadow-md transition-shadow ${
        !article.isRead ? 'border-l-4 border-l-red-500' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-start'>
          <CardTitle className='text-lg font-bold line-clamp-2'>
            {article.title}
          </CardTitle>
          {!article.isRead && <Badge variant='destructive'>새 소식</Badge>}
        </div>
        <CardDescription className='text-sm text-gray-500'>
          {article.source} · {formattedDate}
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-2'>
        <p className='text-sm text-gray-700 line-clamp-3'>{article.content}</p>

        {article.imageUrl && (
          <div className='mt-2 h-32 overflow-hidden rounded-md'>
            <img
              src={article.imageUrl}
              alt={article.title}
              className='w-full h-full object-cover'
            />
          </div>
        )}
      </CardContent>

      <CardFooter className='pt-0'>
        <div className='flex justify-between w-full'>
          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              window.open(article.url, '_blank');
            }}
          >
            원문 보기
          </Button>

          <Button variant='outline' size='sm' onClick={handleClick}>
            자세히 보기
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
