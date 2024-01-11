import React, { useState, useEffect } from "react";
import EditComment from "./EditComment";
import { auth, db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, increment, setDoc, getDoc, orderBy, query } from "firebase/firestore";
import { Container, Grid, Card, CardContent, CardHeader, Avatar, Button, IconButton, CardActions } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { red } from '@mui/material/colors';


function CommentList() {
  const [comments, setComments] = useState([]);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [going, setGoing] = useState(0);
  const [interested, setInterested] = useState(0);
  const [notGoing, setNotGoing] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commentsCollection = collection(db, "post");
        const commentsSnapshot = await getDocs(
          query(commentsCollection, orderBy("timeStamp", "desc"))
        );

        const fetchedComments = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error.message);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);
  const handleCommentClick = (commentId) => {
    setSelectedCommentId(commentId);
  };

  const handleEditCommentClose = () => {
    setSelectedCommentId(null);
  };

  const handleNotGoing = async (commentId) => {
    try {
      const userId = auth.currentUser.uid;
      const userInteractionRef = doc(db, "userInteractions", `${userId}_${commentId}`);
      const userInteractionDoc = await getDoc(userInteractionRef);

      if (!userInteractionDoc.exists()) {
        const commentDocRef = doc(db, "post", commentId);
        await updateDoc(commentDocRef, { notGoing: increment(1) });
        setNotGoing((prevNotGoing) => prevNotGoing + 1);

        await setDoc(userInteractionRef, {
          userId,
          commentId,
          interactionType: "Not Going",
        });
      } else {
        console.log("User has already interacted with this comment");
      }
    } catch (error) {
      console.error("Error not going comment:", error.message);
    }
  };

  const handleGoing = async (commentId) => {
    try {
      const userId = auth.currentUser.uid;
      const userInteractionRef = doc(db, "userInteractions", `${userId}_${commentId}`);
      const userInteractionDoc = await getDoc(userInteractionRef);

      if (!userInteractionDoc.exists()) {
        const commentDocRef = doc(db, 'post', commentId);
        await updateDoc(commentDocRef, { going: increment(1) });
        setGoing((prevGoing) => prevGoing + 1);

        await setDoc(userInteractionRef, {
          userId,
          commentId,
          interactionType: "Going",
        });
      } else {
        console.log("User has already interacted with this comment");
      }
    } catch (error) {
      console.error("Error going comment:", error.message);
    }
  };

  const handleInterested = async (commentId) => {
    try {
      const userId = auth.currentUser.uid;
      const userInteractionRef = doc(db, "userInteractions", `${userId}_${commentId}`);
      const userInteractionDoc = await getDoc(userInteractionRef);

      if (!userInteractionDoc.exists()) {
        const commentDocRef = doc(db, 'post', commentId);


        await updateDoc(commentDocRef, { interested: increment(1) });
        setInterested((prevInterested) => prevInterested + 1);

        await setDoc(userInteractionRef, {
          userId,
          commentId,
          interactionType: "Interested",
        });
      } else {
        console.log("User has already interacted with this comment");
      }
    } catch (error) {
      console.error("Error interested comment:", error.message);
    }
  };

  return (
    <div style={{ margin: '5%' }}>
      <Container>
        <h3>Live Feed</h3>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <Grid container spacing={2}>
            {comments.map((comment) => (
              <Grid item xs={12} key={comment.id} >
                <Card raised
                  key={comment.id}
                  onClick={() => handleCommentClick(comment.id)}
                  sx={{
                    width: "70%",
                    variant: "outlined",
                    display: 'inline-block',
                    marginBottom: "16px",
                    border: "1px solid #ccc",
                    padding: "1px",
                    cursor: "pointer",
                    position: "relative",
                    key: comment.id,
                    backgroundColor: selectedCommentId === comment.id ? "#0d98ba " : "#fff",
                  }}
                >
                  <CardHeader
                    sx={{ pt: "10px", pb: "0px" }}
                    avatar={
                      <Avatar sx={{ bgcolor: red[500] }}aria-label="recipe">
                        <img
                          src={comment.profilePic || comment.profileImage}
                          alt={`Profile of ${comment.userName}`}
                          style={{ borderRadius: '50%', width: '32px', height: '32px' }}
                        />
                      </Avatar>
                    }
                    action={
                      <IconButton aria-label="settings">
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={comment.userName}
                  />
                  <CardContent sx={{ py: "0px" }}>
                    <p>{comment.text}</p>
                    <p>{comment.timeStamp.toDate().toLocaleString()}</p>
                    <CardActions disableSpacing sx={{ py: "0px" }}>
                      <IconButton aria-label="add to favorites">
                        <FavoriteIcon />
                      </IconButton>
                      <div>
                        {selectedCommentId === comment.id && (
                          <div>
                            <Button xs={12} onClick={() => handleGoing(comment.id)}>Going ({going})</Button>
                            <Button xs={12} onClick={() => handleInterested(comment.id)}>Interested ({interested})</Button>
                            <Button xs={12} onClick={() => handleNotGoing(comment.id)}>Not Going ({notGoing})</Button>
                          </div>
                        )}
                      </div>
                    </CardActions>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      {selectedCommentId && (
        <EditComment
          comment={comments.find((c) => c.id === selectedCommentId)}
          setComments={setComments}
          onClose={handleEditCommentClose}
          userId={auth.currentUser?.uid}
        />
      )}
    </div>
  );
}

export default CommentList;