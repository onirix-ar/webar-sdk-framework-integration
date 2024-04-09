import React from 'react';

export function useTaskQueue() {
    const running = React.useRef(false);
    const queue = React.useRef([]);

    const run = React.useCallback(async () => {
        if (running.current) {
            return;
        }
        running.current = true;
        while (queue.current.length > 0) {
            const task = queue.current.shift();
            await task();
        }
        running.current = false;
    }, []);

    const enqueue = React.useCallback((task, cancellationTask) => {
        const wrappedTask = () => task();
        queue.current.push(wrappedTask);
        void run();
        return () => {
            const index = queue.current.indexOf(wrappedTask);
            if (index === -1) {
                if (!cancellationTask) {
                    return;
                }
                queue.current.unshift(cancellationTask);
                void run();
            } else {
                queue.current.splice(index, 1);
            }
        }
    }, [run]);

    return { enqueueTask: enqueue };
}
