import './App.css';

import React, { useEffect, useState, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react-hooks';

import { pageUrlFromRoomUrl, roomUrlFromPageUrl } from './utils';

import HomeScreen from './components/HomeScreen/HomeScreen';
import Call from './components/Call/Call';
import Header from './components/Header/Header';
import Tray from './components/Tray/Tray';
import HairCheck from './components/HairCheck/HairCheck';
import RoomsPanel from './components/RoomsPanel/RoomsPanel';
import ParticipantsPanel from './components/ParticipantsPanel/ParticipantsPanel';

/* We decide what UI to show to users based on the state of the app, which is dependent on the state of the call object. */
const STATE_IDLE = 'STATE_IDLE';
// const STATE_CREATING = 'STATE_CREATING';
const STATE_JOINING = 'STATE_JOINING';
const STATE_JOINED = 'STATE_JOINED';
const STATE_LEAVING = 'STATE_LEAVING';
const STATE_ERROR = 'STATE_ERROR';
const STATE_HAIRCHECK = 'STATE_HAIRCHECK';

export default function App() {
  const [appState, setAppState] = useState(STATE_IDLE);
  const [roomUrl, setRoomUrl] = useState(roomUrlFromPageUrl());
  const [callObject, setCallObject] = useState(null);

  //create the callObject
  useEffect(() => {
    const newCallObject = DailyIframe.createCallObject();
    window._callObject = newCallObject
    setCallObject(newCallObject)
  }, [])

  const startHairCheck = useCallback(async () => {
    if (!callObject) return;
    setAppState(STATE_HAIRCHECK);

    callObject.startCamera();
  }, [callObject]);

  /**
   * Once we pass the hair check, we can actually join the call.
   */
  const joinCall = useCallback((url) => {
    setRoomUrl(url)
    callObject.join({ url });
  }, [callObject]);

  /**
   * Start leaving the current call.
   */
  const startLeavingCall = useCallback(() => {
    if (!callObject) return;
    setAppState(STATE_LEAVING);
    callObject.leave();
  }, [callObject]);

  /**
   * Change room function
   */
  const switchRoom = useCallback(async (url) => {
    if (!callObject) return;
    await callObject.leave();
    joinCall(url);
  }, [callObject, joinCall]);

  /**
   * Update the page's URL to reflect the active call when roomUrl changes.
   */
  useEffect(() => {
    const pageUrl = pageUrlFromRoomUrl(roomUrl);
    if (pageUrl === window.location.href) return;
    window.history.replaceState(null, null, pageUrl);
  }, [roomUrl]);

  /**
   * Update app state based on reported meeting state changes.
   *
   * NOTE: Here we're showing how to completely clean up a call with destroy().
   * This isn't strictly necessary between join()s, but is good practice when
   * you know you'll be done with the call object for a while, and you're no
   * longer listening to its events.
   */
  useEffect(() => {
    if (!callObject) return;

    const events = ['joined-meeting', 'left-meeting', 'error', 'camera-error'];

    function handleNewMeetingState() {
      switch (callObject.meetingState()) {
        case 'joined-meeting':
          setAppState(STATE_JOINED);
          break;
        case 'left-meeting':
          break;
        case 'error':
          setAppState(STATE_ERROR);
          break;
        default:
          break;
      }
    }

    // Use initial state
    handleNewMeetingState();

    // Listen for changes in state
    for (const event of events) {
      /*
        We can't use the useDailyEvent hook (https://docs.daily.co/reference/daily-react-hooks/use-daily-event) for this
        because right now, we're not inside a <DailyProvider/> (https://docs.daily.co/reference/daily-react-hooks/daily-provider)
        context yet. We can't access the call object via daily-react-hooks just yet, but we will later in Call.js and HairCheck.js!
      */
      callObject.on(event, handleNewMeetingState);
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewMeetingState);
      }
    };
  }, [callObject]);

  /**
   * Show the call UI if we're either joining, already joined, or have encountered
   * an error that is _not_ a room API error.
   */
  const showCall = [STATE_JOINING, STATE_JOINED, STATE_ERROR].includes(appState);

  /* When there's no problems creating the room and startHairCheck() has been successfully called,
  * we can show the hair check UI.*/
  const showHairCheck = appState === STATE_HAIRCHECK;

  const renderApp = () => {

    // No API errors? Let's check our hair then.
    if (showCall || showHairCheck)
      return (
        <DailyProvider callObject={callObject}>
          {showHairCheck &&
            <HairCheck
              roomUrl={roomUrl}
              joinCall={joinCall}
              cancelCall={startLeavingCall}
            />
          }

          {showCall &&
            <>
              <div className='call-wrapper'>
                <RoomsPanel
                  roomUrl={roomUrl}
                  switchRoom={switchRoom}
                />
                <Call />
                <ParticipantsPanel />
              </div>
              <Tray leaveCall={startLeavingCall} />
            </>
          }
        </DailyProvider>
      )

    // The default view is the HomeScreen, from where we start the demo.
    return (
      <HomeScreen startHairCheck={startHairCheck} />
    )
  }

  return (
    <div className="app">
      <Header />
      {renderApp()}
    </div>
  );
}
