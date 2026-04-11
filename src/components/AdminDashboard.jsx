import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, orderBy, } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard({ user }) {
    const [userData, setUserData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.data());
            }
        });

        return () => unsubscribe();
    }, [user.uid]);


    useEffect(() => {
        const q = query(collection(db, "users"), orderBy('highScore', "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id, ...doc.data(),
            }));

            setUsers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="leaderboard-card">
                <h2 className="card-title">Leaderboard</h2>
                <div className="card-loading">
                    <div className="spinner" />
                </div>
            </div>
        )
    }


    return (
        <div className="leaderboard-card">
            <div className="card-header">
                <h2 className="card-title">Leaderboard</h2>
            </div>

            {users.length === 0 ? (
                <p>No scores yet :).</p>
            ) : (
                <div className="leaderboard-list">
                        {users.map((player, index) => {
                            const isCurrentUser = player.id === user.uid;
                        const rankClass =
                            index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "";

                        return (
                            <div key={player.id} className={`leaderboard-row ${isCurrentUser ? "is-you" : ""}`}>
                                <span className={`rank ${rankClass}`}>
                                    {index + 1}
                                </span>
                                <div className="leader-info">
                                    <span className="leader-name">
                                        {player.displayName || "Anonymous"}
                                        {isCurrentUser && <span className="you-tag">YOU</span>}
                                    </span>

                                </div>

                                <div className="leader-stats">
                                    <span className="leader-score">{player.highScore ?? 0}</span>
                                    <span className="leader-games">{player.gamesPlayed ?? 0}</span>
                                    <span className="leader-games">{player.email ?? "email"}</span>
                                    <span className="leader-games">{player.createdAt ? player.createdAt.toDate().toLocaleDateString() : "unknown join date"}</span>
                                </div>

                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}