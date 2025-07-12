import React from 'react';
import { NewsArticle } from '../../models/types';
import {
  Card,
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
import { ExternalLink, Share2 } from 'lucide-react';

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

  // 공유 기능
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 100) + '...',
          url: article.url,
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // 공유 API를 지원하지 않는 브라우저에서는 URL 복사
      navigator.clipboard.writeText(article.url);
      alert('URL이 클립보드에 복사되었습니다.');
    }
  };

  return (
    <Card
      className={`flex flex-col overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-lg rounded-3xl ${
        !article.isRead ? 'ring-2 ring-orange-400' : ''
      }`}
      onClick={handleClick}
    >
      {/* 이미지 섹션 */}
      {article.imageUrl && (
        <div className='relative'>
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-full h-48 object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
          <Badge className='absolute top-4 left-4 bg-red-100 text-red-800 rounded-full px-3 py-1 ml-2'>
            {article.category}
          </Badge>
          {!article.isRead && (
            <Badge className='absolute top-4 right-4 bg-orange-500 text-white hover:bg-orange-600 rounded-full px-3 py-1'>
              새로운 소식
            </Badge>
          )}
        </div>
      )}

      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between mb-2'>
          <Badge
            variant='secondary'
            className='bg-blue-100 text-blue-500 rounded-full px-3 py-1'
          >
            {article.source}
          </Badge>
          <CardDescription className='text-xs text-muted-foreground'>
            {formattedDate}
          </CardDescription>
        </div>

        <CardTitle className='text-lg leading-tight line-clamp-2 text-gray-200'>
          {article.title}
        </CardTitle>

        <CardDescription className='text-sm line-clamp-3 leading-relaxed text-gray-500'>
          {article.content}
        </CardDescription>
      </CardHeader>

      <CardFooter className='pt-0 mt-auto'>
        <div className='flex items-center justify-between w-full '>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full bg-gradient-to-r from-gray-100 to-gray-300 hover:from-gray-600 hover:to-gray-900 shadow-lg shadow-gray-500/25 transition-colors duration-700 group'
            onClick={(e) => {
              e.stopPropagation();
              window.open(article.url, '_blank');
            }}
          >
            <ExternalLink className='h-4 w-4 mr-2 text-gray-800 group-hover:text-white transition-colors duration-700' />
            <p className='text-gray-800 group-hover:text-white transition-colors duration-700'>
              원문 보기
            </p>
          </Button>

          <Button
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className='rounded-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-600 hover:to-blue-900 shadow-lg shadow-blue-500/25 transition-colors duration-700 group'
          >
            <Share2 className='h-5 w-5 text-gray-800 group-hover:text-white transition-colors duration-700' />
            <p className='text-gray-800 group-hover:text-white transition-colors duration-700'>
              공유하기
            </p>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
