import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { Exercise } from '../app/lib/exercises';
import fs from 'fs';
import path from 'path';

interface ExerciseDemoProps {
  exercise: Exercise;
}

export const ExerciseDemoUnified: React.FC<ExerciseDemoProps> = ({ exercise }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Check if GIF exists in public folder
  const gifPath = path.join(process.cwd(), 'public', 'exercise-gifs', `${exercise.id}.gif`);
  const hasGif = fs.existsSync(gifPath);
  
  // Fallback to wger.de images
  const fallbackImage0 = `exercise-images/${exercise.id}/0.png`;
  const fallbackImage1 = `exercise-images/${exercise.id}/1.png`;
  
  // Rep timing
  const repDuration = 90; // 3 seconds per rep at 30fps
  const repProgress = (frame % repDuration) / repDuration;
  const currentRep = Math.floor(frame / repDuration) + 1;
  
  // Crossfade opacity for fallback images
  const opacity1 = interpolate(
    repProgress,
    [0, 0.4, 0.6, 1],
    [0, 1, 1, 0]
  );
  
  const opacity0 = 1 - opacity1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* Exercise visual */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          maxWidth: '800px',
          height: '70%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
        }}
      >
        {hasGif ? (
          // Show ExRx.net GIF
          <Img
            src={staticFile(`exercise-gifs/${exercise.id}.gif`)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'crisp-edges',
            }}
          />
        ) : (
          // Fallback to wger.de images with crossfade
          <>
            <Img
              src={staticFile(fallbackImage0)}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: opacity0,
              }}
            />
            <Img
              src={staticFile(fallbackImage1)}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: opacity1,
              }}
            />
          </>
        )}
      </div>

      {/* Exercise name header */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '16px 40px',
          borderRadius: '12px',
          border: '2px solid #e5e7eb',
        }}
      >
        {exercise.name}
      </div>

      {/* Rep counter */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 60,
          fontSize: 36,
          color: '#1f2937',
          fontWeight: 'bold',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 24px',
          borderRadius: '8px',
          border: '2px solid #e5e7eb',
        }}
      >
        Rep {currentRep}
      </div>

      {/* Credit - show source based on what's displayed */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 20,
          color: '#6b7280',
          textAlign: 'center',
        }}
      >
        {hasGif ? 'Exercise demo from ExRx.net' : 'Exercise positions from wger.de'}
      </div>
    </AbsoluteFill>
  );
};
