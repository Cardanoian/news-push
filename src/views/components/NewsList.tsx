import React, { useState } from 'react';
import { NewsArticle } from '../../models/types';
import NewsCard from './NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';

interface NewsListProps {
  articles: NewsArticle[];
}

const NewsList: React.FC<NewsListProps> = ({ articles }) => {
  const navigate = useNavigate();
  const { refreshNews, state } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    <div className='space-y-4'>
      <div className='flex items-center space-x-2 text-gray-200'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 ' />
          <Input
            type='text'
            placeholder='기사 검색...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-8'
          />
        </div>
        <Button
          variant='outline'
          size='icon'
          onClick={handleRefresh}
          disabled={isRefreshing || state.isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {state.isLoading && !isRefreshing ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className='space-y-4'>
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={handleArticleClick}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          {searchQuery ? '검색 결과가 없습니다.' : '산불 뉴스가 없습니다.'}
        </div>
      )}
    </div>
  );
};

export default NewsList;
