import { useParticipant } from '@daily-co/daily-react-hooks';
import React from 'react';

export default function ParticipantItem({ id }) {
  const participant = useParticipant(id);
  return (
    <div className='participant-item'>
      {participant?.user_name}
    </div>
  )
}
