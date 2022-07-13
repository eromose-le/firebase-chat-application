import { useEffect, useState } from 'react';
import Img from '../assets/img/avatar.png';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const User = ({ user, selectUser, chat, user1 }) => {
  const user2 = user?.uid;
  const [data, setData] = useState('');

  // retrive last message from lastMsg db
  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let unsub = onSnapshot(doc(db, 'lastMsg', id), (doc) => {
      setData(doc.data());
    });
    return () => unsub();
  }, []);
  return (
    <>
      <div
        className={`user_wrapper ${chat.name === user.name && 'selected_user'}`}
        onClick={() => selectUser(user)}
      >
        <div className="user_info">
          <div className="user_detail">
            <img src={user.avatar || Img} alt="avatar" className="avatar" />
            <h4>{user.name}</h4>
            {/* read status */}
            {data?.from !== user1 && data?.unread && (
              <small className="unread">New</small>
            )}
          </div>

          {/* online status */}
          <div
            className={`user_status ${user.isOnline ? 'online' : 'offline'}`}
          ></div>
        </div>

        {/* brief message info */}
        {data && (
          <p className="truncate">
            <strong>{data.from === user1 ? 'Me:' : null}</strong>
            {data.text}
          </p>
        )}
      </div>
    </>
  );
};
