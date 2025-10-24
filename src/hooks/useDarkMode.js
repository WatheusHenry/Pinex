import { useState, useEffect } from "react";

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const detectDarkMode = () => {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;

      const getBrightness = (color) => {
        const rgb = color.match(/\d+/g);
        if (!rgb) return 255;
        const [r, g, b] = rgb.map(Number);
        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      const bodyBrightness = getBrightness(bodyBg);
      const htmlBrightness = getBrightness(htmlBg);
      const brightness = Math.min(bodyBrightness, htmlBrightness);

      setIsDarkMode(brightness < 128);
    };

    detectDarkMode();

    const observer = new MutationObserver(detectDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};
