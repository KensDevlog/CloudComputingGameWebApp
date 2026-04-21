import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import PLOT_PY from './plot.py?raw';

let pyodideReady = null;
function getPyodide() {
    if (!pyodideReady) {
        pyodideReady = (async () => {
            const pyodide = await globalThis.loadPyodide();
            await pyodide.loadPackage(['matplotlib']);
            return pyodide;
        })();
    }
    return pyodideReady;
}

export default function SimpleDashboard() {
    const [status, setStatus] = useState('Idle');
    const pyodideRef = useRef(null);

    useEffect(() => {
        let unsub = null;

        const init = async () => {
            setStatus('Loading Pyodide...');
            pyodideRef.current = await getPyodide();
            setStatus('Waiting for data...');

            unsub = onSnapshot(collection(db, 'scores'), async (snapshot) => {
                const plotData = snapshot.docs.map(doc => {
                    const d = doc.data();
                    return { name: d.displayName || d.userId, score: d.score };
                });

                const grouped = {};
                plotData.forEach(entry => {
                    if (!grouped[entry.name] || entry.score > grouped[entry.name]) {
                        grouped[entry.name] = entry.score;
                    }
                });

                try {
                    setStatus('Updating chart...');
                    const aggregated = Object.entries(grouped).map(([name, score]) => ({ name, score }));
                    window.__pyodideData = JSON.stringify(aggregated);
                    await pyodideRef.current.runPythonAsync(PLOT_PY);
                    setStatus(`Live ${aggregated.length} users`);
                } catch (err) {
                    console.error('Pyodide error:', err);
                    setStatus('Error, check console');
                }
            });
        };

        init();

        return () => { if (unsub) unsub(); };
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Dashboard</h2>
            <p>{status}</p>
            <div id="pyodide-target" style={{ border: '1px solid #ccc' }}></div>
        </div>
    );
}