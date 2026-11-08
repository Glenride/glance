export type MediaType = 'photo' | 'video' | 'animated_gif';

export type MediaItem = {
  id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: MediaType;
  sourceUsername: string;
  originalPostUrl: string;
  sensitive: boolean;
  createdAt: string;
};

export type FeedMetrics = {
  loadTimeMs: number;
  successRate: number;
  fromCache: boolean;
};

export type FeedResult = {
  items: MediaItem[];
  metrics: FeedMetrics;
};

export type BrightDataPost = {
  id_str?: string;
  created_at?: string;
  possibly_sensitive?: boolean;
  user?: {
    screen_name?: string;
  };
  entities?: {
    media?: Array<{
      id_str?: string;
      type?: string;
      media_url_https?: string;
      media_url?: string;
      expanded_url?: string;
      video_info?: {
        variants?: Array<{
          bitrate?: number;
          url?: string;
          content_type?: string;
        }>;
      };
    }>;
  };
};
