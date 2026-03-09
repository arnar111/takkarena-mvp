import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { PROJECTS } from '../constants.ts';

interface Project {
    id: string;
    name: string;
}

/**
 * Hook to subscribe to Firestore projects collection.
 * Returns project names as a string array for easy drop-in replacement of PROJECTS constant.
 * Auto-seeds from constants.ts if Firestore collection is empty.
 */
export function useProjects() {
    const [projects, setProjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to projects collection
        const unsubscribe = onSnapshot(
            collection(db, 'projects'),
            async (snapshot) => {
                if (snapshot.empty) {
                    // Firestore is empty - seed from constants
                    console.log('🌱 Seeding projects from constants...');
                    try {
                        const existingDocs = await getDocs(collection(db, 'projects'));
                        if (existingDocs.empty) {
                            // Double-check to avoid race conditions
                            for (const name of PROJECTS) {
                                await addDoc(collection(db, 'projects'), { name });
                            }
                            console.log(`✅ Seeded ${PROJECTS.length} projects`);
                        }
                    } catch (err) {
                        console.error('Failed to seed projects:', err);
                        // Fallback to constants if seeding fails
                        setProjects([...PROJECTS]);
                    }
                } else {
                    // Use Firestore data
                    const projectNames = snapshot.docs
                        .map((doc) => (doc.data() as Project).name)
                        .filter(Boolean)
                        .sort((a, b) => a.localeCompare(b, 'is'));
                    setProjects(projectNames);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Projects subscription error:', error);
                // Fallback to constants on error
                setProjects([...PROJECTS]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { projects, loading };
}

export default useProjects;
