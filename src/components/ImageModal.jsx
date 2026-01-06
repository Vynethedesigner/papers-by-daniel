import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageModal = ({ item, onClose, onNext, onPrev }) => {
    if (!item) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-paper-white/95 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    className="relative z-10 w-full max-w-6xl w-full h-full md:h-auto md:aspect-[16/9] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 text-black hover:opacity-50 transition-opacity"
                    >
                        <X size={24} strokeWidth={1} />
                    </button>

                    {/* Image Side (Dominant) */}
                    <div className="w-full md:w-2/3 h-1/2 md:h-full bg-gray-100 relative">
                        <img
                            src={item.downloads.desktop}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Text Side (Minimal) */}
                    <div className="w-full md:w-1/3 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center bg-white text-paper-black">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-xs font-sans tracking-widest text-gray-500 uppercase">Wallpaper</span>
                                <h2 className="text-3xl font-serif italic">{item.title}</h2>
                            </div>

                            <div className="w-12 h-[1px] bg-gray-200"></div>

                            <p className="font-serif text-sm leading-relaxed text-gray-600">
                                {item.description}
                            </p>

                            <div className="pt-8 flex flex-col gap-3">
                                <a
                                    href={item.downloads.desktop}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-between items-center w-full px-6 py-4 border border-paper-black text-xs font-sans uppercase tracking-widest hover:bg-paper-black hover:text-white transition-colors duration-300 group"
                                >
                                    <span>Desktop</span>
                                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                                </a>
                                <a
                                    href={item.downloads.mobile}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-between items-center w-full px-6 py-4 border border-paper-black text-xs font-sans uppercase tracking-widest hover:bg-paper-black hover:text-white transition-colors duration-300 group"
                                >
                                    <span>Mobile</span>
                                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                                </a>
                            </div>

                            <div className="pt-4 text-[10px] text-gray-400 font-sans">
                                Photography by {item.credit}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex gap-4 mt-12 justify-end">
                            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronLeft size={20} className="stroke-gray-400" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronRight size={20} className="stroke-gray-400" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImageModal;
