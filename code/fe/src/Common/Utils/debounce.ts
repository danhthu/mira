export function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        // Clear the previous timer
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Set a new timer
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
