import { Button } from "@mui/material";
import { UserInfo } from "firebase/auth";
import { useAppContext } from "../contexts/appContext";
import { googleSignIn, useAuth } from "../services/core/firebase";

const Header = () => {

    const [user] = useAuth();
    const { midi } = useAppContext();

    return <header className="flex flex-row pt-3 pl-5 pr-3  items-center justify-between">
        <div className="w-1/2 text-center text-xl">{midi ? `${midi.inputName} / ${midi.manufacturer}` : "No midi device found"}</div>
        {user ? <UserSignedIn user={user} /> : <NotLoggedIn />}
    </header>;
};

const UserSignedIn = (props: { user: UserInfo}) => <div className="m-2 w-[3.5em]">
    <img className="rounded-full" src={props.user.photoURL!} alt="user-profile-picture"/>
</div>;

const NotLoggedIn = () => <Button variant="outlined" onClick={async () => await googleSignIn()}>Se connecter</Button>;


export default Header;