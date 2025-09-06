import { Button } from "react-bootstrap";

function ProfileInfo({ user, onEditClick, onPasswordClick }) {
    return (
        <div className="mb-4">
            <h5 className="mb-3">Profile Information</h5>
            <dl className="row">
                <dt className="col-sm-3">Email</dt>
                <dd className="col-sm-9">{user.email}</dd>

                <dt className="col-sm-3">Username</dt>
                <dd className="col-sm-9">{user.userName}</dd>

                <dt className="col-sm-3">First name</dt>
                <dd className="col-sm-9">{user.firstName}</dd>

                <dt className="col-sm-3">Last name</dt>
                <dd className="col-sm-9">{user.lastName}</dd>
            </dl>

            <Button variant="outline-primary" className="me-2" onClick={onEditClick}>Edit Profile</Button>
            <Button variant="outline-secondary" onClick={onPasswordClick}>Change Password</Button>
        </div>
    );
}

export default ProfileInfo;