import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { AuthContext } from "../../contexts/AuthContext";
import ProfileInfo from "../../components/user/ProfileInfo";
import EditProfileForm from "../../components/user/EditProfileForm";
import { Navigate, useLocation } from "react-router-dom";
import ChangePasswordForm from "../../components/user/ChangePasswordForm";
import AddressList from "../../components/user/AddressList";
import OrderHistory from "../../components/user/OrderHistory";

function ProfilePage() {
    const { user, loading, fetchUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    // const location = useLocation();

    // useEffect(() => {
    //     if(location.hash) {
    //         const element = document.querySelector(location.hash);
    //         if(element) element.scrollIntoView({ behavior: 'smooth', block: 'start'  })
    //     }
    // }, [location]);

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

            <hr />

            <AddressList user={user} />

            <hr />

            <OrderHistory user={user} />
        </Container>
    );
}

export default ProfilePage;