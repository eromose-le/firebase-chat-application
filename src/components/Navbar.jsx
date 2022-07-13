import { useContext } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { AuthContext } from '../context/auth';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSignout = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      isOnline: false
    });
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav>
      <h3>
        <Link to="/">Akoma Chat</Link>
      </h3>
      <div>
        {user ? (
          <>
            <Link className="link" to="/profile">
              Profile
            </Link>
            <button className="btn" onClick={handleSignout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn link" to="/register">
              Register
            </Link>
            <Link className="btn link" to="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
