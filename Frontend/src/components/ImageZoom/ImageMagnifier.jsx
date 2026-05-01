'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const ImageMagnifier = ({
    src,
    alt,
    zoomLevel = 2.5,
    magnifierSize = 200,
    onClick,
}) => {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
    const [[x, y], setXY] = useState([0, 0]);
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const { top, left, width, height } = containerRef.current.getBoundingClientRect();

        // Calculate relative position within the container
        const mouseX = e.clientX - left;
        const mouseY = e.clientY - top;

        setXY([mouseX, mouseY]);
        setSize([width, height]);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full cursor-zoom-in"
            onMouseEnter={() => setShowMagnifier(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowMagnifier(false)}
            onClick={onClick}
            style={{ isolation: 'isolate' }}
        >
            {/* Main Image */}
            <Image
                src={src}
                alt={alt}
                fill
                priority
                className="object-contain"
                draggable={false}
            />

            {/* Magnifier Lens */}
            {showMagnifier && (
                <div
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        height: `${magnifierSize}px`,
                        width: `${magnifierSize}px`,
                        // Center the lens on the cursor
                        top: `${y - magnifierSize / 2}px`,
                        left: `${x - magnifierSize / 2}px`,
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        backgroundColor: '#000', // Black background if image fails
                        overflow: 'hidden',
                        zIndex: 100,
                    }}
                >
                    {/* Zoomed Image Inside Lens */}
                    <div
                        style={{
                            position: 'absolute',
                            width: `${imgWidth * zoomLevel}px`,
                            height: `${imgHeight * zoomLevel}px`,
                            // This moves the high-res image behind the lens "window"
                            left: `${-x * zoomLevel + magnifierSize / 2}px`,
                            top: `${-y * zoomLevel + magnifierSize / 2}px`,
                        }}
                    >
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            draggable={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageMagnifier;

