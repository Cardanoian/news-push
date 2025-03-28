import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewsDetail from '../components/NewsDetail';
import { useAppContext } from '../../context/useAppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
      <div className='container mx-auto max-w-md px-4 py-8'>
        <Button variant='ghost' className='mb-4' onClick={() => navigate(-1)}>
          <ArrowLeft className='h-5 w-5 mr-2' />
          뒤로 가기
        </Button>

        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-md px-4'>
      <NewsDetail article={article} />
    </div>
  );
};

export default NewsDetailPage;
