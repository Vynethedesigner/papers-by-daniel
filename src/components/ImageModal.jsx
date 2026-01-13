import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { wallpapers } from '../data/wallpapers';
import soundManager from '../utils/soundManager';
import { trackDownload } from '../utils/analytics';

const ImageModal = ({ item, onClose, onNext, onPrev, direction }) => {
    const containerRef = useRef(null);
    const imageContainerRef = useRef(null);
    const contentRef = useRef(null);
    const [displayItem, setDisplayItem] = useState(item);
    const [outgoingItem, setOutgoingItem] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isContextSoundPlaying, setIsContextSoundPlaying] = useState(false);

    // Sync item prop to state for transition logic
    useEffect(() => {
        if (item && item.id !== displayItem?.id) {
            setOutgoingItem(displayItem);
            setDisplayItem(item);
        }
    }, [item, displayItem]);

    // Contextual Sound Logic - Reset on item change
    useEffect(() => {
        setIsContextSoundPlaying(false);
        soundManager.stopImageSound();

        return () => {
            soundManager.stopImageSound();
        };
    }, [item]);

    // Handle Toggle Context Sound
    const toggleContextSound = (e) => {
        e.stopPropagation();
        if (isContextSoundPlaying) {
            soundManager.stopImageSound();
            setIsContextSoundPlaying(false);
        } else {
            if (activeItem?.audio) {
                soundManager.playImageSound(activeItem.audio);
                setIsContextSoundPlaying(true);
            }
        }
    };

    // Handle Closing Animation
    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);

        const ctx = gsap.context(() => {
            gsap.to(containerRef.current, { opacity: 0, duration: 0.4 });
            gsap.to(contentRef.current, {
                scale: 0.95,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: onClose
            });
        }, containerRef);
    };

    // Entry Animation
    useGSAP(() => {
        if (isClosing) return;

        // Modal Entry
        gsap.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
        );
        gsap.fromTo(contentRef.current,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
    }, { scope: containerRef, dependencies: [] }); // Run once on mount

    // Image Slide Animation
    useGSAP(() => {
        if (!outgoingItem && !displayItem) return;
        if (!outgoingItem) {
            // Initial load of first image - handled by modal entry
            return;
        }

        const incomingEl = imageContainerRef.current.querySelector(`.img-${displayItem.id}`);
        const outgoingEl = imageContainerRef.current.querySelector(`.img-${outgoingItem.id}`);

        if (!incomingEl || !outgoingEl) return;

        // Reset incoming position
        gsap.set(incomingEl, {
            xPercent: direction > 0 ? 100 : -100,
            zIndex: 2,
            opacity: 1
        });

        gsap.set(outgoingEl, { zIndex: 1 });

        // Animate
        const tl = gsap.timeline({
            onComplete: () => setOutgoingItem(null)
        });

        tl.to(incomingEl, {
            xPercent: 0,
            duration: 0.7,
            ease: "power2.inOut"
        })
            .to(outgoingEl, {
                xPercent: direction > 0 ? -100 : 100, // Slide out opposite way
                duration: 0.7,
                ease: "power2.inOut"
            }, 0);

    }, { scope: imageContainerRef, dependencies: [displayItem, outgoingItem] });

    // Pre-loading Logic
    useEffect(() => {
        if (!item) return;
        const currentIndex = wallpapers.findIndex(w => w.id === item.id);
        const nextIndex = (currentIndex + 1) % wallpapers.length;
        const prevIndex = (currentIndex - 1 + wallpapers.length) % wallpapers.length;

        [nextIndex, prevIndex].forEach(index => {
            const img = new Image();
            img.src = wallpapers[index].downloads.desktop;
        });
    }, [item]);

    if (!item && !displayItem) return null;

    // Current item to show text for
    const activeItem = item || displayItem;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 opacity-0"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-paper-white/95 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="relative z-10 w-full max-w-6xl w-full h-full md:h-auto aspect-[16/9] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row opacity-0"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-40 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-black hover:bg-white hover:scale-110 md:bg-transparent md:backdrop-blur-none md:shadow-none md:hover:bg-transparent md:hover:scale-100 md:hover:opacity-50 transition-all duration-300"
                >
                    <X size={20} strokeWidth={1.5} className="md:w-6 md:h-6 md:stroke-[1]" />
                </button>

                {/* Image Side (Dominant) */}
                <div
                    ref={imageContainerRef}
                    className="w-full md:w-2/3 h-1/2 md:h-full bg-gray-100 relative overflow-hidden"
                >
                    {/* Render Outgoing Image */}
                    {outgoingItem && (
                        <img
                            key={outgoingItem.id}
                            src={outgoingItem.downloads.desktop}
                            alt={outgoingItem.title}
                            className={`img-${outgoingItem.id} absolute inset-0 w-full h-full object-cover`}
                        />
                    )}

                    {/* Render Incoming/Current Image */}
                    {displayItem && (
                        <img
                            key={displayItem.id}
                            src={displayItem.downloads.desktop}
                            alt={displayItem.title}
                            className={`img-${displayItem.id} absolute inset-0 w-full h-full object-cover`}
                        />
                    )}
                </div>

                {/* Text Side (Stable Layout) */}
                <div className="w-full md:w-1/3 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-between bg-white text-paper-black relative z-10">
                    <div className="space-y-6 overflow-y-auto no-scrollbar">
                        <div className="space-y-2">
                            <span className="text-xs font-sans tracking-widest text-gray-500 uppercase">Wallpaper</span>
                            <h2 className="text-3xl font-serif italic">{activeItem.title}</h2>
                        </div>

                        <div className="w-12 h-[1px] bg-gray-200"></div>

                        <p className="font-serif text-sm leading-relaxed text-gray-600 min-h-[3em]">
                            {activeItem.description || "A study in form and light."}
                        </p>

                        <div className="pt-4 flex flex-col gap-3">
                            <a
                                href={activeItem.downloads.desktop}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackDownload(activeItem.id, activeItem.title)}
                                className="inline-flex justify-between items-center w-full px-6 py-4 border border-paper-black text-xs font-sans uppercase tracking-widest hover:bg-paper-black hover:text-white transition-colors duration-300 group"
                            >
                                <span>Desktop</span>
                                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                            </a>
                            <a
                                href={activeItem.downloads.mobile}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackDownload(activeItem.id, activeItem.title)}
                                className="inline-flex justify-between items-center w-full px-6 py-4 border border-paper-black text-xs font-sans uppercase tracking-widest hover:bg-paper-black hover:text-white transition-colors duration-300 group"
                            >
                                <span>Mobile</span>
                                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                            </a>
                        </div>

                        <div className="pt-2 text-[10px] text-gray-400 font-sans italic">
                            Photography by {activeItem.credit}
                        </div>
                    </div>

                    {/* Fixed Navigation Arrows & Sound Toggle */}
                    <div className="flex justify-between items-center pt-8 border-t border-gray-50 bg-white">
                        {/* Context Sound Toggle (Left aligned) */}
                        <div className="flex-1">
                            {activeItem.audio && (
                                <button
                                    onClick={toggleContextSound}
                                    className="p-3 hover:bg-gray-100 rounded-full transition-colors group flex items-center gap-2"
                                    title={isContextSoundPlaying ? "Stop ambient sound" : "Play ambient sound"}
                                >
                                    {isContextSoundPlaying ? (
                                        <Volume2 size={20} className="stroke-paper-black" />
                                    ) : (
                                        <VolumeX size={20} className="stroke-gray-400 group-hover:stroke-black transition-colors" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Navigation Arrows (Right aligned) */}
                        <div className="flex gap-4">
                            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="p-3 hover:bg-gray-100 rounded-full transition-colors group">
                                <ChevronLeft size={20} className="stroke-gray-400 group-hover:stroke-black transition-colors" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-3 hover:bg-gray-100 rounded-full transition-colors group">
                                <ChevronRight size={20} className="stroke-gray-400 group-hover:stroke-black transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
