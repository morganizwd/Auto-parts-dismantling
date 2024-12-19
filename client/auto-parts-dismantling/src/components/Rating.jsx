// src/components/Rating.jsx
import React from 'react';
import { FullStar, HalfStar, EmptyStar } from './Stars';

const Rating = ({ rating, reviewsCount }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
        stars.push(<FullStar key={`full-${i}`} />);
    }
    if (hasHalfStar) {
        stars.push(<HalfStar key="half" />);
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<EmptyStar key={`empty-${i}`} />);
    }

    return (
        <div>
            {stars}
            {reviewsCount !== undefined && <span className="ms-2">({reviewsCount})</span>}
        </div>
    );
};

export default Rating;
