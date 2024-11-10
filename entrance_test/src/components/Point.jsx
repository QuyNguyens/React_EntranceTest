import React, { memo, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import './style.scss';

const Point = memo(forwardRef(({ setPointModel, pointModel, point }, ref) => {
  const [countdown, setCountdown] = useState(3000);
  const [isClicked, setIsClicked] = useState(false);
  const [opacity, setOpacity] = useState(1);

  // calculate the countdown when click the point
  useEffect(() => {
    if (isClicked && countdown > 0 && !pointModel.isOver) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 100) {
            hiddenPoint();
            clearInterval(timer);
            return 0;
          }
          if(pointModel.isOver){
            clearInterval(timer);
            return prev;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [isClicked, pointModel]);
  
  // check the last point clicked
  // calculate the opacity when clicked
  useEffect(() => {
    if (pointModel.pointCount === point.id && countdown === 0) {
        setPointModel((prev) => ({ ...prev, isLastClick: true }));
    }
    if(countdown>0){
      setOpacity(calculateOpacity(countdown));
    }
  },[countdown]);

  // hide point after 3 seconds when clicked
  const hiddenPoint = () => {
    setTimeout(() =>setPointModel((prev) => {
      const updatedPoints = prev.points.map((pt) => 
        pt.id === point.id ? { ...pt, visible: false } : pt
      );
      return { ...prev, points: updatedPoints };
    }));
  };

  // using ref to callback handlePointClick into game component
  useImperativeHandle(ref, () => ({
    handlePointClick,
  }));

  // calculate the opacity decrease
  const calculateOpacity = (currentTime, totalTime = 3000, minOpacity = 0.1, maxOpacity = 1) => {
    if (currentTime > totalTime) currentTime = totalTime;
    return minOpacity + (currentTime / totalTime) * (maxOpacity - minOpacity);
  };

  // handle when click the point
  const handlePointClick = (isUserClick = false) => {
    if (!isClicked && !pointModel.isOver) {
      setTimeout(() => setIsClicked(true), 0);
      if (isUserClick) {
        if (point.id === pointModel.nextClick) {
          setPointModel((prev) => ({
            ...prev,
            nextClick: pointModel.nextClick + 1,
          }));
        } else {
          setPointModel((prev) => ({
            ...prev,
            titleText: 'Game Over',
            playText: 'Play',
            isStart: false,
            autoPlay: false,
            isOver: true,
          }));
        }
      }
    }
  };

  return (
    <div
      className="point-container"
      id={`${isClicked ? 'active' : ''}`}
      onClick={() => handlePointClick(true)}
      style={{
        opacity: opacity,
        zIndex: point.zIndex,
        top: point.y,
        left: point.x,
        visibility: !point.visible ? 'hidden' : 'visible',
      }}
    >
      <span>{point.id}</span>
      {isClicked ? <span className='span-time'>{(countdown / 1000).toFixed(1)}s</span> : <span />}
    </div>
  );
}));

export default Point;
