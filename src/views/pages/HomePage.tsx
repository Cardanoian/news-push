import React from 'react';
import NewsList from '../components/NewsList';
import NotificationBanner from '../components/NotificationBanner';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  return (
    <div className='container mx-auto max-w-md px-4 pb-24'>
      <header className='sticky top-0 z-10 bg-gray-200 p-4 border-b mb-4 text-gray-700'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold'>재난 속보</h1>
          <div className='flex space-x-2'>
            <NotificationBanner />
            <Button
              variant='outline'
              size='icon'
              onClick={() => navigate('/settings')}
            >
              <Settings className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {state.error ? (
          <div className='rounded-md bg-red-50 p-4 my-4 text-black'>
            <div className='flex'>
              <div className='text-sm text-red-700'>
                <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
                <p>{state.error}</p>
              </div>
            </div>
          </div>
        ) : (
          <NewsList articles={state.articles} />
        )}
      </main>
    </div>
  );
};

export default HomePage;
