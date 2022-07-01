import React from 'react';
import './HomeScreen.css';

export default function HomeScreen({ startHairCheck }) {
  return (
    <div className="home-screen">
      <h1>React Daily Hooks custom video app</h1>
      <p>Start the demo with a new unique room by clicking the button below.</p>
      <button onClick={startHairCheck}>Click to start a call</button>
      <p className="small">Select “Allow” to use your camera and mic for this call if prompted</p>
    </div >
  );
}
