import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useState, useEffect } from "react";
import { Container, Grid, Button, TextField } from "@mui/material";
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import './Forum.css'


const CommentForm = ({ onAddComment, setComments, userId }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');


  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const fetchedUserData = userSnapshot.data();
          setUserName(fetchedUserData.username);
        } else {
          console.error('User document not found for userId:', userId);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    if (userId) {
      fetchUserName();
    }
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
      const newComment = {
        text: commentText,
        timeStamp: serverTimestamp(),
        userId: userId,
        userName: userData.username,
        profileImage: userData.profileImage,
        going: 0,
        interested: 0,
        notGoing: 0,

      };

      const docRef = await addDoc(postCollectionRef, newComment);
      await addDoc(userInteractionsCollectionRef, {
        userId,
        commentId: docRef.id,
        interactionType: 'Comment',
        interactionType: 'Going',
        interactionType: 'Interested',
        interactionType: 'Not Going',
      });
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
    <div style={{ margin: '5%' }}>
      <Container>
        <Grid container spacing={.8}>
          <h2 id="addAComment">Add a Comment...</h2>
          <Grid item >
            <textArea
              id="textField"
              size='small'
              placeholder='type your comment here...'
              value={commentText}
              style={{ backgroundColor: 'white' }}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </Grid>
          <Grid item>
            <button id="postButton" className="button" variant="contained" onClick={handleSubmit}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </Grid>
          {error && <p>{error}</p>}
        </Grid>
      </Container>
    </div>
  );
};

export default CommentForm;


