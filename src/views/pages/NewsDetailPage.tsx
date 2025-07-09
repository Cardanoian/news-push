import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewsDetail from '../components/NewsDetail';
import { useAppContext } from '../../context/useAppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAppContext();

  // 현재 ID에 해당하는 기사 찾기
  const article = state.articles.find((article) => article.id === id);

  // 기사를 찾지 못했을 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!article && !state.isLoading) {
      navigate('/', { replace: true });
    }
  }, [article, navigate, state.isLoading]);

  // 로딩 상태 또는 기사를 찾지 못한 경우 로딩 표시
  if (!article) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
        <div className='max-w-4xl mx-auto px-4 py-8'>
          {/* 뒤로가기 버튼 */}
          <Button
            variant='outline'
            className='mb-8 rounded-full shadow-md border-0'
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            뒤로 가기
          </Button>

          {state.isLoading ? (
            /* 로딩 상태 */
            <div className='bg-white rounded-3xl shadow-xl p-12'>
              <div className='flex flex-col items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4'></div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  기사를 불러오는 중...
                </h3>
                <p className='text-muted-foreground'>잠시만 기다려주세요</p>
              </div>
            </div>
          ) : (
            /* 기사를 찾을 수 없는 경우 */
            <div className='bg-white rounded-3xl shadow-xl p-12'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <AlertTriangle className='h-8 w-8 text-gray-400' />
                </div>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  기사를 찾을 수 없습니다
                </h2>
                <p className='text-muted-foreground mb-8'>
                  요청하신 기사가 삭제되었거나 존재하지 않습니다
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className='rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <NewsDetail article={article} />;
};

export default NewsDetailPage;
