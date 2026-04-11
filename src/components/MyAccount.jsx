import { useState, useEffect } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { signOut } from "firebase/auth";


export default function MyAccount({ user }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.data());
            }
        });

        return () => unsubscribe();
    }, [user.uid]);


    return (
        <div className="leader-info">
            <label className="user-name">Username: {userData?.displayName || "Player"}</label>
            <label className="leader-score">High Score: {userData?.highScore || "0"}</label>
            <label className="leader-games">Games Played: {userData?.gamesPlayed || "0"}</label>
            <label className="">Role: {userData?.role || "user"}</label>
        </div>
    )
}