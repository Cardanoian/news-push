import NewsList from '../components/NewsList';
import { AlertTriangle } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { Button } from '@/components/ui/button';
import SupabaseService from '../../services/SupabaseService';

const HomePage: React.FC = () => {
  const { state } = useAppContext();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]); // keywords 상태 추가

  useEffect(() => {
    const fetchKeywords = async () => {
      const uniqueKeywords = await SupabaseService.getUniqueCategories();
      setKeywords(uniqueKeywords);
    };
    fetchKeywords();
  }, []);

  // 선택된 카테고리에 따라 기사 필터링
  const filteredArticles = useMemo(() => {
    if (selectedCategories.length === 0) {
      return state.articles;
    }
    return state.articles.filter((article) =>
      selectedCategories.some(
        (category) =>
          article.category.includes(category) ||
          article.title.includes(category)
      )
    );
  }, [state.articles, selectedCategories]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='max-w-4xl xl:max-w-6xl mx-auto px-4 py-8'>
        {/* 헤더 */}
        <header className='mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg'>
                <AlertTriangle className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-1'>
                  재난 뉴스 알림
                </h1>
                <p className='text-muted-foreground'>
                  실시간 재난 안전 정보를 확인하세요
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main>
          {state.error ? (
            <div className='bg-white rounded-3xl shadow-lg p-8 mb-8 border-l-4 border-red-400'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <AlertTriangle className='h-5 w-5 text-red-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-red-900 mb-2'>
                    데이터를 불러오는 중 오류가 발생했습니다
                  </h3>
                  <p className='text-red-700 text-sm leading-relaxed'>
                    {state.error}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* 카테고리 필터 버튼 */}
          <div className='flex flex-wrap gap-2 mb-6'>
            {keywords.map(
              (
                category // keywords 사용
              ) => (
                <Button
                  key={category}
                  variant={
                    selectedCategories.includes(category)
                      ? 'default'
                      : 'outline'
                  } // 선택 여부 확인
                  className={`rounded-full px-4 py-2 text-sm ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-blue-100 border-gray-300 text-gray-400 hover:bg-blue-300'
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Button>
              )
            )}
          </div>

          <NewsList articles={filteredArticles} />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
