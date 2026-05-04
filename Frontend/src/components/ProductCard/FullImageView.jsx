"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Modal, Box, IconButton } from "@mui/material";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineClose } from "react-icons/ai";

const modalStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function FullImageViewer({ open, onClose, src, alt }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const clampPosition = (pos, s = scale) => {
    const container = containerRef.current?.getBoundingClientRect();
    if (!container || !imgSize.width) return pos;

    const containerW = container.width;
    const containerH = container.height;

    const scaledW = imgSize.width * s;
    const scaledH = imgSize.height * s;

    // When transform-origin is center, the visible overflow on each side is (scaledSize - containerSize) / 2
    const maxPosX = Math.max(0, (scaledW - containerW) / 2);
    const maxPosY = Math.max(0, (scaledH - containerH) / 2);

    return {
      x: clamp(pos.x, -maxPosX, maxPosX),
      y: clamp(pos.y, -maxPosY, maxPosY),
    };
  };

  const handleZoomIn = () => {
    const s = Math.min(scale + 0.4, 5);
    setScale(s);
    setPosition((pos) => clampPosition(pos, s));
  };

  const handleZoomOut = () => {
    const s = Math.max(scale - 0.4, 1);
    setScale(s);
    if (s <= 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      setPosition((pos) => clampPosition(pos, s));
    }
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    setStart({ x: e.clientX, y: e.clientY });

    setPosition((prev) =>
      clampPosition({
        x: prev.x + dx,
        y: prev.y + dy,
      })
    );
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = clamp(scale + delta, 1, 5);

    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      setPosition((pos) => clampPosition(pos, newScale));
    }
    setScale(newScale);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [scale, imgSize]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, scale, start, imgSize]);

  const handleClose = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  const updateImgSize = () => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (rect) {
      setImgSize({
        width: rect.width / scale, // store base size, not scaled
        height: rect.height / scale,
      });
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (open) {
      updateImgSize();
      window.addEventListener("resize", updateImgSize);
    }
    return () => window.removeEventListener("resize", updateImgSize);
  }, [open]);

  return (
    <Modal open={open} onClose={handleClose} sx={modalStyle}>
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.95)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
        }}
        onMouseDown={handleMouseDown}
      >
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          fill
          onLoad={updateImgSize}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
        />

        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            color: "white",
            zIndex: 10,
            background: "rgba(0,0,0,0.5)",
            "&:hover": { background: "rgba(0,0,0,0.8)" },
          }}
        >
          <AiOutlineClose size={24} />
        </IconButton>
      </Box>
    </Modal>
  );
}

