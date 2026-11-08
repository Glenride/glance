import { CACHE_TTL_MS, FEED_LIMIT } from '@/constants/hush';
import { getCacheValue, setCacheValue } from '@/lib/cache';
import type { BrightDataPost, FeedResult, MediaItem } from '@/types/feed';

const BRIGHT_DATA_ENDPOINT = process.env.EXPO_PUBLIC_BRIGHT_DATA_ENDPOINT;
const BRIGHT_DATA_API_KEY = process.env.EXPO_PUBLIC_BRIGHT_DATA_API_KEY;

type BrightDataMedia = NonNullable<NonNullable<BrightDataPost['entities']>['media']>[number];

function cacheKey(handles: string[]): string {
  return handles.map((handle) => handle.toLowerCase()).sort().join(',');
}

function getMediaUrl(media: BrightDataMedia): string | null {
  if (media.type === 'video' || media.type === 'animated_gif') {
    const variants = media.video_info?.variants ?? [];
    const ranked = variants
      .filter((variant) => Boolean(variant.url) && variant.content_type?.includes('mp4'))
      .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

    return ranked[0]?.url ?? null;
  }

  return media.media_url_https ?? media.media_url ?? null;
}

function normalizePosts(posts: BrightDataPost[]): MediaItem[] {
  return posts.flatMap((post) => {
    const media = post.entities?.media ?? [];
    const sourceUsername = post.user?.screen_name ?? 'unknown';
    const postId = post.id_str ?? `${sourceUsername}-${post.created_at ?? Date.now()}`;

    const normalized = media
      .filter((item) => item.type === 'photo' || item.type === 'video' || item.type === 'animated_gif')
      .map((item): MediaItem | null => {
        const mediaUrl = getMediaUrl(item);
        if (!mediaUrl) {
          return null;
        }

        const mediaItem: MediaItem = {
          id: item.id_str ?? `${postId}-${mediaUrl}`,
          mediaUrl,
          thumbnailUrl: item.media_url_https ?? item.media_url,
          mediaType: item.type as MediaItem['mediaType'],
          sourceUsername,
          originalPostUrl:
            item.expanded_url ?? `https://x.com/${sourceUsername}/status/${post.id_str ?? ''}`,
          sensitive: Boolean(post.possibly_sensitive),
          createdAt: post.created_at ?? new Date().toISOString(),
        };

        return mediaItem;
      });

    return normalized.filter((item): item is MediaItem => item !== null);
  });
}

function dedupeByMediaUrl(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.mediaUrl)) {
      return false;
    }

    seen.add(item.mediaUrl);
    return true;
  });
}

async function fetchHandleMedia(handle: string): Promise<BrightDataPost[]> {
  if (!BRIGHT_DATA_ENDPOINT || !BRIGHT_DATA_API_KEY) {
    throw new Error('Missing Bright Data env vars: EXPO_PUBLIC_BRIGHT_DATA_ENDPOINT / EXPO_PUBLIC_BRIGHT_DATA_API_KEY');
  }

  const response = await fetch(BRIGHT_DATA_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [
        {
          url: `https://x.com/${handle}`,
          max_number_of_posts: FEED_LIMIT,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Bright Data request failed (${response.status}) for @${handle}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.posts)) {
    return data.posts;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export async function loadFeed(handles: string[], refresh = false): Promise<FeedResult> {
  const startedAt = Date.now();
  const key = cacheKey(handles);

  if (!refresh) {
    const cached = getCacheValue<FeedResult>(key);
    if (cached) {
      return {
        ...cached,
        metrics: {
          ...cached.metrics,
          fromCache: true,
          loadTimeMs: Date.now() - startedAt,
        },
      };
    }
  }

  const settled = await Promise.allSettled(handles.map((handle) => fetchHandleMedia(handle)));

  const successful = settled.filter((result): result is PromiseFulfilledResult<BrightDataPost[]> => result.status === 'fulfilled');
  const allPosts = successful.flatMap((result) => result.value);

  const normalized = normalizePosts(allPosts)
    .filter((item) => !item.sensitive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const items = dedupeByMediaUrl(normalized).slice(0, FEED_LIMIT);
  const successRate = handles.length === 0 ? 0 : successful.length / handles.length;

  const result: FeedResult = {
    items,
    metrics: {
      loadTimeMs: Date.now() - startedAt,
      successRate,
      fromCache: false,
    },
  };

  setCacheValue(key, result, CACHE_TTL_MS);
  return result;
}
