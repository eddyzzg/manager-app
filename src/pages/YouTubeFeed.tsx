import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useFullPageLoader } from '../hooks/useFullPageLoader';
import axios from 'axios';
import { data } from 'react-router-dom';
import { Video, getVideos } from '../_context/API';

interface YouTubeFeedProps {
  apiKey: string;
  channelId: string;
}

const YouTubeFeedFilter = lazy(() => import(/* webpackChunkName: "YouTubeFeedFilter" */ './YouTubeFeedFilter'));

export default function YouTubeFeed({ apiKey, channelId }: YouTubeFeedProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxResult, setMaxResult] = useState('10');
  const { showLoader, hideLoader, LoaderComponent } = useFullPageLoader();

  //dla fetch'a
  useEffect(() => {
    async function fetchVideos() {
      try {
        const videos = await getVideos(apiKey, channelId, maxResult);
        setVideos(videos);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    setLoading(true);
    setError(null);
    showLoader();
    fetchVideos();

  }, [apiKey, channelId, maxResult]);

  //dla loadera
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        hideLoader();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [loading, hideLoader]);

  const handleFilterChange = (val: string) => {
    setMaxResult(val);
  };

  if (loading) return LoaderComponent;
  if (error) return <div>Błąd: {error}</div>;

  return (
    <div>
      <h1>Ostatnie materiały na kanale:</h1>
      <div style={{ width: 200, padding: 16 }}>
        <Suspense fallback={<p className="page page--loading">Ładowanie...</p>}>
          <YouTubeFeedFilter value={maxResult} onChange={handleFilterChange} />
        </Suspense>
      </div>
      {videos.map((video, idx) => (
        <div className="video-card" key={idx}>
          <div className="video-card__video-frame">
            <iframe
              src={`https://www.youtube.com/embed/${video.id.videoId}`}
              title={video.snippet.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="video-card__video-info">
            <h3 className="video-card__video-info__video-title">{video.snippet.title}</h3>
            <p className="video-card__video-info__video-description">{video.snippet.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
