import Head from 'next/head';
import { useEffect } from 'react';

// 1. 서버 사이드 로직 (Server Side Rendering)
// 브라우저보다 먼저 실행됩니다. 여기서 YouTube 및 Spotify 정보를 가져와 HTML을 완성합니다.
export async function getServerSideProps(context) {
  // 자동 파싱 시 url의 쿼리도 인식해버리므로 텍스트로 처리. ?를 기준으로 한번만 나누기
  const url =  decodeURIComponent(String(context.resolvedUrl.slice(context.resolvedUrl.indexOf("?") + 3))); 


  // 기본 메타 태그 설정
  let metaData = {
    title: "리다이렉트 페이지",
    description: "잠시 후 이동합니다...",
    image: "",
    url: url || ""
  };

  // URL 재구성 (YouTube의 경우에만 v 파라미터만 유지 - intent 동작을 위해 필요)
  let processedUrl = url;
  if (url && url.includes("youtu")) {
    if (url.includes("youtu.be") {
      url = "https://m.youtube.com/watch?v=" + url.split("be/")[1];
    }
    if (url.includes("youtube") {
      let queryParams = url.split("?")[1].split("&");
      let vParam = queryParams.filter(param => param.startsWith("v="));
      processedUrl = url.split("?")[0] + "?v=" + vParam[0].split("=")[1];
    }
  }

  try {
    if (processedUrl) {
      // 1) YouTube 처리
      if (processedUrl.includes("youtu")) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(processedUrl)}&format=json`;
        const res = await fetch(oembedUrl);
        
        if (res.ok) {
          const data = await res.json();
          metaData.title = data.title;
          metaData.description = `YouTube · ${data.author_name}`;
          metaData.image = data.thumbnail_url;
        }
      }
      // 2) Spotify 처리 (추가됨)
      else if (processedUrl.includes("spotify")) {
        // Spotify oEmbed API 엔드포인트
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(processedUrl)}`;
        const res = await fetch(oembedUrl);

        if (res.ok) {
          const data = await res.json();
          // Spotify 데이터 매핑
          metaData.title = data.title; // 예: "Song Name - Artist"
          metaData.description = `Spotify · ${data.provider_name || 'Music'}`;
          metaData.image = data.thumbnail_url;
        }
      }
      // 3) nicovideo 처리
      else if (processedUrl.includes("nicovideo")) {
        const video_id = processedUrl.split("/").pop().split("?")[0];
        metaData.title = `ニコニコ動画 - ${video_id}`;
        metaData.description = "ニコニコ動画で視聴";
        // nicovideo는 oEmbed API가 없으므로 기본 정보만 표시
      }
    }
  } catch (e) {
    console.error("Fetch Error:", e);
    // 에러 발생 시 기본값 유지
  }

  // 완성된 데이터를 페이지 컴포넌트로 전달
  return {
    props: { metaData, targetUrl: processedUrl || null },
  };
}

// 2. 클라이언트 사이드 로직 (Browser)
// HTML이 로드된 후 브라우저에서 실행됩니다. 기존 리다이렉트 로직이 여기 들어갑니다.
export default function Home({ metaData, targetUrl }) {
  
  // React의 useEffect는 화면이 그려진 직후 실행됩니다. (기존 <script> 역할)
  useEffect(() => {
    if (!targetUrl) return;

    const target = targetUrl;

    // 기존 리다이렉트 로직 그대로 복사
    if (target.includes("youtu")) {
        // 안드로이드 인텐트 스킴 처리
        window.location.href = target.replace('https://', 'intent://') + "&app=desktop#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end";
    }
    else if (target.includes("spotify")) {
        window.location.href = "https://spotify.app.link/?product=open&$full_url=" + target;
    }
    else if (target.includes("nicovideo")) {
        // 스크린샷의 정보를 그대로 담은 코드
        const intentUrl = `intent://${target.replace('https://', '')}#Intent;` +
                          "scheme=https;" +
                          "package=jp.nicovideo.android;" +
                          "component=jp.nicovideo.android/.URLHandlerActivity;" +
                          "end";
        window.location.href = intentUrl;
    }
    // 그 외의 경우 (선택 사항: 그냥 해당 링크로 이동)
    else {
        window.location.href = target;
    }

  }, [targetUrl]);

  return (
    <>
      <Head>
        {/* 서버에서 받아온 정보로 메타 태그 구성 */}
        <title>{metaData.title}</title>
        <meta property="og:title" content={metaData.title} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:image" content={metaData.image} />
        <meta property="og:url" content={metaData.url} />
        
        {/* 트위터 카드 (선택사항) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:image" content={metaData.image} />
      </Head>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'sans-serif',
        flexDirection: 'column'
      }}>
        {/* 사용자에게 보여지는 화면 (썸네일이 있으면 표시) */}
        {metaData.image && (
          <img 
            src={metaData.image} 
            alt="Thumbnail" 
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '10px', marginBottom: '20px' }} 
          />
        )}
        <h2>{metaData.title}</h2>
        <p>앱으로 이동 중입니다...</p>
        <a href={targetUrl} style={{ color: '#0070f3', marginTop: '10px' }}>
          직접 이동하기
        </a>
      </div>
    </>
  );
}
