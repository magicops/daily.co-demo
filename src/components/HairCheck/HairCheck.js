import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  useLocalParticipant,
  useVideoTrack,
  useDevices,
  useDaily,
  useDailyEvent,
} from '@daily-co/daily-react-hooks';
import UserMediaError from '../UserMediaError/UserMediaError';

import './HairCheck.css';
import { ROOMS } from '../../constants';

export default function HairCheck({ joinCall, cancelCall, roomUrl }) {
  const localParticipant = useLocalParticipant();
  const videoTrack = useVideoTrack(localParticipant?.session_id);
  const { microphones, speakers, cameras, setMicrophone, setCamera, setSpeaker } = useDevices();
  const callObject = useDaily();
  const videoElement = useRef();

  const [getUserMediaError, setGetUserMediaError] = useState(false);

  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const onChange = (e) => {
    callObject.setUserName(e.target.value);
  };

  const join = async (e) => {
    e.preventDefault();

    //also we need to leave after hair check because we might be blocked to join the call or go to the waiting room so leave() will release the mic/cam

    //calling leave without being in a call causes the following console errors:
    // -- sigChannel stopRequestingToJoinMeeting called before concrete sigChannel created
    // -- sigChannel disconnect called before concrete sigChannel created

    await callObject.leave()


    joinCall(roomUrl || ROOMS[0].url);
  };

  useEffect(() => {
    if (!videoTrack.persistentTrack) return;
    videoElement?.current &&
      (videoElement.current.srcObject =
        videoTrack.persistentTrack && new MediaStream([videoTrack?.persistentTrack]));
  }, [videoTrack.persistentTrack]);

  const updateMicrophone = (e) => {
    setMicrophone(e.target.value);
  };

  const updateSpeakers = (e) => {
    setSpeaker(e.target.value);
  };

  const updateCamera = (e) => {
    setCamera(e.target.value);
  };

  return (
    <>
      {getUserMediaError ? (
        <UserMediaError />
      ) : (
        <form className="hair-check" onSubmit={join}>
          <h1>Setup your hardware</h1>
          {/*Video preview*/}
          {videoTrack?.persistentTrack && <video autoPlay muted playsInline ref={videoElement} />}

          {/*Username*/}
          <div>
            <label htmlFor="username">Your name:</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              onChange={(e) => onChange(e)}
              value={localParticipant?.user_name || ' '}
            />
          </div>

          {/*Microphone select*/}
          <div>
            <label htmlFor="micOptions">Microphone:</label>
            <select name="micOptions" id="micSelect" onChange={updateMicrophone} value={microphones?.find(c => c.selected)?.device?.deviceId}>
              {microphones?.map((mic) => (
                <option key={`mic-${mic.device.deviceId}`} value={mic.device.deviceId}>
                  {mic.device.label}
                </option>
              ))}
            </select>
          </div>

          {/*Speakers select*/}
          <div>
            <label htmlFor="speakersOptions">Speakers:</label>
            <select name="speakersOptions" id="speakersSelect" onChange={updateSpeakers} value={speakers?.find(c => c.selected)?.device?.deviceId}>
              {speakers?.map((speaker) => (
                <option key={`speaker-${speaker.device.deviceId}`} value={speaker.device.deviceId}>
                  {speaker.device.label}
                </option>
              ))}
            </select>
          </div>

          {/*Camera select*/}
          <div>
            <label htmlFor="cameraOptions">Camera:</label>
            <select name="cameraOptions" id="cameraSelect" onChange={updateCamera} value={cameras?.find(c => c.selected)?.device?.deviceId}>
              {cameras?.map((camera) => (
                <option key={`cam-${camera.device.deviceId}`} value={camera.device.deviceId}>
                  {camera.device.label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={join} type="submit">
            Join call
          </button>
          <button onClick={cancelCall} className="cancel-call">
            Back to start
          </button>
        </form>
      )}
    </>
  );
}
