import { useEffect, useState, useRef } from 'react';

const windowSizePercent = 100; // Make sure to declare any constants used in the function
const paddleHeightPercent = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--paddle-height'));

function useKeyPressHandler(leftPaddleYRef, rightPaddleYRef) {
    const moveInterval = 5;  // in milliseconds
    const moveAmount = 0.5;  // adjust this for finer control
    const PADDLE_MIN_Y = 0;
    const PADDLE_MAX_Y = windowSizePercent - paddleHeightPercent;

    const [activeKeys, setActiveKeys] = useState({});

    const moveIntervalId = useRef(null);

    const updatePaddlePosition = () => {
        if (activeKeys["w"]) {
            leftPaddleYRef.current = Math.max(leftPaddleYRef.current - moveAmount, PADDLE_MIN_Y);
        }
        if (activeKeys["s"]) {
            leftPaddleYRef.current = Math.min(leftPaddleYRef.current + moveAmount, PADDLE_MAX_Y);
        }
        if (activeKeys["ArrowUp"]) {
            rightPaddleYRef.current = Math.max(rightPaddleYRef.current - moveAmount, PADDLE_MIN_Y);
        }
        if (activeKeys["ArrowDown"]) {
            rightPaddleYRef.current = Math.min(rightPaddleYRef.current + moveAmount, PADDLE_MAX_Y);
        }
    };

    useEffect(() => {
        moveIntervalId.current = setInterval(updatePaddlePosition, moveInterval);
        return () => {
            clearInterval(moveIntervalId.current);
        };
    }, [activeKeys]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case "ArrowUp":
                case "ArrowDown":
                case "w":
                case "s":
                    setActiveKeys(prevKeys => ({ ...prevKeys, [event.key]: true }));
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.key) {
                case "ArrowUp":
                case "ArrowDown":
                case "w":
                case "s":
                    setActiveKeys(prevKeys => ({ ...prevKeys, [event.key]: false }));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
}

export default useKeyPressHandler;
