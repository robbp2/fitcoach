import { Composition } from 'remotion';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { ExerciseDemoReal } from './ExerciseDemoReal';
import { exercises } from '../app/lib/exercises';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {exercises.map((exercise) => (
        <Composition
          key={exercise.id}
          id={exercise.id}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          component={ExerciseDemoReal as any}
          durationInFrames={450} // 15 seconds at 30fps
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            exercise,
          }}
        />
      ))}
    </>
  );
};
