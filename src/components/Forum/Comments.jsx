import Comment from "./Comment";

function CommentList() {
    const comments = [];

    return (
        <div>
            <h3>Comments</h3>
            {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
            ))}
        </div>
    );
};

export default CommentList;