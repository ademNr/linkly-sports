'use client';

interface LogoProps {
    size?: number;
    color?: string;
}

export default function Logo({ size = 24, color = '#FFFFFF' }: LogoProps) {
    // Normalize coordinates to start from 0,0
    const centerX = size / 2;
    const centerY = size / 2;
    const lineWidth = size * 0.15;
    const circleRadius = size * 0.12;
    
    // Calculate positions relative to center
    const leftX = centerX - size * 0.3;
    const rightX = centerX + size * 0.3;
    const topY = centerY - size * 0.45;
    const bottomY = centerY + size * 0.35;
    const linkY = centerY - size * 0.2;
    const accentX = centerX - size * 0.15;
    const accentY = centerY + size * 0.2;
    
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="inline-block"
        >
            {/* Vertical line of L */}
            <line
                x1={leftX}
                y1={topY}
                x2={leftX}
                y2={bottomY}
                stroke={color}
                strokeWidth={lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* Horizontal line of L */}
            <line
                x1={leftX}
                y1={bottomY}
                x2={rightX}
                y2={bottomY}
                stroke={color}
                strokeWidth={lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* Left connection circle (top of L) */}
            <circle
                cx={leftX}
                cy={topY}
                r={circleRadius}
                fill={color}
            />
            
            {/* Right connection circle */}
            <circle
                cx={rightX}
                cy={linkY}
                r={circleRadius}
                fill={color}
            />
            
            {/* Connection line between circles */}
            <line
                x1={leftX + circleRadius * 0.7}
                y1={topY}
                x2={rightX - circleRadius * 0.7}
                y2={linkY}
                stroke={color}
                strokeWidth={lineWidth * 0.6}
                strokeLinecap="round"
            />
            
            {/* Small accent dot at the corner */}
            <circle
                cx={accentX}
                cy={accentY}
                r={circleRadius * 0.4}
                fill={color}
            />
        </svg>
    );
}

