import React from 'react';
import './HomeScreen.css';
import { ROOMS } from '../../constants';

export default function HomeScreen({ startHairCheck }) {
  const startDemo = () => {
    startHairCheck(ROOMS[0].url);
  };

  return (
    <div className="home-screen">
      <h1>React Daily Hooks custom video app</h1>
      <p>Start the demo with a new unique room by clicking the button below.</p>
      <button onClick={startDemo}>Click to start a call</button>
      <p className="small">Select “Allow” to use your camera and mic for this call if prompted</p>
    </div >
  );
}
