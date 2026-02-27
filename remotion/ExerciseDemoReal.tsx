import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { Exercise } from '../app/lib/exercises';

interface ExerciseDemoRealProps {
  exercise: Exercise;
}

export const ExerciseDemoReal: React.FC<ExerciseDemoRealProps> = ({ exercise }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Try to load GIF, fallback to static images
  const gifPath = `exercise-gifs/${exercise.id}.gif`;
  const useGif = true; // We'll always try to use the GIF
  
  // Rep timing
  const repDuration = 90; // 3 seconds per rep
  const currentRep = Math.floor(frame / repDuration) + 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* Exercise GIF */}
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
        <Img
          src={staticFile(gifPath)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'crisp-edges', // Keep GIF sharp
          }}
        />
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

      {/* Powered by ExRx.net credit */}
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
        Exercise demo from ExRx.net
      </div>
    </AbsoluteFill>
  );
};
