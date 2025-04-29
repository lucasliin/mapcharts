import { useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion';
import { wrap } from '@motionone/utils';

interface ParallaxProps {
  baseVelocity: number;
  direction?: 'ltr' | 'rtl';
  children?: React.ReactNode;
}

const Parallax: React.FC<ParallaxProps> = (props) => {
  const { children, baseVelocity = 1, direction = 'ltr' } = props;
  const baseX = useMotionValue(0);
  const smoothVelocity = useSpring(0, { damping: 100, stiffness: 40 });
  const velocityFactor = useTransform(smoothVelocity, [0, 0], [0, 0], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(0, -50, v)}%`);
  // const x = useTransform(baseX, (v) => `-50%`);
  // 控制滑动方向
  const directionFactor = useRef(1);
  // 控制速度，用来停止&再启动
  const stopParallax = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000) * stopParallax.current;

    if (direction === 'ltr') {
      directionFactor.current = -1;
    } else if (direction === 'rtl') {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap flex-nowrap">
      <motion.div
        style={{ x }}
        onMouseEnter={() => {
          stopParallax.current = 0;
        }}
        onMouseLeave={() => {
          stopParallax.current = 1;
        }}
      >
        <div className="flex gap-4">
          {children}
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Parallax;
