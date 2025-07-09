import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { NewsArticle } from '../../models/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden border-0'>
          {/* 이미지 섹션 */}
          <div className='relative'>
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className='w-full h-64 object-cover'
              />
            ) : (
              <div className='w-full h-64 object-cover text-3xl md:text-6xl text-gray-700 flex items-center justify-center'>
                이미지가 없습니다.
              </div>
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent '></div>

            {/* 상단 버튼들 */}
            <div className='absolute top-6 left-6 right-6 flex items-center justify-between'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => navigate(-1)}
                className='absolute top-1 left-1 bg-white/80 backdrop-blur-sm rounded-full border-0 shadow-lg group'
              >
                <ArrowLeft className='h-5 w-5 text-gray-800 group-hover:text-white transition-colors duration-700' />
              </Button>

              <Button
                variant='outline'
                size='icon'
                onClick={handleShare}
                className='absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full border-0 shadow-lg group'
              >
                <Share2 className='h-5 w-5 text-gray-800 group-hover:text-white transition-colors duration-700' />
              </Button>
            </div>
          </div>

          {/* 콘텐츠 섹션 */}
          <div className='p-8 bg-white'>
            {/* 제목 및 메타 정보 */}
            <div className='mb-6'>
              <div className='flex items-center gap-4 mb-4'>
                <Badge className='bg-blue-100 text-blue-800 rounded-full px-3 py-1'>
                  {article.source}
                </Badge>
                <span className='text-sm text-gray-600'>{formattedDate}</span>
              </div>

              <h1 className='text-3xl font-bold mb-6 leading-tight text-gray-900'>
                {article.title}
              </h1>
            </div>

            {/* 본문 내용 */}
            <div className='text-gray-800 leading-relaxed mb-8'>
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className='mb-4 text-lg'>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 원문 링크 */}
            <div className='pt-6 border-t border-gray-100'>
              <Button
                className='w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 text-gray-100'
                onClick={() => window.open(article.url, '_blank')}
              >
                <ExternalLink className='h-4 w-4 mr-2 text-gray-100' />
                원문 보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
