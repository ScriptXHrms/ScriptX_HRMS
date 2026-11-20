/** Join truthy class names: cx('a', cond && 'b', null) -> 'a b' */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
