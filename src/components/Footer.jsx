import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full px-6 md:px-12 py-8 mt-8 border-t border-gray-100">
            <div className="flex justify-between items-start md:items-end">

                {/* Left Side */}
                <div className="flex flex-col gap-2">
                    <h2 className="font-serif text-lg md:text-xl text-paper-black">Papers</h2>
                    <span className="font-sans text-[10px] md:text-xs text-gray-400">
                        © 2024 Daniel Lawani
                    </span>
                </div>

                {/* Right Side */}
                <div className="flex flex-col gap-2 text-right">
                    <span className="font-sans text-[10px] md:text-xs text-gray-400">
                        Curated and Written by
                    </span>
                    <h2 className="font-serif text-lg md:text-xl text-paper-black">Uche Divine</h2>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
