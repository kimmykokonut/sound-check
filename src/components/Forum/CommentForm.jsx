import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useState } from "react";

import { arrayUnion, arrayRemove } from 'firebase/firestore';

const CommentForm = ({ onAddComment, setComments, userId }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!commentText.trim()) {
        throw new Error('Comment cannot be empty');
      }

      setLoading(true);

      const userId = auth.currentUser.uid;

      const collectionRef = collection(db, 'post');
      const newComment = {
        text: commentText,
        timeStamp: serverTimestamp(),
        userId: userId, 
        going: false,
        interested: false,
        notGoing: false,
      };

      const docRef = await addDoc(collectionRef, newComment);
      const commentWithId = { ...newComment, id: docRef.id };
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