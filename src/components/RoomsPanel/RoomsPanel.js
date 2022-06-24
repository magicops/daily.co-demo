import { useRoom } from '@daily-co/daily-react-hooks';
import React from 'react';

import { ROOMS } from '../../constants';

import './RoomsPanel.css';

export default function RoomsPanel({ switchRoom }) {
  const currentRoom = useRoom();

  return (
    <div className='rooms-wrapper'>
      <h3>Rooms</h3>
      {ROOMS.map((room) => {
        const isDisabled = room.url.indexOf(currentRoom?.name) >= 0;
        return (
          <div
            className={`room-item ${isDisabled ? 'disabled' : ''}`}
            key={room.name}
            disabled={isDisabled}
            onClick={() => !isDisabled && switchRoom(room.url)}
          >
            {room.name}
          </div>
        );
      })}
    </div>
  );
}
