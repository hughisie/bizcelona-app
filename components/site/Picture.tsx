// A plain <picture> with AVIF first, WebP second. No next/image on the public pages: the files are
// pre-sized in /public/media, so there is nothing for the optimiser to do and no runtime cost.
type Props = {
  name: string;            // file stem in /media, e.g. "eixample"
  sizes: number[];         // widths that exist on disk
  alt: string;
  sizesAttr: string;       // the sizes="" attribute
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  lazy?: boolean;
};

export default function Picture({ name, sizes, alt, sizesAttr, width, height, className, priority, lazy }: Props) {
  const set = (ext: string) => sizes.map((w) => `/media/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallback = `/media/${name}-${sizes[sizes.length - 1]}.webp`;
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizesAttr} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizesAttr} />
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        decoding="async"
        loading={lazy ? 'lazy' : undefined}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
