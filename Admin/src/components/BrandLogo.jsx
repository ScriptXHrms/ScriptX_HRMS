import logo from '../assets/scriptx-logo.jpeg';
import { cx } from '../utils/cx';

/** The official ScriptX logo (full lock-up with tagline). */
export function BrandLogo({ className, alt = 'ScriptX — Write | Create | Elevate' }) {
  return <img src={logo} alt={alt} className={cx('select-none', className)} draggable="false" />;
}

/**
 * The hexagon "SX" mark, cropped from the same official logo file so small
 * placements (sidebar, collapsed nav) stay legible. Crop box measured from
 * the 640×640 source: x 139–495, y 67–423.
 */
export function BrandMark({ size = 44, className, alt = '' }) {
  return (
    <span
      className={cx('relative inline-block shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-line', className)}
      style={{ width: size, height: size }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={logo}
        alt=""
        draggable="false"
        className="absolute max-w-none select-none"
        style={{ width: '179.78%', left: '-39.04%', top: '-18.96%' }}
      />
    </span>
  );
}
