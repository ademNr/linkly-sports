'use client';

import { useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { WorkoutSession } from '@/types';

interface ShareWorkoutProps {
    session: WorkoutSession;
}

export default function ShareWorkout({ session }: ShareWorkoutProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [generating, setGenerating] = useState(false);

    const generateImage = (download = false) => {
        setGenerating(true);

        setTimeout(() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) {
                setGenerating(false);
                return;
            }

            // Instagram story resolution
            canvas.width = 1080;
            canvas.height = 1920;

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#101010');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // White glow ring (subtle)
            const glowGradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                200,
                canvas.width / 2,
                canvas.height / 2,
                700
            );
            glowGradient.addColorStop(0, 'rgba(255, 102, 0, 0.08)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Text styling
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';

            // Workout name
            ctx.font = 'bold 80px Inter, Arial';
            ctx.fillText(session.name, canvas.width / 2, 650);

            // Workout type and date
            ctx.font = '500 48px Inter, Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.fillText(`${session.type} • ${new Date(session.date).toLocaleDateString()}`, canvas.width / 2, 730);

            // Duration
            ctx.font = 'bold 70px Inter, Arial';
            ctx.fillStyle = '#FF6600';
            ctx.fillText(`${session.duration} min`, canvas.width / 2, 830);

            // Divider
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 200, 900);
            ctx.lineTo(canvas.width / 2 + 200, 900);
            ctx.stroke();

            // Exercises header
            ctx.font = 'bold 58px Inter, Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('Exercises', canvas.width / 2, 990);

            // Exercises list
            const startY = 1060;
            let offsetY = 0;
            session.exercises.forEach((exercise, index) => {
                const text = `${exercise.name} — ${exercise.setsCompleted} sets`;
                ctx.font = '400 44px Inter, Arial';
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fillText(text, canvas.width / 2, startY + offsetY);
                offsetY += 70;
            });

            // Footer
            ctx.font = 'bold 54px Inter, Arial';
            ctx.fillStyle = '#FF6600';
            ctx.fillText('🔗 LINKLY', canvas.width / 2, canvas.height - 160);

            // Subtext
            ctx.font = '400 38px Inter, Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText('Track. Share. Improve.', canvas.width / 2, canvas.height - 90);

            // Export or share
            if (download) {
                downloadImage(canvas);
            } else {
                shareImage(canvas);
            }

            setGenerating(false);
        }, 100);
    };

    const downloadImage = (canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `Linkly_Workout_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareImage = (canvas: HTMLCanvasElement) => {
        canvas.toBlob((blob) => {
            if (blob) {
                if (navigator.share) {
                    const file = new File([blob], `Linkly_Workout.png`, { type: 'image/png' });
                    navigator
                        .share({
                            files: [file],
                            title: 'My Linkly Workout',
                            text: 'Just finished my workout on Linkly 💪 #Linkly',
                        })
                        .catch(() => downloadImage(canvas));
                } else {
                    downloadImage(canvas);
                }
            }
        }, 'image/png');
    };

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={() => generateImage(false)}
                    disabled={generating}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                    <Share2 className="h-4 w-4" />
                    <span>{generating ? 'Generating...' : 'Share'}</span>
                </button>

                <button
                    onClick={() => generateImage(true)}
                    disabled={generating}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                </button>
            </div>

            <canvas
                ref={canvasRef}
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                }}
            />
        </>
    );
}
