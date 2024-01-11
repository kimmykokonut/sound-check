import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useState, useEffect } from "react";
import { arrayUnion, arrayRemove } from 'firebase/firestore';

// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const commentsCollection = collection(db, "post");
//       const commentsSnapshot = await getDocs(commentsCollection);

//       const fetchedComments = commentsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setComments(fetchedComments);
//     } catch (error) {
//       console.error("Error fetching comments:", error.message);
//     }
//   };

const CommentForm = ({ onAddComment, setComments, userId }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userCollection = collection(db, 'users', userId);
        const userSnapshot = await getDoc(userCollection);
        const fetchedUserName = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserName(fetchedUserName);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };
  
    fetchUserName();
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!commentText.trim()) {
        throw new Error('Comment cannot be empty');
      }

      setLoading(true);

      const userId = auth.currentUser.uid;
      const userInteractionsCollectionRef = collection(db, 'userInteractions');
      const postCollectionRef = collection(db, 'post');
      const userCollectionRef = collection(db, 'users');
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      setUserName(userData.username);
      console.log('userData:', userData.username);
      const newComment = {
        text: commentText,
        timeStamp: serverTimestamp(),
        userId: userId, 
        userName: userData.username,
       
        // going: false,
        // interested: false,
        // notGoing: false,
      };

      const docRef = await addDoc(postCollectionRef, newComment);
      // docRef = await addDoc(userCollectionRef, newComment);
      const commentWithId = { ...newComment, id: docRef.id };
      console.log('commentWithId:', userData.username);
      onAddComment(commentWithId);
      setComments((prevComments) => [commentWithId, ...prevComments]);
      setCommentText('');
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add a Comment</h2>
      <form>
        <textarea
          placeholder='type your comment here...'
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button onClick={handleSubmit}>
          {loading ? 'Posting...' : 'Post'}
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default CommentForm;


