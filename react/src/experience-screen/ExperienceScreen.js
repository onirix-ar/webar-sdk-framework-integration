import React from 'react';
import { Experience } from './Experience.js'
import { LoadingScreen } from '../loading-screen/LoadingScreen';
import { ErrorScreen } from '../error-screen/ErrorScreen';
import { useTaskQueue } from '../use-task-queue.js';

export function ExperienceScreen() {
    const { enqueueTask } = useTaskQueue();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        let experience = null;
        let mounted = true;

        async function load() {
            try {
                const newExperience = new Experience();
                await newExperience.init();
                experience = newExperience;
            } catch (error) {
                if (mounted) {
                    setError(error);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        async function unload() {
            await experience.dispose();
        }

        // On strict mode, React runs effects twice on development mode. Due to
        // camera being a shared resource that only one process can use at a
        // time, we have to enforce these two effects to run sequentially.
        const cancel = enqueueTask(load, unload);

        return () => {
            mounted = false;
            cancel();
        };
    }, [enqueueTask]);

    if (loading) {
        return <LoadingScreen></LoadingScreen>
    }

    if (error) {
        return <ErrorScreen error={error}></ErrorScreen>
    }
}
