import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
    rating = 0,
    maxStars = 5,
    size = 'md',
    interactive = false,
    onChange,
    className = '',
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    };

    const starSize = sizes[size] || sizes.md;

    const handleClick = (value) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`inline-flex items-center gap-0.5 ${className}`}>
            {Array.from({ length: maxStars }, (_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= displayRating;
                const isHalf = !isFilled && starValue - 0.5 <= displayRating;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => interactive && setHoverRating(starValue)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-150' : 'cursor-default'} focus:outline-none disabled:cursor-default`}
                    >
                        <Star
                            className={`${starSize} transition-colors duration-150 ${
                                isFilled
                                    ? 'fill-primary-400 text-primary-400'
                                    : isHalf
                                        ? 'fill-primary-400/50 text-primary-400'
                                        : 'fill-transparent text-white/20'
                            } ${interactive && hoverRating >= starValue ? 'fill-primary-300 text-primary-300' : ''}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
