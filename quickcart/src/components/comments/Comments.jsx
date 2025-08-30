import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Button, Form } from "react-bootstrap";
import { FaStar } from "react-icons/fa";

function Comments({ comments, onAdd, onUpdate, onDelete }) {
    const [editingId, setEditingId] = useState(null); // null = nothing, "new" = adding, or comment.id = editing
    const { user } = useContext(AuthContext);

    const handleFormSubmit = (commentData) => {
        if(!commentData.text.trim() || commentData.rating === 0) return;

        if(editingId === 'new'){
            // Add new comment
            const comment = {
                id: Date.now().toString(),
                userId: user.id,
                username: user.username,
                createdAt: new Date().toISOString(),
                ...commentData
            };

            onAdd(comment);
        }
        else {
            // Update existing comment
            const updated = {
                id: editingId,
                userId: user.id,
                username: user.username,
                createdAt: new Date().toISOString(),
                ...commentData
            };

            onUpdate(updated);
        }        

        // Reset form (local state)
        setEditingId(null);
    };
    
    const startEdit = (c) => {
        setEditingId(c.id);
    };

    const startAdd = () => {
        setEditingId("new");
    };

    return (
        <div className="comments mt-4">
            <h5>Comments ({comments.length})</h5>

            {/* Comments list */}
            {comments.length > 0 ? (
                comments.map(c => (
                    <div key={c.id}>
                        {editingId === c.id ? (
                            //Editing mode
                            <CommentFormMode 
                                initialText={c.text}
                                initialRating={c.rating}
                                onCancel={() => setEditingId(null)}
                                onSubmit={handleFormSubmit}
                            />
                        ) : (
                            //Display mode
                            <CommnetDisplayMode 
                                comment={c}
                                user={user}
                                onEdit={startEdit}
                                onDelete={onDelete}
                            />
                        )}
                    </div>
                ))
            ) : (
                <p className="text-muted">No comments yet.</p>
            )}

            {/* Add comment button / form (only when not editing) */}
            {user && editingId === null && (
                <Button variant="outline-primary" size="sm" onClick={startAdd} className="mt-4">
                    Leave a review
                </Button>
            )}

            {user && editingId === 'new' && (
                <CommentFormMode 
                    onCancel={() => setEditingId(null)}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
}

export default Comments;

function CommnetDisplayMode({ comment, user, onEdit, onDelete }) {
    const canManage = user && (
        user.id === comment.userId || user.roles?.includes('Admin')
    );

    return (
        <div className="p-2 mt-3">
            <strong>{comment.userName}</strong>
            <div className="rating">
                {[...Array(5)].map((_, i) => (
                    <FaStar 
                        key={i}
                        size={16}
                        color={i < comment.rating ? '#ffc107' : '#e4e5e9'}
                    />
                ))}
            </div>
            <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
            <p className="mb-1">{comment.text}</p>

            {/* Edit & delete button only for logged in user’s own comment, or admin user */}
            {canManage && (
                <div className="d-flex gap-2">
                    <Button
                        size="sm"
                        variant="link"
                        className="p-0 text-primary" 
                        onClick={() => onEdit(comment)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => onDelete(comment)}
                    >
                        Delete
                    </Button>
                </div>
            )}
        </div>
    );
}

function CommentFormMode({ initialText = '', initialRating = 0, onSubmit, onCancel }) {
    const [text, setText] = useState(initialText);
    const [rating, setRating] = useState(initialRating);

    const handleSubmit = () => {
        if(!text.trim() || rating === 0) return;
        onSubmit({text, rating});
    };

    return (
        <div className="mt-3 p-2 border rounded">
            <div className="mb-2">
                {[...Array(5)].map((_, i) => (
                    <FaStar 
                        key={i}
                        size={16}
                        style={{ cursor: 'pointer', marginRight: 4 }}
                        color={i < rating ? '#ffc107' : '#e4e5e9'}
                        onClick={() => setRating(i + 1)}
                    />
                ))}
            </div>
            <Form.Control 
                as="textarea"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your comment..."
            />
            <div className="mt-2 d-flex gap-2">
                <Button size="sm" variant="primary" onClick={handleSubmit}>
                    Save
                </Button>
                <Button size="sm" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}