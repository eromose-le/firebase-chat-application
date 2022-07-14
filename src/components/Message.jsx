import React, { useRef, useEffect } from 'react';
import moment from 'moment';

const Message = ({ msg, user1 }) => {
  const scrollRef = useRef();

  const dateValue = msg.createdAt.toDate();
  // const test = msg.createdAt.getTime().toTimeString();
  // console.log(test);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msg]);
  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? 'own' : ''}`}
      ref={scrollRef}
    >
      <p className={msg.from === user1 ? 'me' : 'friend'}>
        {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
        {msg.text}
        <br />
        <small>{moment(dateValue).fromNow()}</small>
      </p>
    </div>
  );
};

export default Message;
