import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useState } from "react";
// import { v4 } from "uuid";

const CommentForm = ({ onAddComment }) => {
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
      const collectionRef = collection(db, 'post');
      console.log(collectionRef);
      const newComment = {
        // id: id,
        text: commentText,
        timeStamp: new Date(),
      };

      await addDoc(collectionRef, newComment);
      console.log("after addDoc");

      onAddComment(newComment);
      setCommentText('');
      console.log("after setCommentText");
      console.log(collectionRef)
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