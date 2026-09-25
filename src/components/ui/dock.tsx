'use client';

import React, {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/src/lib/utils';

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  magnification?: number;
  baseSize?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DockContextType = {
  mouseX: MotionValue<number>;
  distance: number;
  magnification: number;
  baseSize: number;
  spring: SpringOptions;
};

type DockProviderProps = {
  children: React.ReactNode;
  value: DockContextType;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}

/**
 * High-performance Apple-style dock with zero background box and instant, ultra-smooth magnification.
 */
function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 450, damping: 28 },
  magnification = 60,
  distance = 95,
  baseSize = 44,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      onTouchStart={(e) => {
        if (e.touches[0]) mouseX.set(e.touches[0].clientX);
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) mouseX.set(e.touches[0].clientX);
      }}
      onTouchEnd={() => mouseX.set(Infinity)}
      onTouchCancel={() => mouseX.set(Infinity)}
      className={cn(
        'flex items-end justify-center gap-2 sm:gap-2.5 bg-transparent p-1 pointer-events-auto',
        className
      )}
      role='toolbar'
      aria-label='Application dock'
    >
      <DockProvider value={{ mouseX, spring, distance, magnification, baseSize }}>
        {children}
      </DockProvider>
    </div>
  );
}

function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, baseSize, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || val === Infinity) return distance;
    return val - (rect.left + rect.width / 2);
  });

  const sizeTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );

  const size = useSpring(sizeTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onClick={onClick}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      whileTap={{ scale: 0.92 }}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer select-none origin-bottom will-change-transform shrink-0',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
    >
      {Children.map(children, (child) => {
        if (!child || typeof child !== 'object' || !('type' in child)) return child;
        if (typeof (child as any).type === 'string') return child;
        return cloneElement(child as React.ReactElement<any>, { size, isHovered });
      })}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number> | undefined;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.95 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className={cn(
            'absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950/90 text-white font-semibold text-[10px] tracking-wide px-2.5 py-0.5 shadow-xl border border-white/10 pointer-events-none z-50 backdrop-blur-md',
            className
          )}
          role='tooltip'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const size = restProps['size'] as MotionValue<number> | undefined;

  const iconScale = useTransform(size || useMotionValue(44), (val) => (val ? val / 44 : 1));

  return (
    <motion.div
      style={{ scale: iconScale }}
      className={cn('flex items-center justify-center w-full h-full pointer-events-none', className)}
    >
      {children}
    </motion.div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
