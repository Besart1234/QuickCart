import { useContext, useState } from "react";
import { Container } from "react-bootstrap";
import { AuthContext } from "../../contexts/AuthContext";
import ProfileInfo from "../../components/user/ProfileInfo";
import EditProfileForm from "../../components/user/EditProfileForm";
import { Navigate } from "react-router-dom";
import ChangePasswordForm from "../../components/user/ChangePasswrodForm";

function ProfilePage() {
    const { user, loading, fetchUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    if(loading) return null;
    if(!user) return <Navigate to='/login' replace/>

    return (
        <Container className="py-4">
            <h1 className="h3 mb-4">My Profile</h1>
            <hr />
            {!editing && !changingPassword && (
                <ProfileInfo 
                    user={user}
                    onEditClick={() => setEditing(true)}
                    onPasswordClick={() => setChangingPassword(true)}
                />
            )}

            {editing && (
                <EditProfileForm 
                    user={user}
                    fetchUser={fetchUser}
                    onCancel={() => setEditing(false)}
                />
            )}

            {changingPassword && (
                <ChangePasswordForm 
                    user={user}
                    onCancel={() => setChangingPassword(false)}
                />
            )}
        </Container>
    );
}

export default ProfilePage;