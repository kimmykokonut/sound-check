import React from "react";
import CommentList from "./Comments";
import CommentForm from "./CommentForm";


function Forum() {
    return (
        <div>
            <h2>Forum</h2>
            <CommentList />
            <CommentForm />
        </div>
    );
};

export default Forum;