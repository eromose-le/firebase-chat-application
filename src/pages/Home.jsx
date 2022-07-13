import { useEffect, useState } from 'react';
import { db, auth, storage } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { User } from '../components/User';
import MessageForm from '../components/MessageForm';
import Message from '../components/Message';

export const Home = () => {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState('');
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [msgs, setMsgs] = useState([]);

  const user1 = auth.currentUser.uid;

  // 1. Get list of users excluding owner
  useEffect(() => {
    const usersRef = collection(db, 'users');
    // create query object
    const q = query(usersRef, where('uid', 'not-in', [user1]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setUsers(users);
    });
    return () => unsub();
  }, []);

  console.log('user1', user1);
  console.log('users-list', users);

  // 1. Initilize conversation
  // 2. Retrive active user conversation
  const selectUser = async (user) => {
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    //
    const msgsRef = collection(db, 'conversations', id, 'chat');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    // update ui upon any new message in conversation
    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });
    console.log('msgs', msgs);

    // get last message b/w logged in user and selected user
    const docSnap = await getDoc(doc(db, 'lastMsg', id));
    // if last message exists and message is from selected user
    if (docSnap.data() && docSnap.data().from !== user1) {
      // update last message doc, set unread to false
      await updateDoc(doc(db, 'lastMsg', id), { unread: false });
    }
  };

  // 1. Post a message to selected chat || user
  // 2. Post a media file to selected chat || user
  const handleSubmit = async (e) => {
    e.preventDefault();

    // guest declaration
    const user2 = chat.uid;

    // unique identifier of conversation btw users
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    // send media message
    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    // add || save to message collection -> chat sub collection
    await addDoc(collection(db, 'conversations', id, 'chat'), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || ''
    });

    // add || save last message
    await setDoc(doc(db, 'lastMsg', id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || '',
      unread: true
    });

    setText('');
    setImg('');
  };

  return (
    <div className="home_container">
      {/* FRIENDS LIST */}
      <div className="users_container">
        {users.map((user) => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            chat={chat}
            user1={user1}
          />
        ))}
      </div>
      {/* MESSAGE BOX */}
      <div className="messages_container">
        {/* selectUser to start a chat */}
        {chat ? (
          <>
            {/* chat name */}
            <div className="messages_user">
              <h3>{chat.name}</h3>
            </div>

            {/* message list */}
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message key={i} msg={msg} user1={user1} />
                  ))
                : null}
            </div>

            {/* submit actions */}
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
              setImg={setImg}
              img={img}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
};
