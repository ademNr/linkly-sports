'use client';

import { WorkoutSession } from '@/types';
import { Calendar, Clock, Dumbbell, Activity, Download, Image, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface WorkoutHistoryProps {
    sessions: WorkoutSession[];
    onSelectSession: (session: WorkoutSession) => void;
}


type TemplateType = 'bold' | 'modern';

export default function WorkoutHistory({ sessions, onSelectSession }: WorkoutHistoryProps) {
    const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('bold');
    const [generating, setGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
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

    const handleDownloadClick = (session: WorkoutSession) => {
        setSelectedSession(session);
        setShowTemplates(true);
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

            // Instagram story dimensions (9:16 aspect ratio)
            canvas.width = 1080;
            canvas.height = 1920;

            // Clear to transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use selected template
            if (template === 'bold') {
                generateBoldTemplate(ctx, session);
            } else {
                generateModernTemplate(ctx, session);
            }

            downloadImage(session, template);
            setGenerating(false);
            setShowTemplates(false);
            setSelectedSession(null);
        }, 100);
    };

    const generateBoldTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession) => {
        const canvas = canvasRef.current!;
        const centerX = canvas.width / 2;
        
        // Calculate vertical spacing for centered layout
        const exercisesHeight = session.exercises.length * 110;
        const durationHeight = formatDuration(session.duration) ? 50 : 0;
        const contentHeight = 180 + 100 + durationHeight + exercisesHeight + 100;
        const startY = (canvas.height - contentHeight) / 2;
        let currentY = startY;

        // Workout name - Bold with orange accent
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 64px "Inter", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += 100;

        // Date - Subtle, clean
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '400 32px "Inter", "Arial", sans-serif';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += 50;

        // Duration - Below date
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '400 28px "Inter", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += 50;
        } else {
            currentY += 50;
        }

        // Subtle divider - centered, minimal (narrower)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 200, currentY);
        ctx.lineTo(centerX + 200, currentY);
        ctx.stroke();

        currentY += 70;

        // Exercises list - Clean, centered layout
        ctx.textAlign = 'center';
        session.exercises.forEach((exercise, index) => {
            // Exercise name - clean, readable, centered
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '500 38px "Inter", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);

            // Sets count - below exercise name, subtle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '400 32px "Inter", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY + 50);

            currentY += 110; // Spacing between exercises
        });

        // Linkly branding - Orange theme, centered at bottom
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F97316'; // Orange-500
        ctx.font = '600 32px "Inter", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY + 60);
    };

    const generateModernTemplate = (ctx: CanvasRenderingContext2D, session: WorkoutSession) => {
        const canvas = canvasRef.current!;
        const centerX = canvas.width / 2;
        
        // Calculate vertical spacing for centered layout
        const exercisesHeight = session.exercises.length * 100;
        const durationHeight = formatDuration(session.duration) ? 50 : 30;
        const contentHeight = 200 + 100 + durationHeight + exercisesHeight + 120;
        const startY = (canvas.height - contentHeight) / 2;
        let currentY = startY;

        // Orange gradient accent line at top
        const gradient = ctx.createLinearGradient(centerX - 200, startY - 20, centerX + 200, startY - 20);
        gradient.addColorStop(0, '#F97316'); // Orange-500
        gradient.addColorStop(1, '#EA580C'); // Orange-600
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - 200, startY - 20, 400, 4);

        currentY += 40;

        // Workout name - Modern style with orange accent
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 56px "Inter", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name, centerX, currentY);
        currentY += 90;

        // Date with orange dot separator
        ctx.fillStyle = '#F97316'; // Orange-500
        ctx.font = '400 28px "Inter", "Arial", sans-serif';
        ctx.fillText('•', centerX - 60, currentY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        ctx.fillStyle = '#F97316';
        ctx.fillText('•', centerX + 60, currentY);
        currentY += 50;

        // Duration - Below date
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.font = '400 26px "Inter", "Arial", sans-serif';
            ctx.fillText(durationText, centerX, currentY);
            currentY += 50;
        } else {
            currentY += 30;
        }

        // Subtle divider
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)'; // Orange with opacity
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 180, currentY);
        ctx.lineTo(centerX + 180, currentY);
        ctx.stroke();
        currentY += 60;

        // Exercises list - Modern, clean layout
        ctx.textAlign = 'center';
        session.exercises.forEach((exercise, index) => {
            // Exercise name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '500 40px "Inter", "Arial", sans-serif';
            ctx.fillText(exercise.name, centerX, currentY);

            // Sets count - below with orange accent
            ctx.fillStyle = '#F97316'; // Orange-500
            ctx.font = '600 32px "Inter", "Arial", sans-serif';
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY + 55);

            currentY += 110;
        });

        // Linkly branding - Orange theme
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F97316'; // Orange-500
        ctx.font = '600 28px "Inter", "Arial", sans-serif';
        ctx.fillText('LINKLY', centerX, currentY + 50);
    };

    const downloadImage = (session: WorkoutSession, template: TemplateType) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `${session.name.replace(/\s+/g, '_')}_${template}_${formatDate(session.date).replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleDownload = () => {
        if (!selectedSession) return;
        generateImage(selectedSession, selectedTemplate);
    };

    useEffect(() => {
        if (selectedSession && showTemplates) {
            // Generate previews for both templates
            ['bold', 'modern'].forEach((template) => {
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
                            
                            if (template === 'bold') {
                                generateBoldTemplatePreview(ctx, selectedSession, canvas);
                            } else {
                                generateModernTemplatePreview(ctx, selectedSession, canvas);
                            }
                        }
                    }
                }, 100);
            });
        }
    }, [selectedSession, showTemplates]);

    const generateBoldTemplatePreview = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        const scale = canvas.width / 1080; // Scale factor
        
        const exercisesHeight = session.exercises.length * 110 * scale;
        const durationHeight = formatDuration(session.duration) ? 50 * scale : 0;
        const contentHeight = (180 + 100 + durationHeight + exercisesHeight + 100) * scale;
        const startY = (canvas.height - contentHeight) / 2;
        let currentY = startY;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${64 * scale}px "Inter", "Arial", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name.toUpperCase(), centerX, currentY);
        currentY += 100 * scale;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${32 * scale}px "Inter", "Arial", sans-serif`;
        ctx.fillText(formatDate(session.date), centerX, currentY);
        currentY += 50 * scale;

        // Duration - Below date
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = `${28 * scale}px "Inter", "Arial", sans-serif`;
            ctx.fillText(durationText, centerX, currentY);
            currentY += 50 * scale;
        } else {
            currentY += 50 * scale;
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX - 200 * scale, currentY);
        ctx.lineTo(centerX + 200 * scale, currentY);
        ctx.stroke();
        currentY += 70 * scale;

        ctx.textAlign = 'center';
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${38 * scale}px "Inter", "Arial", sans-serif`;
            ctx.fillText(exercise.name, centerX, currentY);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = `${32 * scale}px "Inter", "Arial", sans-serif`;
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY + 50 * scale);
            currentY += 110 * scale;
        });

        ctx.fillStyle = '#F97316';
        ctx.font = `${32 * scale}px "Inter", "Arial", sans-serif`;
        ctx.fillText('LINKLY', centerX, currentY + 60 * scale);
    };

    const generateModernTemplatePreview = (ctx: CanvasRenderingContext2D, session: WorkoutSession, canvas: HTMLCanvasElement) => {
        const centerX = canvas.width / 2;
        const scale = canvas.width / 1080;
        
        const exercisesHeight = session.exercises.length * 100 * scale;
        const durationHeight = formatDuration(session.duration) ? 50 * scale : 30 * scale;
        const contentHeight = (200 + 100 + durationHeight + exercisesHeight + 120) * scale;
        const startY = (canvas.height - contentHeight) / 2;
        let currentY = startY;

        const gradient = ctx.createLinearGradient(centerX - 200 * scale, startY - 20 * scale, centerX + 200 * scale, startY - 20 * scale);
        gradient.addColorStop(0, '#F97316');
        gradient.addColorStop(1, '#EA580C');
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - 200 * scale, startY - 20 * scale, 400 * scale, 4 * scale);

        currentY += 40 * scale;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${56 * scale}px "Inter", "Arial", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(session.name, centerX, currentY);
        currentY += 90 * scale;

        ctx.fillStyle = '#F97316';
        ctx.font = `${28 * scale}px "Inter", "Arial", sans-serif`;
        ctx.fillText('•', centerX - 60 * scale, currentY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText(formatDate(session.date), centerX, currentY);
        ctx.fillStyle = '#F97316';
        ctx.fillText('•', centerX + 60 * scale, currentY);
        currentY += 50 * scale;

        // Duration - Below date
        const durationText = formatDuration(session.duration);
        if (durationText) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.font = `${26 * scale}px "Inter", "Arial", sans-serif`;
            ctx.fillText(durationText, centerX, currentY);
            currentY += 50 * scale;
        } else {
            currentY += 30 * scale;
        }

        ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX - 180 * scale, currentY);
        ctx.lineTo(centerX + 180 * scale, currentY);
        ctx.stroke();
        currentY += 60 * scale;

        ctx.textAlign = 'center';
        session.exercises.forEach((exercise) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${40 * scale}px "Inter", "Arial", sans-serif`;
            ctx.fillText(exercise.name, centerX, currentY);
            ctx.fillStyle = '#F97316';
            ctx.font = `${32 * scale}px "Inter", "Arial", sans-serif`;
            ctx.fillText(`${exercise.setsCompleted} sets`, centerX, currentY + 55 * scale);
            currentY += 110 * scale;
        });

        ctx.fillStyle = '#F97316';
        ctx.font = `${28 * scale}px "Inter", "Arial", sans-serif`;
        ctx.fillText('LINKLY', centerX, currentY + 50 * scale);
    };


    if (sessions.length === 0) {
        return (
            <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts yet</h3>
                <p className="text-gray-500">Your completed workouts will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => {
                const totalExercises = session.exercises.length;
                const totalSets = session.exercises.reduce((sum, exercise) =>
                    sum + exercise.setsCompleted, 0
                );

                return (
                    <div
                        key={session.id}
                        className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
                    >
                        {/* Session Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {session.name}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1">
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
                                onClick={() => handleDownloadClick(session)}
                                className="flex-shrink-0 p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-2xl transition-colors ml-3"
                                aria-label="Download workout image"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Workout Stats */}
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-2xl">
                                <Activity className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">
                                    {totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-2xl">
                                <Dumbbell className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                    {totalSets} {totalSets === 1 ? 'set' : 'sets'}
                                </span>
                            </div>
                        </div>

                        {/* Exercise List Preview */}
                        <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                                {session.exercises.slice(0, 3).map((exercise, index) => (
                                    <span
                                        key={exercise.id}
                                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                    >
                                        {exercise.name} ({exercise.setsCompleted}s)
                                    </span>
                                ))}
                                {session.exercises.length > 3 && (
                                    <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                                        +{session.exercises.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Template Selection Overlay */}
            {showTemplates && selectedSession && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {(['bold', 'modern'] as TemplateType[]).map((template) => (
                                    <div
                                        key={template}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                                            selectedTemplate === template
                                                ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg scale-[1.02]'
                                                : 'border-2 border-gray-200 hover:border-orange-300 hover:shadow-md'
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
                                                        {template === 'bold' ? 'Bold' : 'Modern'}
                                                    </div>
                                                </div>
                                                {selectedTemplate === template && (
                                                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                                        <span className="text-white text-[10px] font-bold">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Selected Template Actions */}
                            {selectedTemplate && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {/* Social Media Info */}
                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-white rounded-xl">
                                                <Image className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-orange-900 text-sm mb-1">
                                                    Perfect for Social Media
                                                </h4>
                                                <p className="text-orange-700 text-xs">
                                                    Transparent background makes it easy to overlay on your photos and share to Instagram, Stories, or any platform
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Download Button */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={generating}
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:bg-orange-800 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        <Download className="h-5 w-5" />
                                        <span>{generating ? 'Generating...' : 'Download PNG'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden canvas for image generation */}
            <canvas
                ref={canvasRef}
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px'
                }}
            />
        </div>
    );
}