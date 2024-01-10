import EditComment from "./EditComment";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc,increment } from "firebase/firestore";

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
        const commentsSnapshot = await getDocs(commentsCollection);

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

    const intervalId = setInterval(fetchData, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const handleEditClick = (commentId) => {
    setSelectedCommentId(commentId);
  };

  const handleDeleteClick = (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (confirmDelete) {
      console.log("Deleting comment with ID:", commentId);
    }
  };

  const handleCommentClick = (commentId) => {
    setSelectedCommentId(commentId);
  };

  const handleEditCommentClose = () => {
    setSelectedCommentId(null);
  };
  
  const handleNotGoing = async (commentId) => {
    try {
      const commentDocRef = doc(db, 'post', commentId);
      await updateDoc(commentDocRef, { notGoing: increment(1) });
      setNotGoing((prevNotGoing) => prevNotGoing + 1);
    } catch (error) {
      console.error("Error not going comment:", error.message);
      setError(error.message);
    }
  };

  const handleGoing = async (commentId) => {
    try {
      const commentDocRef = doc(db, 'post', commentId);
      await updateDoc(commentDocRef, { going: increment(1) });
      setGoing((prevGoing) => prevGoing + 1);
    } catch (error) {
      console.error("Error going comment:", error.message);
      setError(error.message);
    }
  };

  const handleInterested = async (commentId) => {
    try {
      const commentDocRef = doc(db, 'post', commentId);
      await updateDoc(commentDocRef, { interested: increment(1) });
      setInterested((prevInterested) => prevInterested + 1);
    } catch (error) {
      console.error("Error interested comment:", error.message);
      setError(error.message);
    }
  };

  return (
    <div>
      <h3>Live Feed</h3>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li
              key={comment.id}
              onClick={() => handleCommentClick(comment.id)}
              style={{
                marginBottom: "16px",
                border: "1px solid #ccc",
                padding: "8px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <p>{comment.text}</p>
              <p>{comment.timeStamp.toDate().toLocaleString()}</p>
              {selectedCommentId === comment.id && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button onClick={() => handleGoing(comment.id)}>Going ({going})</button>
                  <button onClick={() => handleInterested(comment.id)}>Interested ({interested})</button>
                  <button onClick={() => handleNotGoing(comment.id)}>Not Going ({notGoing})</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedCommentId && (
        <EditComment
          comment={comments.find((c) => c.id === selectedCommentId)}
          setComments={setComments}
          onClose={handleEditCommentClose}
        />
      )}
    </div>
  );
}

export default CommentList;