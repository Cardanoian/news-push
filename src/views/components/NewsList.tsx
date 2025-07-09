import React, { useState } from 'react';
import { NewsArticle } from '../../models/types';
import NewsCard from './NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';

interface NewsListProps {
  articles: NewsArticle[];
}

const NewsList: React.FC<NewsListProps> = ({ articles }) => {
  const navigate = useNavigate();
  const { refreshNews, fetchMoreNews, state } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offset, setOffset] = useState(50); // 초기 로드된 기사 수 (50개)
  const limit = 50; // 한 번에 가져올 기사 수
  const [hasMoreNews, setHasMoreNews] = useState(true); // 더 많은 뉴스가 있는지 여부

  // "더 읽어오기" 버튼 클릭 핸들러
  const handleLoadMore = async () => {
    if (!state.isFetchingMoreNews && hasMoreNews) {
      const fetchedArticles = await fetchMoreNews(offset, limit);
      if (fetchedArticles && fetchedArticles.length < limit) {
        setHasMoreNews(false); // 더 이상 기사가 없으면 버튼 비활성화
      }
      setOffset((prevOffset) => prevOffset + limit);
    }
  };

  // 기사 필터링 (검색어 기반)
  const filteredArticles = searchQuery.trim()
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  // 기사 상세 페이지로 이동
  const handleArticleClick = (id: string) => {
    navigate(`/article/${id}`);
  };

  // 새로고침 처리
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNews();
    setIsRefreshing(false);
  };

  return (
    <div>
      {/* 검색 및 새로고침 */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='relative flex-1'>
          <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
          <Input
            type='text'
            placeholder='뉴스 검색...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-12 rounded-2xl border-0 shadow-md focus:shadow-lg transition-shadow text-gray-900'
          />
        </div>
        <Button
          variant='outline'
          size='icon'
          onClick={handleRefresh}
          disabled={isRefreshing || state.isLoading}
          className='rounded-full shadow-md border-0 hover:shadow-lg transition-shadow'
        >
          <RefreshCw
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {/* 로딩 상태 */}
      {/* 로딩 상태 (초기 로딩) */}
      {state.isLoading && !isRefreshing && !state.isFetchingMoreNews ? (
        <div className='flex justify-center py-12'>
          <div className='flex flex-col items-center gap-4'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent'></div>
            <p className='text-muted-foreground'>뉴스를 불러오는 중...</p>
          </div>
        </div>
      ) : filteredArticles.length > 0 ? (
        <>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={handleArticleClick}
              />
            ))}
          </div>
          {/* "더 읽어오기" 버튼 */}
          {hasMoreNews &&
            !searchQuery && ( // 검색 중이 아닐 때만 버튼 표시
              <div className='flex justify-center mt-8'>
                <Button
                  onClick={handleLoadMore}
                  disabled={state.isFetchingMoreNews}
                  className='px-8 py-3 rounded-full shadow-md text-lg font-semibold transition-all duration-300 ease-in-out
                           bg-gradient-to-r from-blue-500 to-purple-600 text-white
                           hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
                >
                  {state.isFetchingMoreNews ? (
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  ) : (
                    '뉴스 더 읽어오기'
                  )}
                </Button>
              </div>
            )}
        </>
      ) : (
        <div className='text-center py-12'>
          <div className='bg-white rounded-3xl shadow-lg p-8 max-w-md mx-auto'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {searchQuery ? '검색 결과가 없습니다' : '뉴스가 없습니다'}
            </h3>
            <p className='text-muted-foreground'>
              {searchQuery
                ? '다른 키워드로 검색해보세요'
                : '새로운 재난 뉴스를 기다리고 있습니다'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;
