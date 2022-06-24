import { useParticipantIds } from '@daily-co/daily-react-hooks';
import React from 'react';
import ParticipantItem from './ParticipantItem';

import './ParticipantsPanel.css';

export default function ParticipantsPanel() {
  const participantIds = useParticipantIds();

  return (
    <div className='participants-wrapper'>
      <h3>Participants</h3>
      {participantIds.map((participantId) => (
        <ParticipantItem key={participantId} id={participantId} />
      ))}
    </div>
  );
}
