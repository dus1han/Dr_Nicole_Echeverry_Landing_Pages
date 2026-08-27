import { ImageResponse } from 'next/og';
import { breastAugmentation as content } from '@/content/breast-augmentation';
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const alt = content.meta.title;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Generated at build time. The card itself lives in lib/og.tsx — this route
 * supplies only the two strings that differ per page, and both are read from
 * the content file so neither can be left saying another page's treatment.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    await ogCard({
      headline: content.meta.ogHeadline,
      subline: content.meta.ogSubline,
    }),
    size,
  );
}
