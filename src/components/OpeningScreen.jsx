import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const OpeningScreen = ({ onComplete }) => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate title in
            gsap.fromTo(titleRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
            );

            // Animate subtitle in
            gsap.fromTo(subtitleRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, delay: 0.6, ease: "power2.out" }
            );

            // After 2.5 seconds, fade out the entire container then call onComplete
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 0.8,
                delay: 2.5,
                ease: "power2.inOut",
                onComplete: onComplete
            });
        }, containerRef);

        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper-white"
        >
            <div className="text-center space-y-4">
                <h1
                    ref={titleRef}
                    className="text-2xl md:text-3xl font-serif text-paper-black tracking-wide opacity-0"
                >
                    Papers by Daniel Lawani
                </h1>
                <p
                    ref={subtitleRef}
                    className="text-xs md:text-sm font-sans text-gray-500 uppercase tracking-widest opacity-0"
                >
                    Curated and Written by Uche Divine
                </p>
            </div>
        </div>
    );
};

export default OpeningScreen;
