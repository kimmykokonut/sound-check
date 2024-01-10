
import EditComment from "./EditComment";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
function CommentList() {
    const [comments, setComments] = useState([]);

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
    }, []
  ); 

  return (
    <div>
      <h3>Live Feed</h3>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => {
            console.log(comment);
            return (
              <li key={comment.id}>
                <EditComment setComments={setComments} comment={comment} />
                {/* maybe we can make this visible on click of link or whatever */}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CommentList;