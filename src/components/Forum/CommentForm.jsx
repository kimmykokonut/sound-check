import React, {useState} from "react";

const CommentForm = ({ postId }) => {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = async () => {

    };

    return (
        <div>
            <h2>Add a Comment</h2>
            <textarea
            placeholder='type your comment here...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleSubmit}>Post</button>
        </div>
    );
}

export default CommentForm;