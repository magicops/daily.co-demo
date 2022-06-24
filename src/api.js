/*
  We'll add a 30-min expiry (exp) so rooms won't linger too long on your account.
  See other available options at https://docs.daily.co/reference#create-room
 */
async function createRoom() {
  const exp = Math.round(Date.now() / 1000) + 60 * 30;
  const options = {
    properties: {
      exp,
    },
  };

  const response = await fetch(`https://api.daily.co/v1/rooms/`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.REACT_APP_DAILY_API_KEY,
    },
  });

  return await response.json();
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { createRoom };
