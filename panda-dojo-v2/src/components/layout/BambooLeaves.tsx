import styles from './BambooLeaves.module.css';

const LEAVES = [
  { left:  '4%',  delay:  0,   dur: 14, size: 16 },
  { left: '10%',  delay:  5.5, dur: 11, size: 13 },
  { left: '19%',  delay:  2,   dur: 16, size: 20 },
  { left: '28%',  delay:  8,   dur: 12, size: 15 },
  { left: '38%',  delay:  3.5, dur: 13, size: 18 },
  { left: '50%',  delay:  7,   dur: 15, size: 14 },
  { left: '61%',  delay:  1,   dur: 11, size: 22 },
  { left: '71%',  delay:  9.5, dur: 14, size: 16 },
  { left: '80%',  delay:  4,   dur: 12, size: 12 },
  { left: '88%',  delay: 11,   dur: 15, size: 19 },
  { left: '95%',  delay:  6,   dur: 13, size: 14 },
  { left: '15%',  delay: 13,   dur: 16, size: 11 },
  { left: '55%',  delay: 10,   dur: 10, size: 17 },
  { left: '74%',  delay:  2.5, dur: 14, size: 13 },
];

export function BambooLeaves() {
  return (
    <div className={styles.container} aria-hidden="true">
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className={styles.leaf}
          style={{
            left: leaf.left,
            width: `${leaf.size}px`,
            height: `${Math.round(leaf.size * 2.1)}px`,
            animationDuration: `${leaf.dur}s`,
            animationDelay: `${leaf.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
