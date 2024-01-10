import React, { useState } from "react";
import { db } from "../../firebase";
import { updateDoc, deleteDoc, doc, increment} from "firebase/firestore";


const EditComment = ({ comment, setComments }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState();
    const [error, setError] = useState(null);
   
    const updateCommentText = async (updatedText) => {
        await updateDoc(doc(db, 'post', comment.id), { text: updatedText });
       
        setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === comment.id ? { ...c, text: updatedText } : c
        )
      );
    
      setEditedComment(updatedText);
      setIsEditing(false);
      setError(null);
      };
      

      
      const handleEdit = async () => {
        try {
          const updatedText = prompt('Edit', editedComment);
          if (updatedText !== null) {
            await updateCommentText(updatedText);
          }
        } catch (error) {
          console.error('Error editing comment:', error.message);
          setError(error.message);
        }
      };
      
      const handleDelete = async () => {
        try {
          const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
      
          if (confirmDelete) {
            await deleteDoc(doc(db, 'post', comment.id));
      
            setComments((prevComments) =>
              prevComments.filter((c) => c.id !== comment.id)
            );
      
            setIsEditing(false);
            setError(null);
          }
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
                onChange={(e) => setEditedComment(e.target.value)}
              />
              <button onClick={handleEdit}>Save</button>
              <p>{error}</p>
            </div>
          ) : (
            <div>
             
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            
              <p>{error}</p>
            </div>
          )}
        </div>
      );
    };
    
export default EditComment;
