// supabase/functions/crawl-fire-news/index.ts
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import axiod from 'https://deno.land/x/axiod@0.26.2/mod.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // API 인증 검증 (실제 배포 시 필요)
    // const authHeader = req.headers.get('Authorization');
    // if (!authHeader || authHeader !== `Bearer ${Deno.env.get('API_SECRET')}`) {
    //   return new Response(JSON.stringify({ error: '인증 실패' }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' }
    //   });
    // }

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
        message: `${newsItems.length}개 기사 중 ${newArticlesCount}개 신규 기사 추가 완료`,
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
  const allNews = [];

  // 네이버 뉴스 검색 결과 크롤링
  const naverNews = await crawlNaverNews('산불');
  allNews.push(...naverNews);

  return allNews;
}

// 네이버 뉴스 크롤링
async function crawlNaverNews(query) {
  const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axiod.get(url);
    const $ = cheerio.load(response.data);
    const newsItems = [];

    $('.news_wrap').each((index, element) => {
      const title = $(element).find('.news_tit').text().trim();
      const url = $(element).find('.news_tit').attr('href') || '';
      const content = $(element).find('.news_dsc').text().trim();
      const source = $(element)
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
