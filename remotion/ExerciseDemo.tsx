import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Exercise } from '../app/lib/exercises';

interface ExerciseDemoProps {
  exercise: Exercise;
}

// Anatomically accurate human figure for bench press (side view)
const BenchPressHuman: React.FC<{
  barPosition: number; // 0 = at chest, 1 = fully extended
}> = ({ barPosition }) => {
  // Anatomical measurements (based on average adult male proportions)
  const scale = 2.5; // Overall scaling factor
  
  // Head
  const headRadius = 30 * scale;
  const headX = 500;
  const headY = 200;
  
  // Torso (lying horizontal)
  const shoulderX = 500;
  const shoulderY = 270;
  const hipX = 500;
  const hipY = 410;
  const torsoLength = hipY - shoulderY;
  
  // Bench positioning
  const benchY = 420;
  const benchHeight = 15;
  
  // Upper arm length and positioning
  const upperArmLength = 90 * scale;
  // Shoulder angle changes during press
  const shoulderAngle = interpolate(barPosition, [0, 1], [70, 0]); // Degrees from vertical
  
  // Elbow position
  const elbowX = shoulderX + Math.sin(shoulderAngle * Math.PI / 180) * upperArmLength;
  const elbowY = shoulderY + Math.cos(shoulderAngle * Math.PI / 180) * upperArmLength;
  
  // Forearm
  const forearmLength = 80 * scale;
  const forearmAngle = interpolate(barPosition, [0, 1], [80, 0]); // Relative to upper arm
  
  // Hand/barbell position
  const handX = elbowX + Math.sin((shoulderAngle + forearmAngle) * Math.PI / 180) * forearmLength;
  const handY = elbowY + Math.cos((shoulderAngle + forearmAngle) * Math.PI / 180) * forearmLength;
  
  // Upper leg (thigh) - bent, feet on ground
  const thighLength = 120 * scale;
  const kneeAngle = 100; // Degrees
  const kneeX = hipX + Math.sin(kneeAngle * Math.PI / 180) * thighLength;
  const kneeY = hipY + Math.cos(kneeAngle * Math.PI / 180) * thighLength;
  
  // Lower leg (calf)
  const calfLength = 110 * scale;
  const calfAngle = -85; // Relative to thigh
  const footX = kneeX + Math.sin((kneeAngle + calfAngle) * Math.PI / 180) * calfLength;
  const footY = kneeY + Math.cos((kneeAngle + calfAngle) * Math.PI / 180) * calfLength;
  
  // Muscle activation (more intense during press)
  const muscleActivation = interpolate(barPosition, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.5]);

  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute' }}>
      {/* Ground */}
      <rect x="0" y="740" width="1080" height="10" fill="#374151" />
      
      {/* Bench */}
      <g>
        {/* Main bench surface */}
        <rect x="320" y={benchY} width="360" height={benchHeight} fill="#4b5563" rx="8" />
        {/* Bench padding detail */}
        <rect x="320" y={benchY - 5} width="360" height="5" fill="#6b7280" rx="3" />
        
        {/* Left leg */}
        <rect x="350" y={benchY + benchHeight} width="25" height="305" fill="#374151" rx="5" />
        <rect x="340" y={benchY + benchHeight + 290} width="45" height="15" fill="#1f2937" rx="3" />
        
        {/* Right leg */}
        <rect x="605" y={benchY + benchHeight} width="25" height="305" fill="#374151" rx="5" />
        <rect x="595" y={benchY + benchHeight + 290} width="45" height="15" fill="#1f2937" rx="3" />
      </g>
      
      {/* Barbell */}
      <g>
        {/* Bar */}
        <rect 
          x={handX - 180} 
          y={handY - 4} 
          width="360" 
          height="8" 
          fill="#9ca3af" 
          rx="4"
        />
        {/* Knurling detail */}
        <rect 
          x={handX - 30} 
          y={handY - 4} 
          width="60" 
          height="8" 
          fill="#6b7280" 
          opacity="0.5"
        />
        
        {/* Left plate */}
        <g transform={`translate(${handX - 200}, ${handY})`}>
          <rect x="-20" y="-45" width="15" height="90" fill="#1f2937" rx="3" />
          <circle cx="-12.5" cy="0" r="25" fill="none" stroke="#374151" strokeWidth="2" />
        </g>
        
        {/* Right plate */}
        <g transform={`translate(${handX + 200}, ${handY})`}>
          <rect x="5" y="-45" width="15" height="90" fill="#1f2937" rx="3" />
          <circle cx="12.5" cy="0" r="25" fill="none" stroke="#374151" strokeWidth="2" />
        </g>
        
        {/* Collars */}
        <rect x={handX - 185} y={handY - 8} width="10" height="16" fill="#ef4444" rx="2" />
        <rect x={handX + 175} y={handY - 8} width="10" height="16" fill="#ef4444" rx="2" />
      </g>

      {/* Human Figure */}
      <g>
        {/* Head */}
        <circle 
          cx={headX} 
          cy={headY} 
          r={headRadius} 
          fill="#fcd34d"
          stroke="#fbbf24"
          strokeWidth="3"
        />
        {/* Face detail */}
        <circle cx={headX - 10} cy={headY - 5} r="4" fill="#1f2937" />
        <circle cx={headX + 10} cy={headY - 5} r="4" fill="#1f2937" />
        
        {/* Neck */}
        <path
          d={`M ${headX - 15} ${headY + 25} Q ${headX} ${headY + 35} ${shoulderX - 30} ${shoulderY - 10}`}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="2"
        />
        <path
          d={`M ${headX + 15} ${headY + 25} Q ${headX} ${headY + 35} ${shoulderX + 30} ${shoulderY - 10}`}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="2"
        />
        
        {/* Torso (chest and abs) */}
        <g>
          {/* Chest - pectoral muscles */}
          <ellipse
            cx={shoulderX}
            cy={shoulderY + 30}
            rx="65"
            ry="45"
            fill={`rgba(239, 68, 68, ${0.3 + muscleActivation * 0.5})`}
            stroke="#dc2626"
            strokeWidth="2"
          />
          {/* Chest definition */}
          <line 
            x1={shoulderX} 
            y1={shoulderY} 
            x2={shoulderX} 
            y2={shoulderY + 60} 
            stroke="#b91c1c" 
            strokeWidth="2"
          />
          
          {/* Abs */}
          <rect
            x={shoulderX - 30}
            y={shoulderY + 65}
            width="60"
            height="75"
            fill="#94a3b8"
            stroke="#64748b"
            strokeWidth="2"
            rx="5"
          />
          {/* Ab segments */}
          <line x1={shoulderX - 30} y1={shoulderY + 90} x2={shoulderX + 30} y2={shoulderY + 90} stroke="#475569" strokeWidth="2" />
          <line x1={shoulderX - 30} y1={shoulderY + 115} x2={shoulderX + 30} y2={shoulderY + 115} stroke="#475569" strokeWidth="2" />
          <line x1={shoulderX} y1={shoulderY + 65} x2={shoulderX} y2={shoulderY + 140} stroke="#475569" strokeWidth="2" />
        </g>
        
        {/* Pelvis/Hips */}
        <ellipse
          cx={hipX}
          cy={hipY}
          rx="45"
          ry="30"
          fill="#94a3b8"
          stroke="#64748b"
          strokeWidth="2"
        />
        
        {/* Shoulder joint */}
        <circle
          cx={shoulderX}
          cy={shoulderY}
          r="25"
          fill={`rgba(249, 115, 22, ${0.4 + muscleActivation * 0.4})`}
          stroke="#ea580c"
          strokeWidth="2"
        />
        
        {/* Upper arm */}
        <g>
          {/* Triceps (back of arm) - highly activated in bench press */}
          <line
            x1={shoulderX}
            y1={shoulderY}
            x2={elbowX}
            y2={elbowY}
            stroke={`rgb(239, 68, 68)`}
            strokeWidth={35}
            strokeLinecap="round"
            opacity={0.4 + muscleActivation * 0.5}
          />
          {/* Biceps (front of arm) - less activated */}
          <line
            x1={shoulderX}
            y1={shoulderY}
            x2={elbowX}
            y2={elbowY}
            stroke="#60a5fa"
            strokeWidth={25}
            strokeLinecap="round"
            opacity={0.3}
          />
          {/* Bone/structure */}
          <line
            x1={shoulderX}
            y1={shoulderY}
            x2={elbowX}
            y2={elbowY}
            stroke="#e5e7eb"
            strokeWidth={15}
            strokeLinecap="round"
          />
        </g>
        
        {/* Elbow joint */}
        <circle
          cx={elbowX}
          cy={elbowY}
          r="18"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        
        {/* Forearm */}
        <g>
          <line
            x1={elbowX}
            y1={elbowY}
            x2={handX}
            y2={handY}
            stroke="#94a3b8"
            strokeWidth={30}
            strokeLinecap="round"
          />
          <line
            x1={elbowX}
            y1={elbowY}
            x2={handX}
            y2={handY}
            stroke="#e5e7eb"
            strokeWidth={18}
            strokeLinecap="round"
          />
        </g>
        
        {/* Hand gripping bar */}
        <ellipse
          cx={handX}
          cy={handY}
          rx="22"
          ry="30"
          fill="#fcd34d"
          stroke="#fbbf24"
          strokeWidth="2"
        />
        
        {/* Thigh (quad muscles) */}
        <g>
          <line
            x1={hipX}
            y1={hipY}
            x2={kneeX}
            y2={kneeY}
            stroke="#60a5fa"
            strokeWidth={50}
            strokeLinecap="round"
            opacity={0.5}
          />
          <line
            x1={hipX}
            y1={hipY}
            x2={kneeX}
            y2={kneeY}
            stroke="#e5e7eb"
            strokeWidth={35}
            strokeLinecap="round"
          />
        </g>
        
        {/* Knee joint */}
        <circle
          cx={kneeX}
          cy={kneeY}
          r="22"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        
        {/* Calf */}
        <g>
          <line
            x1={kneeX}
            y1={kneeY}
            x2={footX}
            y2={footY}
            stroke="#94a3b8"
            strokeWidth={40}
            strokeLinecap="round"
          />
          <line
            x1={kneeX}
            y1={kneeY}
            x2={footX}
            y2={footY}
            stroke="#e5e7eb"
            strokeWidth={28}
            strokeLinecap="round"
          />
        </g>
        
        {/* Foot */}
        <ellipse
          cx={footX + 25}
          cy={footY}
          rx="45"
          ry="22"
          fill="#fcd34d"
          stroke="#fbbf24"
          strokeWidth="2"
        />
      </g>
      
      {/* Force arrows during press */}
      {barPosition > 0.3 && barPosition < 0.9 && (
        <g opacity={muscleActivation}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
            </marker>
          </defs>
          <line
            x1={handX}
            y1={handY + 50}
            x2={handX}
            y2={handY - 80}
            stroke="#22c55e"
            strokeWidth="4"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={handX + 15}
            y={handY - 40}
            fill="#22c55e"
            fontSize="24"
            fontWeight="bold"
          >
            PRESS
          </text>
        </g>
      )}
    </svg>
  );
};

export const ExerciseDemo: React.FC<ExerciseDemoProps> = ({ exercise }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation phases
  const titlePhase = 60; // 2 seconds
  const musclePhase = 120; // 4 seconds
  const demonstrationStart = 150; // 5 seconds
  const demonstrationEnd = 390; // 13 seconds
  const cuesPhase = 390; // 13 seconds

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleScale = interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: 'clamp' });

  // Muscle groups animation
  const muscleOpacity = interpolate(frame, [titlePhase, titlePhase + 30], [0, 1], { extrapolateRight: 'clamp' });

  // Movement cycle (3 second rep: 1.5s down, 1.5s up)
  const repDuration = 90; // frames per rep
  const cycleFrame = (frame - demonstrationStart) % repDuration;
  const barPosition = cycleFrame < 45 
    ? interpolate(cycleFrame, [0, 45], [1, 0]) // Lowering (eccentric)
    : interpolate(cycleFrame, [45, 90], [0, 1]); // Pressing (concentric)

  const repNumber = Math.floor((frame - demonstrationStart) / repDuration) + 1;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {/* Title Section */}
      {frame < musclePhase && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${titleScale})`,
            opacity: titleOpacity,
            textAlign: 'center',
            width: '80%',
          }}
        >
          <h1
            style={{
              fontSize: 96,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 30,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {exercise.name}
          </h1>
          <div
            style={{
              fontSize: 48,
              color: '#94a3b8',
              textTransform: 'capitalize',
            }}
          >
            {exercise.difficulty} • {exercise.movementPattern}
          </div>
        </div>
      )}

      {/* Muscle Groups Section */}
      {frame >= titlePhase && frame < demonstrationStart && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: muscleOpacity,
            textAlign: 'center',
            width: '80%',
          }}
        >
          <div style={{ fontSize: 52, color: '#94a3b8', marginBottom: 40 }}>
            Primary Muscles
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#ef4444',
              marginBottom: 60,
              textTransform: 'capitalize',
            }}
          >
            {exercise.primaryMuscles.join(', ')}
          </div>
          {exercise.secondaryMuscles.length > 0 && (
            <>
              <div style={{ fontSize: 40, color: '#94a3b8', marginBottom: 30 }}>
                Secondary Muscles
              </div>
              <div
                style={{
                  fontSize: 56,
                  color: '#f97316',
                  textTransform: 'capitalize',
                }}
              >
                {exercise.secondaryMuscles.join(', ')}
              </div>
            </>
          )}
        </div>
      )}

      {/* Movement Demonstration */}
      {frame >= demonstrationStart && frame < cuesPhase && (
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {/* Exercise name header */}
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {exercise.name}
          </div>

          {/* Rep counter */}
          <div
            style={{
              position: 'absolute',
              top: 140,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 42,
              color: '#3b82f6',
            }}
          >
            Rep {repNumber}
          </div>

          {/* Human figure */}
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <BenchPressHuman barPosition={barPosition} />
          </div>

          {/* Movement phase indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 400,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 52,
              fontWeight: 'bold',
              color: barPosition > 0.5 ? '#22c55e' : '#eab308',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {barPosition > 0.5 ? '⬆ CONCENTRIC (Press Up)' : '⬇ ECCENTRIC (Lower Down)'}
          </div>
        </div>
      )}

      {/* Form Cues Section */}
      {frame >= cuesPhase && (
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: 0,
            right: 0,
            padding: '0 100px',
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 80,
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Key Form Cues
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {exercise.formCues.map((cue, index) => {
              const cueOpacity = interpolate(
                frame,
                [cuesPhase + index * 15, cuesPhase + index * 15 + 15],
                [0, 1],
                { extrapolateRight: 'clamp' }
              );
              
              return (
                <div
                  key={index}
                  style={{
                    opacity: cueOpacity,
                    fontSize: 48,
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 40,
                    padding: '20px 30px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '16px',
                    borderLeft: '6px solid #3b82f6',
                  }}
                >
                  <span
                    style={{
                      fontSize: 64,
                      color: '#3b82f6',
                      fontWeight: 'bold',
                      minWidth: 80,
                    }}
                  >
                    {index + 1}.
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.6 }}>{cue}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
