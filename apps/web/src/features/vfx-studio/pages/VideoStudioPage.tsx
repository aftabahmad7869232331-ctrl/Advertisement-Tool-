// ============================================================
// VIDEO STUDIO PAGE
// ============================================================

import React, { useEffect } from 'react';
import { VideoStudio } from '../components/VideoStudio/VideoStudio';

export function VideoStudioPage() {
  useEffect(() => {
    document.title = 'Video Studio | Bricks Maker';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vs-bg-primary)' }}>
      <VideoStudio />
    </div>
  );
}

export default VideoStudioPage;
