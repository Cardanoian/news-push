import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateSettings } = useAppContext();

  const [newKeyword, setNewKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>(state.settings.keywords);
  const [refreshInterval, setRefreshInterval] = useState(
    state.settings.refreshInterval.toString()
  );

  // 키워드 추가
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      setNewKeyword('');
    }
  };

  // 키워드 삭제
  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  // 설정 저장
  const handleSave = () => {
    const interval = parseInt(refreshInterval, 10);

    updateSettings({
      keywords,
      refreshInterval: isNaN(interval) ? 300 : interval,
    });

    navigate(-1);
  };

  return (
    <div className='container mx-auto max-w-md px-4'>
      <header className='sticky top-0 z-10 bg-white py-4 border-b mb-6'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            className='mr-2'
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-xl font-bold'>설정</h1>
        </div>
      </header>

      <main className='space-y-6 pb-16'>
        {/* 키워드 설정 */}
        <div className='space-y-3'>
          <h2 className='text-lg font-semibold'>알림 키워드</h2>
          <p className='text-sm text-gray-500'>
            뉴스 기사에 포함된 키워드를 기준으로 알림을 받습니다.
          </p>

          <div className='flex items-center space-x-2'>
            <div className='flex-1'>
              <Input
                type='text'
                placeholder='키워드 입력 (예: 산불)'
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddKeyword();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddKeyword}>추가</Button>
          </div>

          <div className='flex flex-wrap gap-2 mt-2'>
            {keywords.map((keyword) => (
              <Badge key={keyword} variant='secondary' className='text-sm'>
                {keyword}
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0 ml-1'
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            ))}

            {keywords.length === 0 && (
              <p className='text-sm text-gray-500'>등록된 키워드가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 새로고침 주기 설정 */}
        <div className='space-y-3'>
          <h2 className='text-lg font-semibold'>새로고침 주기</h2>
          <p className='text-sm text-gray-500'>
            새로운 산불 속보를 확인하는 시간 간격입니다.
          </p>

          <div className='grid gap-2'>
            <Label htmlFor='refresh-interval'>간격 (초)</Label>
            <Select value={refreshInterval} onValueChange={setRefreshInterval}>
              <SelectTrigger id='refresh-interval'>
                <SelectValue placeholder='새로고침 주기 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='60'>1분 (60초)</SelectItem>
                <SelectItem value='300'>5분 (300초)</SelectItem>
                <SelectItem value='600'>10분 (600초)</SelectItem>
                <SelectItem value='1800'>30분 (1800초)</SelectItem>
                <SelectItem value='3600'>1시간 (3600초)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className='space-y-3'>
          <h2 className='text-lg font-semibold'>알림 설정</h2>
          <p className='text-sm text-gray-500'>
            브라우저 알림을 받으려면 권한을 허용해주세요.
          </p>

          <Button
            variant='outline'
            onClick={() => {
              if (Notification.permission !== 'granted') {
                Notification.requestPermission();
              }
            }}
          >
            알림 권한 설정
          </Button>
        </div>

        {/* 저장 버튼 */}
        <div className='pt-4'>
          <Button className='w-full' onClick={handleSave}>
            설정 저장
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
