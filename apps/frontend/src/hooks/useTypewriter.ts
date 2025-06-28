import { useEffect, useRef } from 'react'

export const useTypewriter = (elementId: string, ships: string[], delay = 1000) => {
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    let currentShipIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const typeWriter = () => {
      const typewriterElement = document.getElementById(elementId);
      if (!typewriterElement) {
        timeoutId = setTimeout(typeWriter, 100);
        return;
      }

      const currentShip = ships[currentShipIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentShip.substring(0, currentCharIndex - 1);
        currentCharIndex--;

        if (currentCharIndex === 0) {
          isDeleting = false;
          currentShipIndex = (currentShipIndex + 1) % ships.length;
          timeoutId = setTimeout(typeWriter, 800); // Longer pause between words
          return;
        }
        timeoutId = setTimeout(typeWriter, 30); // Faster deletion
      } else {
        typewriterElement.textContent = currentShip.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentShip.length) {
          isDeleting = true;
          timeoutId = setTimeout(typeWriter, 2000); // Pause to read
          return;
        }
        timeoutId = setTimeout(typeWriter, 120); // Slower typing for readability
      }
    };

    timeoutId = setTimeout(typeWriter, delay);

    return () => {
      isRunningRef.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [elementId, ships, delay]);
}
