"use client";

import { useState, useCallback } from "react";

export function useCamera() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [labelImage, setLabelImage] = useState<string | null>(null);

  const handleFrontImage = useCallback((dataUrl: string) => {
    setFrontImage(dataUrl);
  }, []);

  const handleLabelImage = useCallback((dataUrl: string) => {
    setLabelImage(dataUrl);
  }, []);

  const resetFront = useCallback(() => setFrontImage(null), []);
  const resetLabel = useCallback(() => setLabelImage(null), []);
  const resetAll = useCallback(() => {
    setFrontImage(null);
    setLabelImage(null);
  }, []);

  return {
    frontImage,
    labelImage,
    handleFrontImage,
    handleLabelImage,
    resetFront,
    resetLabel,
    resetAll,
  };
}
