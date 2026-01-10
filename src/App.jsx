import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import OpeningScreen from './components/OpeningScreen';
import Gallery from './components/Gallery';

function App() {
  const [showOpening, setShowOpening] = useState(true);
  const galleryRef = useRef(null);

  useEffect(() => {
    // When gallery becomes visible, fade it in
    if (!showOpening && galleryRef.current) {
      gsap.fromTo(galleryRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.inOut" }
      );
    }
  }, [showOpening]);

  return (
    <div className="min-h-screen w-full bg-paper-white text-paper-black selection:bg-gray-200">
      {showOpening && (
        <OpeningScreen key="opening" onComplete={() => setShowOpening(false)} />
      )}

      {!showOpening && (
        <div ref={galleryRef} style={{ opacity: 0 }}>
          <Gallery />
        </div>
      )}
    </div>
  );
}

export default App;
