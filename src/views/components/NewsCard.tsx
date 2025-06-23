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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (id: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  const { markArticleAsRead } = useAppContext();

  // 날짜 포맷팅
  const formattedDate = format(
    new Date(article.publishedAt),
    'yy년 M월 d일 H시 mm분',
    {
      locale: ko,
    }
  );

  // 기사 클릭 처리
  const handleClick = () => {
    if (!article.isRead) {
      markArticleAsRead(article.id);
    }
    onClick(article.id);
  };

  return (
    <Card
      className={`mb-4 overflow-hidden hover:shadow-md transition-shadow bg-gray-200 ${
        !article.isRead ? 'border-l-4 border-l-red-500' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className='pb-2  text-gray-800'>
        <div className='flex justify-between items-start'>
          <CardTitle className='text-lg font-bold line-clamp-2'>
            {article.title}
          </CardTitle>
          {!article.isRead && (
            <Badge className='bg-red-500 text-white hover:bg-red-300 hover:text-gray-500'>
              New!
            </Badge>
          )}
        </div>
        <CardDescription className='text-sm text-gray-500'>
          {article.source} · {formattedDate}
        </CardDescription>
      </CardHeader>

      <CardContent className='pb-2 bg-gray-200 '>
        <p className='text-sm text-gray-700 line-clamp-3'>{article.content}</p>

        {/* {article.imageUrl && (
          <div className='mt-2 h-32 overflow-hidden rounded-md'>
            <img
              src={article.imageUrl}
              alt={article.title}
              className='w-full h-full object-cover'
            />
          </div>
        )} */}
      </CardContent>

      <CardFooter className='pt-0 '>
        <div className='flex justify-between w-full text-gray-700'>
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

          <Button
            variant='outline'
            size='sm'
            className=' text-gray-700'
            onClick={handleClick}
          >
            자세히 보기
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
