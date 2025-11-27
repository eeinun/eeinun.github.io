import Head from 'next/head';
import { useEffect } from 'react';

// 1. 서버 사이드 로직 (Server Side Rendering)
// 브라우저보다 먼저 실행됩니다. 여기서 YouTube 정보를 가져와 HTML을 완성합니다.
export async function getServerSideProps(context) {
  const { q } = context.query; // URL에서 ?q= 값을 가져옴
  
  // 기본 메타 태그 설정
  let metaData = {
    title: "리다이렉트 페이지",
    description: "잠시 후 이동합니다...",
    image: "", // 기본 이미지 URL이 있다면 여기에 넣으세요
    url: q || ""
  };

  // q 값이 있고, 유튜브 링크라면 oEmbed 데이터를 가져옴
  if (q && q.includes("youtu")) {
    try {
      // YouTube oEmbed API 호출
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(q)}&format=json`;
      const res = await fetch(oembedUrl);
      
      if (res.ok) {
        const data = await res.json();
        // 받아온 데이터로 메타 태그 덮어쓰기
        metaData.title = data.title;
        metaData.description = `YouTube · ${data.author_name}`;
        metaData.image = data.thumbnail_url;
      }
    } catch (e) {
      console.error("YouTube Fetch Error:", e);
      // 에러 나면 그냥 기본값 유지
    }
  }

  // 완성된 데이터를 페이지 컴포넌트로 전달
  return {
    props: { metaData, targetUrl: q || null },
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
        window.location.href = target.replace('https://', 'intent://').split("?")[0] + "&app=desktop#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end";
    }
    else if (target.includes("spotify")) {
        window.location.href = "https://spotify.app.link/?product=open&$full_url=" + target;
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