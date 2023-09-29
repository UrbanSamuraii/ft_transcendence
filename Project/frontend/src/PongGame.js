import { useEffect, useState, useRef } from 'react';

import './PongGame.css';

import useKeyPressHandler from './useKeyPressHandler';

const paddleHeightPercent = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--paddle-height'));
const paddleWidthPercent = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--paddle-width'));

const paddleHeight = paddleHeightPercent;
const paddleWidth = paddleWidthPercent;

const windowSizePercent = 100;
const accelerationFactor = 1.0;
const angleFactor = 3.5;
const squareHeight = 2;
const squareWidth = 2;

function PongGame() {
    const [square, setSquare] = useState({
        x: 50,
        y: 50,
        dx: Math.random(),
        dy: -0.2
    });

    const leftPaddleYRef = useRef(50);
    const rightPaddleYRef = useRef(50);

    useKeyPressHandler(leftPaddleYRef, rightPaddleYRef);

    const frameRef = useRef(null);
    const squareRef = useRef(square);

    useEffect(() => {
        squareRef.current = square;
    }, [square]);

    const rectanglesOverlap = (rect1, rect2) => {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    };

    const animate = () => {
        let newSquare = { ...squareRef.current };

        newSquare.x += newSquare.dx;
        newSquare.y += newSquare.dy;

        if (newSquare.y <= 0 || newSquare.y >= 100) {
            newSquare.dy = -newSquare.dy;
        }

        const adjustDyOnCollision = (paddleY) => {
            const relativeSquarePosition = (newSquare.y - paddleY) / paddleHeight;
            return (relativeSquarePosition - 0.5) * angleFactor; // adjust the angle to see square go wide
        }

        const squareRectangle = {
            x: newSquare.x,
            y: newSquare.y,
            width: squareWidth,
            height: squareHeight
        };

        const leftPaddleRectangle = {
            x: 0,  // Because it's at the left edge
            y: leftPaddleYRef.current,
            width: paddleWidth,
            height: paddleHeight
        };

        const rightPaddleRectangle = {
            x: windowSizePercent - paddleWidth,  // Because it's at the right edge
            y: rightPaddleYRef.current,
            width: paddleWidth,
            height: paddleHeight
        };

        if (rectanglesOverlap(squareRectangle, leftPaddleRectangle)) {
            newSquare.dx = -newSquare.dx * accelerationFactor;
            newSquare.dy = adjustDyOnCollision(leftPaddleYRef.current);
        }

        if (rectanglesOverlap(squareRectangle, rightPaddleRectangle)) {
            newSquare.dx = -newSquare.dx * accelerationFactor;
            newSquare.dy = adjustDyOnCollision(rightPaddleYRef.current);
        }

        if (newSquare.x < 0 || newSquare.x > 100) {
            newSquare = { x: 50, y: 50, dx: -1.5, dy: 1.5 };
        }

        setSquare(newSquare);
        frameRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        animate();
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return (
        <div className="gameArea">
            <div className="leftPaddle" style={{ top: `${leftPaddleYRef.current}%`, width: `${paddleWidth}%`, height: `${paddleHeight}%` }}></div>
            <div className="rightPaddle" style={{ top: `${rightPaddleYRef.current}%`, width: `${paddleWidth}%`, height: `${paddleHeight}%` }}></div>
            <div className="square" style={{ left: `${square.x}%`, top: `${square.y}%`, width: `${squareWidth}vw`, height: `${squareHeight}vw` }}></div>
        </div>
    );
}

export default PongGame;

