import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const OpeningScreen = ({ onComplete }) => {
    useEffect(() => {
        // Transition out after 3 seconds
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <div className="text-center space-y-4">
                <motion.h1
                    className="text-2xl md:text-3xl font-serif text-paper-black tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Papers by Daniel Lawani
                </motion.h1>
                <motion.p
                    className="text-xs md:text-sm font-sans text-gray-500 uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    Curated and Written by Uche Divine
                </motion.p>
            </div>
        </motion.div>
    );
};

export default OpeningScreen;
