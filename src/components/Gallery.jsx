import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { wallpapers } from '../data/wallpapers';
import ImageModal from './ImageModal';

const Gallery = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [direction, setDirection] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const trackRef = useRef(null);
    const containerRef = useRef(null);

    // Register GSAP plugin
    gsap.registerPlugin(useGSAP);

    // Responsive Check
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const frameWidth = isMobile ? 85 : 50; // vw

    // Wrap navigation handlers in useCallback to use in useEffect
    const handleNext = useCallback(() => {
        setDirection(1);
        setActiveIndex((prev) => {
            const nextIndex = (prev + 1) % wallpapers.length;
            if (selectedImage) {
                setSelectedImage(wallpapers[nextIndex]);
            }
            return nextIndex;
        });
    }, [selectedImage]);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setActiveIndex((prev) => {
            const prevIndex = (prev - 1 + wallpapers.length) % wallpapers.length;
            if (selectedImage) {
                setSelectedImage(wallpapers[prevIndex]);
            }
            return prevIndex;
        });
    }, [selectedImage]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                setSelectedImage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev]);

    useGSAP(() => {
        if (!trackRef.current) return;

        const timeline = gsap.timeline({
            defaults: { duration: 0.8, ease: "power2.inOut" }
        });

        // Calculate center offset based on dynamic frame width
        // Formula: (Screen Width (100) - Frame Width) / 2 = Left Margin needed to center
        // Target X = Center Offset - (Active Index * Frame Width)
        const centerOffset = (100 - frameWidth) / 2;
        const targetX = centerOffset - (activeIndex * frameWidth);

        timeline.to(trackRef.current, {
            x: `${targetX}vw`,
        }, 0);

        // Animate individual frames
        const frames = gsap.utils.toArray('.gallery-frame');
        frames.forEach((frame, i) => {
            const isActive = i === activeIndex;
            timeline.to(frame, {
                scale: isActive ? 1 : 0.7,
                opacity: isActive ? 1 : 0.3,
                filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)',
            }, 0);
        });
    }, { dependencies: [activeIndex, frameWidth], scope: containerRef });

    // GSAP Hover Logic for Titles
    const onMouseEnterTitle = (e) => {
        const overlay = e.currentTarget.querySelector('.title-overlay');
        const title = e.currentTarget.querySelector('.title-text');
        const darkOverlay = e.currentTarget.querySelector('.dark-overlay');

        gsap.to(darkOverlay, { opacity: 1, duration: 0.4 });
        gsap.to(overlay, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(title, { y: 0, duration: 0.4, ease: "power2.out" });
    };

    const onMouseLeaveTitle = (e) => {
        const overlay = e.currentTarget.querySelector('.title-overlay');
        const darkOverlay = e.currentTarget.querySelector('.dark-overlay');

        gsap.to(darkOverlay, { opacity: 0, duration: 0.4 });
        gsap.to(overlay, { opacity: 0, y: 10, duration: 0.4, ease: "power2.in" });
    };

    return (
        <div ref={containerRef} className="relative min-h-screen bg-paper-white flex flex-col items-center justify-center overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-8 z-30 pointer-events-none">
                <h1 className="text-sm md:text-base font-serif italic text-paper-black tracking-wide pointer-events-auto">
                    Papers by Daniel Lawani
                </h1>
                <div className="flex items-baseline gap-2 font-sans text-xs md:text-sm tracking-widest text-gray-400 uppercase">
                    <span className="text-paper-black font-medium">{activeIndex + 1}</span>
                    <span className="opacity-30">/</span>
                    <span>{wallpapers.length}</span>
                </div>
            </header>

            {/* Main Carousel Area */}
            <div className="relative w-full h-[70vh] flex items-center justify-start">
                <div
                    ref={trackRef}
                    className="flex h-full items-center will-change-transform"
                    style={{ width: `${wallpapers.length * frameWidth}vw` }}
                >
                    {wallpapers.map((item, index) => (
                        <div
                            key={item.id}
                            className="gallery-frame relative h-full flex items-center justify-center flex-shrink-0 will-change-transform"
                            style={{ width: `${frameWidth}vw` }}
                            onMouseEnter={index === activeIndex ? onMouseEnterTitle : null}
                            onMouseLeave={index === activeIndex ? onMouseLeaveTitle : null}
                        >
                            <div
                                className="relative w-[85%] h-[85%] overflow-hidden cursor-pointer shadow-2xl border border-black/5 bg-gray-100"
                                onClick={() => index === activeIndex && setSelectedImage(item)}
                            >
                                <img
                                    src={item.downloads.desktop}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Hover Title Overlay - Optimized with GSAP */}
                                {index === activeIndex && (
                                    <>
                                        <div className="dark-overlay absolute inset-0 bg-black/5 opacity-0 pointer-events-none z-10" />

                                        <div className="title-overlay absolute inset-x-0 bottom-0 py-8 flex flex-col justify-center items-center z-20 opacity-0 translate-y-[10px]">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                            <h2 className="title-text relative text-[10px] font-sans tracking-[0.3em] uppercase text-white drop-shadow-md">
                                                {item.title}
                                            </h2>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="fixed bottom-12 flex gap-12 z-40">
                <button
                    onClick={handlePrev}
                    className="p-4 hover:opacity-50 transition-opacity group"
                    aria-label="Previous paper"
                >
                    <ChevronLeft size={24} strokeWidth={1} className="text-paper-black" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-4 hover:opacity-50 transition-opacity group"
                    aria-label="Next paper"
                >
                    <ChevronRight size={24} strokeWidth={1} className="text-paper-black" />
                </button>
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-0 w-full px-6 flex justify-between items-end pointer-events-none">
                <span className="font-sans text-[10px] text-gray-400">© 2026 Daniel Lawani</span>
                <span className="font-sans text-[10px] text-gray-400">Curated by Uche Divine</span>
            </div>

            {/* Modal */}
            {selectedImage && (
                <ImageModal
                    item={selectedImage}
                    direction={direction}
                    onClose={() => setSelectedImage(null)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            )}
        </div>
    );
};

export default Gallery;
