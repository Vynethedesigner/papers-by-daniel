import React, { useState } from 'react';
import { wallpapers } from '../data/wallpapers';
import GalleryItem from './GalleryItem';
import ImageModal from './ImageModal';
import Footer from './Footer';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <>
            <div className="min-h-screen pb-0">
                {/* Header Count */}
                <div className="fixed top-0 left-0 w-full p-6 md:p-8 z-10 pointer-events-none mix-blend-difference text-white">
                    {/* Using mix-blend-difference so it shows on white or black, but mostly white bg so maybe standard black is better if bg is white. 
                User asked for "Quiet... minimal". 
                Let's stick to standard layout flow or fixed header.
                "At the top or subtly placed: A small line of text showing total count"
             */}
                </div>

                <header className="w-full flex justify-between items-end px-6 md:px-12 pt-8 pb-16 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}>
                    <h1 className="text-sm md:text-base font-serif italic text-paper-black tracking-wide">
                        Papers by Daniel Lawani
                    </h1>

                    <div className="flex items-baseline gap-2 font-sans text-xs md:text-sm tracking-widest text-gray-500 uppercase">
                        <span className="text-paper-black font-medium">{wallpapers.length}</span>
                        <span>papers</span>
                    </div>
                </header>

                <div className="container mx-auto px-4 md:px-0">
                    <div className="flex flex-col items-center">
                        {wallpapers.map((item, index) => (
                            <GalleryItem
                                key={item.id}
                                item={item}
                                onClick={setSelectedImage}
                                isLast={index === wallpapers.length - 1}
                            />
                        ))}
                    </div>
                </div>

                <Footer />
            </div>

            {/* Modal will go here */}
            {selectedImage && (
                <ImageModal
                    item={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onNext={() => {
                        const currentIndex = wallpapers.findIndex(w => w.id === selectedImage.id);
                        const nextIndex = (currentIndex + 1) % wallpapers.length;
                        setSelectedImage(wallpapers[nextIndex]);
                    }}
                    onPrev={() => {
                        const currentIndex = wallpapers.findIndex(w => w.id === selectedImage.id);
                        const prevIndex = (currentIndex - 1 + wallpapers.length) % wallpapers.length;
                        setSelectedImage(wallpapers[prevIndex]);
                    }}
                />
            )}
        </>
    );
};

export default Gallery;
