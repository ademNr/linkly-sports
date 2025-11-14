'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WorkoutSession } from '@/types';
import Navigation from '@/components/layout/Navigation';
import { Calendar, Clock, Dumbbell, Activity, Download, ArrowLeft, Image, X, Share2, Users } from 'lucide-react';

type TemplateType = 'transparent' | 'story' | 'fire' | 'minimal' | 'gradient';

export default function HistoryPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [currentPage, setCurrentPage] = useState('history');
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('transparent');
    const [generating, setGenerating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const { fetchWorkouts } = await import('@/lib/api');
                const data = await fetchWorkouts();
                setSessions(data);
            } catch (error) {
                console.error('Error loading workouts:', error);
            }
        };
        loadSessions();
    }, []);

    useEffect(() => {
        // Update currentPage based on pathname
        if (pathname === '/history') {
            setCurrentPage('history');
        }
    }, [pathname]);

    const handleNavigate = (page: string) => {
        if (page === 'home') router.push('/');
        else if (page === 'workout') router.push('/workout');
        else if (page === 'history') router.push('/history');
        else if (page === 'profile') router.push('/profile');
        else if (page === 'notifications') router.push('/notifications');
        else setCurrentPage(page);
    };

    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true;
        const sessionDate = new Date(session.date);
        const now = new Date();
        if (filter === 'today') {
            return sessionDate.toDateString() === now.toDateString();
        }
        if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
        }
        return true;
    });

    const isGroupWorkout = (session: WorkoutSession) => {
        return session.sharedWith && session.sharedWith.length > 0;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (minutes: number) => {
        if (!minutes || minutes === 0) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins}m`;
        }
    };

    const generateImage = (session: WorkoutSession, template: TemplateType) => {
        setGenerating(true);
        setTimeout(() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) {
                setGenerating(false);
                return;
            }

            canvas.width = 1080;
            canvas.height = 1920;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use selected template
            switch (template) {
                case 'transparent':
                    generateTransparentTemplate(ctx, session, canvas);
                    break;
                case 'story':
                    generateStoryTemplate(ctx, session, canvas);
                    break;
                case 'fire':
                    generateFireTemplate(ctx, session, canvas);
                    break;
                case 'minimal':
                    generateMinimalTemplate(ctx, session, canvas);
                    break;
                case 'gradient':
                    generateGradientTemplate(ctx, session, canvas);
                    break;
                default:
                    generateTransparentTemplate(ctx, session, canvas);
            }

            // Don't auto-download, let user choose
            setGenerating(false);
        }, 100);
    };

    // Generate unique signature based on workout name
    const getWorkoutSignature = (workoutName: string): string => {
        const name = workoutName.toLowerCase();
        const signatures: { [key: string]: string } = {
            'shoulder': '🔥',
            'chest': '💪',
            'back': '🏋️',
            'leg': '🦵',
            'arm': '💥',
            'push': '⬆️',
            'pull': '⬇️',
            'full': '🌟',
            'core': '🎯',
            'cardio': '🏃',
            'hiit': '⚡',
        };
        
        for (const [key, emoji] of Object.entries(signatures)) {
            if (name.includes(key)) {
                return emoji;
            }
        }
        return '🔥'; // Default signature
    };


    // Helper function to draw fire icon
    const drawFireIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        ctx.save();
        ctx.translate(x, y);
        
        // Fire shape
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size * 0.2, size * 0.1, -size * 0.3, -size * 0.1, 0, -size * 0.2);
        ctx.bezierCurveTo(size * 0.3, -size * 0.1, size * 0.2, size * 0.1, 0, size * 0.3);
        ctx.closePath();
        
        // Gradient for fire
        const gradient = ctx.createLinearGradient(0, -size * 0.2, 0, size * 0.3);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(0.5, '#F7931E');
        gradient.addColorStop(1, '#FFD23F');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.restore();
    };

    // Template 1: Transparent - Clean, transparent background with black text
    const generateTransparentTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        
        // Transparent background - no fill needed

        // Calculate content height for perfect centering
        const titleHeight = 120;
        const dateHeight = 38;
        const durationHeight = 38;
        const dividerHeight = 30;
        const exerciseItemHeight = 90;
        const exercisesHeight = session.exercises.length * exerciseItemHeight;
        const groupHeight = (session.sharedUsernames && session.sharedUsernames.length > 0) ? 50 : 0;
        const brandHeight = 55;
        const spacing = 60;
        
        const totalHeight = titleHeight + dateHeight + durationHeight + dividerHeight + exercisesHeight + groupHeight + brandHeight + (spacing * 5);
        let currentY = (canvas.height - totalHeight) / 2;

        // Workout Title - Large, bold, Roboto
        ctx.fillStyle = '#000000';
        ctx.font = '700 80px "Roboto", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += titleHeight + spacing;

        // Date - Roboto, clean
        ctx.fillStyle = '#000000';
        ctx.font = '400 32px "Roboto", "Arial", sans-serif';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += dateHeight + 12;

        // Duration - Roboto
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = '#000000';
            ctx.font = '400 32px "Roboto", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += durationHeight + spacing;
        } else {
            currentY += spacing;
        }

        // Subtle horizontal divider
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 350, currentY);
        ctx.lineTo(centerX + 350, currentY);
        ctx.stroke();
        currentY += dividerHeight + spacing;

        // Exercises List - Larger, clearer
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#000000';
            ctx.font = '500 42px "Roboto", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);
            currentY += 56;

            ctx.fillStyle = '#333333';
            ctx.font = '400 32px "Roboto", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY);
            currentY += exerciseItemHeight;
        });

        // Group session info
        if (session.sharedUsernames && session.sharedUsernames.length > 0) {
            currentY += spacing;
            const allUsernames = [session.ownerUsername || 'User', ...session.sharedUsernames];
            const groupText = session.sharedUsernames.length === 1 
                ? `Workout Partners: ${allUsernames.join(' & ')}`
                : `Group Session: ${allUsernames.join(', ')}`;
            
            ctx.fillStyle = '#666666';
            ctx.font = '400 26px "Roboto", "Arial", sans-serif';
            ctx.fillText(groupText, centerX, currentY);
            currentY += 50;
        }

        // Brand Signature
        currentY += spacing;
        ctx.fillStyle = '#000000';
        ctx.font = '700 36px "Roboto", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY);
    };

    // Template 2: Story - Beautiful gradient background for Instagram Stories
    const generateStoryTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        
        // Beautiful gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate content height
        const titleHeight = 130;
        const dateHeight = 40;
        const durationHeight = 40;
        const dividerHeight = 35;
        const exerciseItemHeight = 95;
        const exercisesHeight = session.exercises.length * exerciseItemHeight;
        const groupHeight = (session.sharedUsernames && session.sharedUsernames.length > 0) ? 55 : 0;
        const brandHeight = 60;
        const spacing = 65;
        
        const totalHeight = titleHeight + dateHeight + durationHeight + dividerHeight + exercisesHeight + groupHeight + brandHeight + (spacing * 5);
        let currentY = (canvas.height - totalHeight) / 2;

        // Workout Title - Large, bold, white
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 88px "Roboto", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += titleHeight + spacing;

        // Date - White, Roboto
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '400 34px "Roboto", "Arial", sans-serif';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += dateHeight + 14;

        // Duration - White
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '400 34px "Roboto", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += durationHeight + spacing;
        } else {
            currentY += spacing;
        }

        // Elegant divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 360, currentY);
        ctx.lineTo(centerX + 360, currentY);
        ctx.stroke();
        currentY += dividerHeight + spacing;

        // Exercises List - White, larger
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '500 44px "Roboto", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);
            currentY += 58;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '400 34px "Roboto", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY);
            currentY += exerciseItemHeight;
        });

        // Group session info
        if (session.sharedUsernames && session.sharedUsernames.length > 0) {
            currentY += spacing;
            const allUsernames = [session.ownerUsername || 'User', ...session.sharedUsernames];
            const groupText = session.sharedUsernames.length === 1 
                ? `Workout Partners: ${allUsernames.join(' & ')}`
                : `Group Session: ${allUsernames.join(', ')}`;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = '400 28px "Roboto", "Arial", sans-serif';
            ctx.fillText(groupText, centerX, currentY);
            currentY += 55;
        }

        // Brand Signature
        currentY += spacing;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 38px "Roboto", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY);
    };

    // Template 3: Fire - Inspiring with fire icon
    const generateFireTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        
        // Dark background with subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate content height
        const iconSize = 120;
        const titleHeight = 110;
        const dateHeight = 36;
        const durationHeight = 36;
        const dividerHeight = 32;
        const exerciseItemHeight = 88;
        const exercisesHeight = session.exercises.length * exerciseItemHeight;
        const groupHeight = (session.sharedUsernames && session.sharedUsernames.length > 0) ? 52 : 0;
        const brandHeight = 58;
        const spacing = 58;
        
        const totalHeight = iconSize + titleHeight + dateHeight + durationHeight + dividerHeight + exercisesHeight + groupHeight + brandHeight + (spacing * 6);
        let currentY = (canvas.height - totalHeight) / 2;

        // Fire icon at top
        drawFireIcon(ctx, centerX, currentY + iconSize / 2, iconSize);
        currentY += iconSize + spacing;

        // Workout Title - Large, bold, orange gradient
        const titleGradient = ctx.createLinearGradient(centerX - 200, currentY, centerX + 200, currentY);
        titleGradient.addColorStop(0, '#FF6B35');
        titleGradient.addColorStop(0.5, '#F7931E');
        titleGradient.addColorStop(1, '#FFD23F');
        ctx.fillStyle = titleGradient;
        ctx.font = '700 84px "Roboto", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += titleHeight + spacing;

        // Date - White
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '400 30px "Roboto", "Arial", sans-serif';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += dateHeight + 10;

        // Duration - White
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '400 30px "Roboto", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += durationHeight + spacing;
        } else {
            currentY += spacing;
        }

        // Divider with glow
        ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(centerX - 340, currentY);
        ctx.lineTo(centerX + 340, currentY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        currentY += dividerHeight + spacing;

        // Exercises List - White, larger
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '500 40px "Roboto", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);
            currentY += 54;

            ctx.fillStyle = '#FF6B35';
            ctx.font = '400 32px "Roboto", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY);
            currentY += exerciseItemHeight;
        });

        // Group session info
        if (session.sharedUsernames && session.sharedUsernames.length > 0) {
            currentY += spacing;
            const allUsernames = [session.ownerUsername || 'User', ...session.sharedUsernames];
            const groupText = session.sharedUsernames.length === 1 
                ? `Workout Partners: ${allUsernames.join(' & ')}`
                : `Group Session: ${allUsernames.join(', ')}`;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '400 24px "Roboto", "Arial", sans-serif';
            ctx.fillText(groupText, centerX, currentY);
            currentY += 52;
        }

        // Brand Signature - Orange gradient
        currentY += spacing;
        const brandGradient = ctx.createLinearGradient(centerX - 100, currentY, centerX + 100, currentY);
        brandGradient.addColorStop(0, '#FF6B35');
        brandGradient.addColorStop(1, '#FFD23F');
        ctx.fillStyle = brandGradient;
        ctx.font = '700 34px "Roboto", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY);
    };

    // Template 4: Minimal - Ultra clean and minimal
    const generateMinimalTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        
        // Transparent background

        // Calculate content height
        const titleHeight = 100;
        const dateHeight = 34;
        const durationHeight = 34;
        const dividerHeight = 28;
        const exerciseItemHeight = 82;
        const exercisesHeight = session.exercises.length * exerciseItemHeight;
        const groupHeight = (session.sharedUsernames && session.sharedUsernames.length > 0) ? 48 : 0;
        const brandHeight = 50;
        const spacing = 55;
        
        const totalHeight = titleHeight + dateHeight + durationHeight + dividerHeight + exercisesHeight + groupHeight + brandHeight + (spacing * 5);
        let currentY = (canvas.height - totalHeight) / 2;

        // Workout Title - Minimal, clean
        ctx.fillStyle = '#000000';
        ctx.font = '300 72px "Roboto", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += titleHeight + spacing;

        // Date - Minimal
        ctx.fillStyle = '#666666';
        ctx.font = '300 28px "Roboto", "Arial", sans-serif';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += dateHeight + 10;

        // Duration - Minimal
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = '#666666';
            ctx.font = '300 28px "Roboto", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += durationHeight + spacing;
        } else {
            currentY += spacing;
        }

        // Minimal divider
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 330, currentY);
        ctx.lineTo(centerX + 330, currentY);
        ctx.stroke();
        currentY += dividerHeight + spacing;

        // Exercises List - Minimal
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#000000';
            ctx.font = '300 38px "Roboto", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);
            currentY += 52;

            ctx.fillStyle = '#999999';
            ctx.font = '300 28px "Roboto", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY);
            currentY += exerciseItemHeight;
        });

        // Group session info
        if (session.sharedUsernames && session.sharedUsernames.length > 0) {
            currentY += spacing;
            const allUsernames = [session.ownerUsername || 'User', ...session.sharedUsernames];
            const groupText = session.sharedUsernames.length === 1 
                ? `Workout Partners: ${allUsernames.join(' & ')}`
                : `Group Session: ${allUsernames.join(', ')}`;
            
            ctx.fillStyle = '#888888';
            ctx.font = '300 22px "Roboto", "Arial", sans-serif';
            ctx.fillText(groupText, centerX, currentY);
            currentY += 48;
        }

        // Brand Signature - Minimal
        currentY += spacing;
        ctx.fillStyle = '#000000';
        ctx.font = '300 32px "Roboto", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY);
    };

    // Template 5: Gradient - Modern gradient design
    const generateGradientTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        
        // Modern gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGradient.addColorStop(0, '#0f0c29');
        bgGradient.addColorStop(0.5, '#302b63');
        bgGradient.addColorStop(1, '#24243e');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate content height
        const titleHeight = 125;
        const dateHeight = 38;
        const durationHeight = 38;
        const dividerHeight = 32;
        const exerciseItemHeight = 92;
        const exercisesHeight = session.exercises.length * exerciseItemHeight;
        const groupHeight = (session.sharedUsernames && session.sharedUsernames.length > 0) ? 52 : 0;
        const brandHeight = 58;
        const spacing = 62;
        
        const totalHeight = titleHeight + dateHeight + durationHeight + dividerHeight + exercisesHeight + groupHeight + brandHeight + (spacing * 5);
        let currentY = (canvas.height - totalHeight) / 2;

        // Workout Title - Gradient text
        const titleGradient = ctx.createLinearGradient(centerX - 250, currentY, centerX + 250, currentY);
        titleGradient.addColorStop(0, '#a8edea');
        titleGradient.addColorStop(1, '#fed6e3');
        ctx.fillStyle = titleGradient;
        ctx.font = '700 86px "Roboto", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += titleHeight + spacing;

        // Date - White
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '400 32px "Roboto", "Arial", sans-serif';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += dateHeight + 12;

        // Duration - White
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '400 32px "Roboto", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += durationHeight + spacing;
        } else {
            currentY += spacing;
        }

        // Elegant divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 350, currentY);
        ctx.lineTo(centerX + 350, currentY);
        ctx.stroke();
        currentY += dividerHeight + spacing;

        // Exercises List - White, larger
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '500 42px "Roboto", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);
            currentY += 56;

            ctx.fillStyle = '#a8edea';
            ctx.font = '400 32px "Roboto", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY);
            currentY += exerciseItemHeight;
        });

        // Group session info
        if (session.sharedUsernames && session.sharedUsernames.length > 0) {
            currentY += spacing;
            const allUsernames = [session.ownerUsername || 'User', ...session.sharedUsernames];
            const groupText = session.sharedUsernames.length === 1 
                ? `Workout Partners: ${allUsernames.join(' & ')}`
                : `Group Session: ${allUsernames.join(', ')}`;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '400 26px "Roboto", "Arial", sans-serif';
            ctx.fillText(groupText, centerX, currentY);
            currentY += 52;
        }

        // Brand Signature - Gradient
        currentY += spacing;
        const brandGradient = ctx.createLinearGradient(centerX - 100, currentY, centerX + 100, currentY);
        brandGradient.addColorStop(0, '#a8edea');
        brandGradient.addColorStop(1, '#fed6e3');
        ctx.fillStyle = brandGradient;
        ctx.font = '700 36px "Roboto", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY);
    };

    const downloadImage = (session: WorkoutSession, template: TemplateType) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `${session.name.replace(/\s+/g, '_')}_${template}_${formatDate(session.date).replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareImage = async (session: WorkoutSession, template: TemplateType) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], `${session.name}_${template}.png`, { type: 'image/png' });

                // Check if Web Share API is available
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: `My ${session.name} Workout - Linkly`,
                            text: `Track. Share. Inspire. 🔥 Check out my workout!`,
                            files: [file],
                        });
                    } catch (error: any) {
                        // User cancelled or error occurred, fallback to download
                        if (error.name !== 'AbortError') {
                            downloadImage(session, template);
                        }
                    }
                } else {
                    // Fallback to download if Web Share API not available
                    downloadImage(session, template);
                }
            }, 'image/png');
        } catch (error) {
            console.error('Error sharing image:', error);
            downloadImage(session, template);
        }
    };

    const handleDownload = () => {
        if (!selectedSession || !selectedTemplate) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Generate image first
        setTimeout(() => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 1080;
            canvas.height = 1920;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            switch (selectedTemplate) {
                case 'transparent':
                    generateTransparentTemplate(ctx, selectedSession, canvas);
                    break;
                case 'story':
                    generateStoryTemplate(ctx, selectedSession, canvas);
                    break;
                case 'fire':
                    generateFireTemplate(ctx, selectedSession, canvas);
                    break;
                case 'minimal':
                    generateMinimalTemplate(ctx, selectedSession, canvas);
                    break;
                case 'gradient':
                    generateGradientTemplate(ctx, selectedSession, canvas);
                    break;
            }

            downloadImage(selectedSession, selectedTemplate);
            setShowTemplates(false);
            setSelectedSession(null);
        }, 100);
    };

    const handleShare = async () => {
        if (!selectedSession || !selectedTemplate) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        setGenerating(true);
        
        // Generate image first
        setTimeout(() => {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setGenerating(false);
                return;
            }

            canvas.width = 1080;
            canvas.height = 1920;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            switch (selectedTemplate) {
                case 'transparent':
                    generateTransparentTemplate(ctx, selectedSession, canvas);
                    break;
                case 'story':
                    generateStoryTemplate(ctx, selectedSession, canvas);
                    break;
                case 'fire':
                    generateFireTemplate(ctx, selectedSession, canvas);
                    break;
                case 'minimal':
                    generateMinimalTemplate(ctx, selectedSession, canvas);
                    break;
                case 'gradient':
                    generateGradientTemplate(ctx, selectedSession, canvas);
                    break;
            }

            shareImage(selectedSession, selectedTemplate);
            setGenerating(false);
            setShowTemplates(false);
            setSelectedSession(null);
        }, 100);
    };

    // Helper function to generate preview for any template
    const generatePreview = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement, template: TemplateType) => {
        // Create a temporary full-size canvas to generate the template
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 1080;
        tempCanvas.height = 1920;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        // Generate the template on the full-size canvas
        switch (template) {
            case 'transparent':
                generateTransparentTemplate(tempCtx, session, tempCanvas);
                break;
            case 'story':
                generateStoryTemplate(tempCtx, session, tempCanvas);
                break;
            case 'fire':
                generateFireTemplate(tempCtx, session, tempCanvas);
                break;
            case 'minimal':
                generateMinimalTemplate(tempCtx, session, tempCanvas);
                break;
            case 'gradient':
                generateGradientTemplate(tempCtx, session, tempCanvas);
                break;
        }
        
        // Draw the scaled-down version to the preview canvas
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        if (selectedSession && showTemplates) {
            const templates: TemplateType[] = ['transparent', 'story', 'fire', 'minimal', 'gradient'];
            templates.forEach((template) => {
                setTimeout(() => {
                    const canvasId = `preview-${template}`;
                    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
                    if (canvas && selectedSession) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            // Smaller size for card preview
                            canvas.width = 360;
                            canvas.height = 640;
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            
                            // For preview, add a light background if transparent
                            if (template === 'transparent' || template === 'minimal') {
                                ctx.fillStyle = '#f5f5f5';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                            }
                            
                            generatePreview(ctx, selectedSession, canvas, template);
                        }
                    }
                }, 100);
            });
        }
    }, [selectedSession, showTemplates]);



    return (
        <div className="min-h-screen bg-white">
            <div className="pb-24 pt-8 px-6">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mr-3"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Workout History</h2>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex space-x-2 mb-6">
                        {(['all', 'today', 'week'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                                    filter === f
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'This Week'}
                            </button>
                        ))}
                    </div>

                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-12">
                            <Dumbbell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts yet</h3>
                            <p className="text-gray-500">Your completed workouts will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSessions.map((session) => {
                                const totalSets = session.exercises.reduce((sum, ex) => sum + ex.setsCompleted, 0);
                                const isGroup = isGroupWorkout(session);
                                const allParticipants = session.sharedUsernames 
                                    ? [session.ownerUsername || 'You', ...session.sharedUsernames]
                                    : [session.ownerUsername || 'You'];

                                return (
                                    <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                        {/* Group/Dual Session Badge */}
                                        {isGroup && (
                                            <div className="mb-4">
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Users className="h-4 w-4 text-gray-600" />
                                                        <span className="text-xs font-medium text-gray-600">
                                                            {session.sharedUsernames && session.sharedUsernames.length === 1 ? 'Dual Session' : 'Group Session'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {allParticipants.map((username, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center space-x-1 bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                                                            >
                                                                <span className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-[10px]">
                                                                    {username.charAt(0).toUpperCase()}
                                                                </span>
                                                                <span>{username}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{session.name}</h3>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(session.date)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{formatTime(session.date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setShowTemplates(true);
                                                }}
                                                className="p-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                                                aria-label="Download workout image"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="flex space-x-3 mb-3">
                                            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                                <Activity className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">{session.exercises.length} exercises</span>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                                <Dumbbell className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">{totalSets} sets</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {session.exercises.slice(0, 3).map((exercise, index) => (
                                                <span key={exercise.id || `exercise-${index}`} className="inline-block bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg">
                                                    {exercise.name} ({exercise.setsCompleted}s)
                                                </span>
                                            ))}
                                            {session.exercises.length > 3 && (
                                                <span className="inline-block bg-gray-50 border border-gray-200 text-gray-500 text-xs px-2.5 py-1 rounded-lg">
                                                    +{session.exercises.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Template Selection Overlay */}
                    {showTemplates && selectedSession && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 pb-24">
                            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                                {/* Header */}
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Choose Template</h2>
                                            <p className="text-sm text-gray-500 mt-1">Select a style for your workout</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowTemplates(false);
                                                setSelectedSession(null);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Template Cards Grid */}
                                <div className="p-6 pb-8">
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {(['transparent', 'story', 'fire', 'minimal', 'gradient'] as TemplateType[]).map((template) => {
                                            const templateNames: { [key in TemplateType]: string } = {
                                                transparent: 'Transparent',
                                                story: 'Story',
                                                fire: 'Fire',
                                                minimal: 'Minimal',
                                                gradient: 'Gradient',
                                            };
                                            
                                            return (
                                                <div
                                                    key={template}
                                                    onClick={() => setSelectedTemplate(template)}
                                                    className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                                                        selectedTemplate === template
                                                            ? 'ring-2 ring-gray-900 ring-offset-2 shadow-lg scale-[1.02]'
                                                            : 'border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                    }`}
                                                >
                                                    {/* Preview Canvas Container */}
                                                    <div className="bg-gradient-to-br from-gray-900 to-black p-2">
                                                        <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
                                                            <canvas
                                                                id={`preview-${template}`}
                                                                className="w-full h-full"
                                                                style={{ display: 'block' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Template Info Overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-white font-semibold text-xs mb-0.5 truncate">
                                                                    {templateNames[template]}
                                                                </div>
                                                            </div>
                                                            {selectedTemplate === template && (
                                                                <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                                                    <span className="text-white text-[10px] font-bold">✓</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Template Actions */}
                                    {selectedTemplate && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            {/* Social Media Info */}
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                                <div className="flex items-start space-x-3">
                                                    <div className="p-2 bg-white rounded-xl flex-shrink-0">
                                                        <Image className="h-5 w-5 text-gray-700" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                                            Perfect for Social Media
                                                        </h4>
                                                        <p className="text-gray-600 text-xs leading-relaxed">
                                                            Transparent background makes it easy to overlay on your photos and share to Instagram, Stories, or any platform
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={handleDownload}
                                                    disabled={generating}
                                                    className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 font-semibold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:cursor-not-allowed"
                                                >
                                                    <Download className="h-5 w-5" />
                                                    <span>{generating ? 'Generating...' : 'Download'}</span>
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    disabled={generating}
                                                    className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:cursor-not-allowed shadow-lg"
                                                >
                                                    <Share2 className="h-5 w-5" />
                                                    <span>{generating ? 'Generating...' : 'Share'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none', position: 'absolute', top: '-9999px', left: '-9999px' }} />
                </div>
            </div>

            <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
    );
}