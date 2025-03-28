import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { NewsArticle } from '../../models/types';
import { Button } from '@/components/ui/button';
import { Share2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';

interface NewsDetailProps {
  article: NewsArticle;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ article }) => {
  const navigate = useNavigate();
  const { markArticleAsRead } = useAppContext();

  // 컴포넌트 마운트 시 기사를 읽음 상태로 변경
  useEffect(() => {
    if (!article.isRead) {
      markArticleAsRead(article.id);
    }
  }, [article.id, article.isRead, markArticleAsRead]);

  // 날짜 포맷팅
  const formattedDate = format(new Date(article.publishedAt), 'PPP EEE p', {
    locale: ko,
  });

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
    <div className='max-w-2xl mx-auto pb-16 text-gray-700'>
      {/* 상단 버튼 */}
      <div className='sticky top-0 bg-white z-10 py-2 border-b mb-4 flex justify-between'>
        <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
          <ArrowLeft className='h-5 w-5' />
        </Button>

        <div className='flex space-x-2'>
          <Button variant='ghost' size='icon' onClick={handleShare}>
            <Share2 className='h-5 w-5' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => window.open(article.url, '_blank')}
          >
            <ExternalLink className='h-5 w-5' />
          </Button>
        </div>
      </div>

      {/* 제목 및 메타 정보 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>{article.title}</h1>
        <div className='text-sm text-gray-500 flex flex-wrap gap-2'>
          <span>{article.source}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 대표 이미지 */}
      {/* {article.imageUrl && (
        <div className='mb-6 rounded-lg overflow-hidden'>
          <img
            src={article.imageUrl}
            alt={article.title}
            className='w-full h-auto'
          />
        </div>
      )} */}

      {/* 본문 내용 */}
      <div className='prose max-w-none'>
        {article.content.split('\n').map((paragraph, index) => (
          <p key={index} className='mb-4'>
            {paragraph}
          </p>
        ))}
      </div>

      {/* 원문 링크 */}
      <div className='mt-8 pt-4 border-t'>
        <Button
          variant='outline'
          className='w-full'
          onClick={() => window.open(article.url, '_blank')}
        >
          <ExternalLink className='h-4 w-4 mr-2' />
          원문 보기
        </Button>
      </div>
    </div>
  );
};

export default NewsDetail;
