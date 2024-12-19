// src/components/Stars.js
import React from 'react';

export const FullStar = () => (
    <svg width="24" height="24" fill="#ffc107" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.201 4.665 24 6 15.595 0 9.748l8.332-1.73L12 .587z" />
    </svg>
);

export const HalfStar = () => (
    <svg width="24" height="24" fill="#ffc107" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.201V.587z" />
    </svg>
);

export const EmptyStar = () => (
    <svg width="24" height="24" fill="#ffc107" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.01 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
    </svg>
);
