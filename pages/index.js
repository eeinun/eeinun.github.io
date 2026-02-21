import Head from 'next/head';
import { useEffect } from 'react';

// 1. 서버 사이드 로직 (Server Side Rendering)
// 브라우저보다 먼저 실행됩니다. 여기서 YouTube 및 Spotify 정보를 가져와 HTML을 완성합니다.
export async function getServerSideProps(context) {
  const { q } = context.query; // URL에서 ?q= 값을 가져옴
  
  // 기본 메타 태그 설정
  let metaData = {
    title: "리다이렉트 페이지",
    description: "잠시 후 이동합니다...",
    image: "", // 기본 이미지 URL이 있다면 여기에 넣으세요
    url: q || ""
  };

  try {
    if (q) {
      // 1) YouTube 처리
      if (q.includes("youtu")) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(q)}&format=json`;
        const res = await fetch(oembedUrl);
        
        if (res.ok) {
          const data = await res.json();
          metaData.title = data.title;
          metaData.description = `YouTube · ${data.author_name}`;
          metaData.image = data.thumbnail_url;
        }
      }
      // 2) Spotify 처리 (추가됨)
      else if (q.includes("spotify")) {
        // Spotify oEmbed API 엔드포인트
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(q)}`;
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
      else if (q.includes("nicovideo")) {
        const video_id = q.split("/").pop().split("?")[0];
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
    else if (target.includes("nicovideo")) {
        const video_id = target.split("/").pop().split("?")[0];
        const encodedLink = encodeURIComponent(`https://sp.nicovideo.jp/force-app-link/watch/${video_id}`);
        window.location.href = `https://nicovideo.applink.nicovideo.jp/?link=${encodedLink}&utm_source=nicovideo_spweb&utm_campaign=message_overseas&pt=13724&ct=spweb_watch_message_overseas&utm_medium=watch&apn=jp.nicovideo.android&ibi=jp.co.dwango.nicoplayer&isi=307764057&utm_content=${video_id}`;
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