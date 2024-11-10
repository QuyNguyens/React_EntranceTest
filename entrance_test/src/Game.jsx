import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import Point from './components/Point';

import './game.scss';

const Game = () => {
  const [pointModel, setPointModel] = useState({
    points: [],
    pointCount: 5,
    nextClick: 1,
    titleText: "LET'S PLAY",
    playText: "Play",
    isStart: false,
    isLastClick: false,
    isOver: false,
    autoPlay: false
  });
  const [timeTotal, setTimeTotal] = useState(0.0);

  const autoPlayRef = useRef(null);
  const pointsContainerRef = useRef(null);
  const pointRefs = useRef([]);

  // Using to calculate the timeTotal when click play
  useEffect(() => {
    if (pointModel.isStart) {
        const interval = setInterval(() => {
            if (pointModel.nextClick === pointModel.pointCount + 1 && pointModel.isLastClick){
              clearInterval(interval);
              setPointModel((prev) => (
                { ...prev, titleText: "ALL CLEARED", playText: 'Play', isStart: false }));
            }else{
              setTimeTotal((prev) => prev + 0.1);
            }
        }, 100);
        return () => clearInterval(interval);
    }
    }, [pointModel.isStart, pointModel.nextClick, pointModel.isLastClick]);

  // Execute when click Auto Play On
  useEffect(() => {
    if (pointModel.autoPlay) {
        autoPlayRef.current = setInterval(() => {
            setPointModel((prevModel) => {   
                const pointRef = pointRefs.current[prevModel.nextClick];

                if (pointRef && pointRef.handlePointClick) {
                    pointRef.handlePointClick();
                    return { ...prevModel, nextClick: prevModel.nextClick + 1 };
                } else {
                    clearInterval(autoPlayRef.current);
                    return { ...prevModel, autoPlay: false };
                }
            });
        }, 1000);

        return () => clearInterval(autoPlayRef.current);
    }
    if(pointModel.autoPlay){
        clearInterval(autoPlayRef.current);
    }
    }, [pointModel.autoPlay, pointModel.nextClick]);

  // start the autoPlay
  const startAutoPlay = () => {
      setPointModel((prev) => ({...prev, autoPlay: true}));
  }

  // stop the autoPlay
  const stopAutoPlay = () => {
    clearInterval(autoPlayRef.current);
    setPointModel((prev) => ({ ...prev, autoPlay: false }));
  };

  // check when click last point it will stop the autoPlay
  useEffect(() => {
    if (pointModel.nextClick > pointModel.pointCount) {
      stopAutoPlay();
    }
    return () => clearInterval(autoPlayRef.current);
  }, [pointModel.nextClick, pointModel.pointCount]);

  // Execute when click start or restart
  const startGame = () => {
    const newPoints = Array.from({ length: pointModel.pointCount }, (_, i) => {
      const { x, y } = getRandomPointPosition();
      return { id: i + 1, x, y, visible: true, zIndex: pointModel.pointCount - i, uniqueKey: `${Math.random().toString(36).substr(2, 9)}` };
    });
    setPointModel(pre => ({
      ...pre,
      points: newPoints,
      nextClick: 1,
      titleText: "LET'S PLAY",
      playText: pre.playText === 'Play' ? 'Restart' : pre.playText,
      isOver: false,
      isLastClick: false,
      isStart: true,
    }));
    setTimeTotal(0.0);
  };

  // Random the point position when play or restart
  const getRandomPointPosition = () => {
    const container = pointsContainerRef.current;
    if (!container) return { x: 0, y: 0 };

    const { width, height } = container.getBoundingClientRect();
    const x = Math.random() * (100 - (50 / width) * 100);
    const y = Math.random() * (100 - (50 / height) * 100);
    return { x: `${x}%`, y: `${y}%` };
  };

  // Get color the title (play, overed, cleared)
  const getColorTitle = () => {
    switch (pointModel.titleText) {
      case 'Game Over':
        return 'orange';
      case "LET'S PLAY":
        return 'black';
      default:
        return 'green';
    }
  };

  // format the time
  const formatTime = () => {
    const timeInSeconds = timeTotal;
    
    if (timeInSeconds < 60) {
        return `${timeInSeconds.toFixed(1)}s`;
    }

    return format(new Date(timeInSeconds * 1000), "m'm' s's'");
 };

  return (
    <div className="game-container">
      <div className='game-box'>
        <h1 style={{ color: getColorTitle() }}>{pointModel.titleText}</h1>
        <div className="point-count">
          <span>Point:</span>
          <input
            type="text"
            value={pointModel.pointCount}
            onChange={(e) => setPointModel(pre => ({ ...pre, pointCount: Number(e.target.value) }))}
          />
        </div>
        <div className="time-all">
          <span>Time:</span>
          <span>{formatTime()}</span>
        </div>
        <div className='btn-play'>
          <button onClick={startGame}>{pointModel.playText}</button>
          {pointModel.playText === 'Restart' &&
            <button className='btn-auto-play' onClick={pointModel.autoPlay ? stopAutoPlay : startAutoPlay}>
              {pointModel.autoPlay ? 'Auto Play OFF' : 'Auto Play ON'}
            </button>
          }
        </div>
        <div className='points' ref={pointsContainerRef}>
          {
            pointModel.points.map((point) => (
              <Point
                key={point.uniqueKey}
                ref={(el) => (pointRefs.current[point.id] = el)}
                setPointModel={setPointModel}
                pointModel={pointModel}
                point={point}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Game;
