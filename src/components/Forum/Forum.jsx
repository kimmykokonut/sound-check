import React, { useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

function Forum() {
    const [comments, setComments] = useState([]);

    const addComment = (newComment) => {
        setComments((prevComments) => [...prevComments, newComment]);
    };

    return (
        <div>
            <CommentForm setComments={setComments} onAddComment={addComment} />
            <div>
            <CommentList comments={comments} />
            </div>
        </div>
    );
}

export default Forum;