import React from "react";
// import firebase from "firebase/app";
import "firebase/firestore";


function Comment({ comment }) {
    const handleEdit = async () => {
        try {
            const updatedText = prompt('Edit', comment.text);

            if (updatedText !== null) {
                await firebase.firestore().collection('comments').doc(comment.id).update({ text: updatedText });
            }
        } catch (error) {
            console.error('Error editing comment:', error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this comment?');

            if(confirmDelete) {
                await firebase.firestore().collection('comments').doc(comment.id).delete();
            }
        } catch (error) {
            
        }
    }    

    return (
        <div>
            <p>{comment.text}</p>
            <button>Edit</button>
            <button>Delete</button>
        </div>
    );
};

export default Comment;