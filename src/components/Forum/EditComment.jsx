import React, { useState } from "react";
import { db, auth } from "../../firebase";
import { updateDoc, deleteDoc, doc} from "firebase/firestore";


const EditComment = ({ comment, setComments }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState();
    const [error, setError] = useState(null);
    const userId = auth.currentUser.uid;

    const updateCommentText = async (updatedText) => {
        try {
          if (auth.currentUser.uid !== comment.userId) {
            throw new Error("You are not authorized to edit this comment.");
          }
    
          await updateDoc(doc(db, 'post', comment.id), { text: updatedText });
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === comment.id ? { ...c, text: updatedText } : c
            )
          );

          setEditedComment(updatedText);
          setIsEditing(false);
          setError(null);
        } catch (error) {
          console.error("Error updating comment:", error.message);
          setError(error.message);
        }
      };
      
    const handleEdit = () => {
        try {
          if (!userId) {
            throw new Error("User not authenticated. Please log in.");
          }
    
          if (userId !== comment.userId) {
            throw new Error("You are not authorized to edit this comment.");
          }
    
          const updatedText = prompt('Edit', editedComment);
          if (updatedText !== null) {
            updateCommentText(updatedText);
          }
        } catch (error) {
          console.error('Error editing comment:', error.message);
          setError(error.message);
        }
      };

      const handleDelete = async () => {
        try {
          if (!auth.currentUser) {
            throw new Error("User not authenticated. Please log in.");
          }
      
          if (!comment || !comment.userId || !comment.id) {
            throw new Error("Invalid comment. Cannot delete.");
          }
      
          if (auth.currentUser.uid !== comment.userId) {
            throw new Error("You are not authorized to delete this comment.");
          }
      
          await deleteDoc(doc(db, 'post', comment.id));
      
          setComments((prevComments) =>
            prevComments.filter((c) => c.id !== comment.id)
          );
      
          setIsEditing(false);
          setError(null);
        } catch (error) {
          console.error('Error deleting comment:', error.message);
          setError(error.message);
        }
      };
    
    
      return (
        <div >
          {isEditing ? (
            <div>
              <textarea
                value={editedComment}
                placeholder="Edit your comment..."
                onChange={(e) => setEditedComment(e.target.value)}
              />
              <button onClick={handleEdit}>Save</button>
              <p>{error}</p>
            </div>
          ) : (
            <div
            style={{
              
              top: 0,
              right: 0,
              display: "flex",
              gap: "8px",
            }}
          >
             
              <button onClick={() => setIsEditing(true)}>Edit</button>

              <button onClick={handleDelete}>Delete</button>
            
              <p>{error}</p>
            </div>
          )}
        </div>
      );
    };
    
export default EditComment;