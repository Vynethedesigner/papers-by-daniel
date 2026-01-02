import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const GalleryItem = ({ item, onClick, isLast }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Enhanced scroll animations - Parallax-like feel
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity, y }}
      className={`w-full max-w-lg mx-auto cursor-pointer group ${isLast ? 'mb-0' : 'mb-32'}`}
      onClick={() => onClick(item)}
    >
      <div className="overflow-hidden aspect-[2/3] bg-gray-100">
        <motion.img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>
      <div className="mt-6 flex justify-between items-baseline opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        <span className="text-sm font-serif italic text-paper-black">{item.title}</span>
        <span className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">View</span>
      </div>
    </motion.div>
  );
};

export default GalleryItem;
