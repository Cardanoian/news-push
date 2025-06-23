/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';
/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
/* @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시 */
import axiod from 'https://deno.land/x/axiod@0.26.2/mod.ts';
// @ts-expect-error: Deno 전용 import, Node.js 타입 검사 무시
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

/** @ts-expect-error: Deno 전역 객체 타입 무시 */
const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || '';
/** @ts-expect-error: Deno 전역 객체 타입 무시 */
const supabaseKey = Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const keywords = [
  '산불',
  '화재',
  '산림',
  '호우',
  '풍수해',
  '침수',
  '태풍',
  '지진',
];

serve(async (req: Request) => {
  try {
    // API 인증 검증 (실제 배포 시 필요)
    const authHeader = req.headers.get('Authorization');
    /** @ts-expect-error: Deno 전역 객체 타입 무시 */
    if (!authHeader || authHeader !== `Bearer ${Deno.env.get('API_SECRET')}`) {
      return new Response(JSON.stringify({ error: '인증 실패' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newsItems = await fetchNewsFromMultipleSources();
    let newArticlesCount = 0;

    // 새 기사 추가 및 중복 확인
    for (const item of newsItems) {
      // URL 기준으로 중복 확인
      const { data: existingArticle } = await supabase
        .from('news_articles')
        .select('id')
        .eq('url', item.url)
        .maybeSingle();

      // 중복이 없는 경우에만 추가
      if (!existingArticle) {
        const { error } = await supabase.from('news_articles').insert({
          title: item.title,
          content: item.content,
          source: item.source,
          url: item.url,
          image_url: item.imageUrl,
          published_at: new Date().toISOString(),
        });

        if (error) {
          console.error('기사 저장 오류:', error);
        } else {
          newArticlesCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${newsItems.size}개 기사 중 ${newArticlesCount}개 신규 기사 추가 완료`,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 여러 소스에서 뉴스 가져오기
async function fetchNewsFromMultipleSources() {
  const allNews: Set<newsItemInterface> = new Set([]);

  // 네이버 뉴스 검색 결과 크롤링
  for (const keyword of keywords) {
    const naverNews = await crawlNaverNews(keyword);
    naverNews.forEach((item) => allNews.add(item));
  }
  // allNews.push(...naverNews);

  return allNews;
}

interface newsItemInterface {
  title: string;
  url: string;
  content: string;
  source: string;
  imageUrl: string;
}

// 네이버 뉴스 크롤링
async function crawlNaverNews(query: string) {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axiod.get(url);
    const $ = cheerio.load(response.data);
    const newsItems: newsItemInterface[] = [];

    $('.news_wrap').each((index: number, element: cheerio.Element) => {
      const title: string = $(element).find('.news_tit').text().trim();
      const url: string = $(element).find('.news_tit').attr('href') || '';
      const content: string = $(element).find('.news_dsc').text().trim();
      const source: string = $(element)
        .find('.info_group a.info')
        .first()
        .text()
        .trim();

      newsItems.push({
        title,
        url,
        content,
        source,
        imageUrl: $(element).find('img.thumb_img').attr('src') || null,
      });
    });

    return newsItems;
  } catch (error) {
    console.error('네이버 뉴스 크롤링 오류:', error.message);
    return [];
  }
}
