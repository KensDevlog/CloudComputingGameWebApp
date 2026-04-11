import { useState, useEffect } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function NavTab({ user, view, setView }) {
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
        <div className="tabBar">
            <button className={view === "game" ? "tab.active" : "tab"} onClick={() => setView("game")}>
                <label>Game</label>
            </button>
            <button className={view === "account" ? "tab.active" : "tab"} onClick={() => setView("account")}>
                <label>My Account</label>
            </button>
            {userData?.role === "admin" && (
                <button className={view === "admin" ? "tab.active" : "tab"} onClick={() => setView("admin")}>
                    <label>Admin</label>
                </button>
            )}
        </div>
    );
}