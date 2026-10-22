import { useParams } from 'react-router-dom';
import { FuelPlanExerciseView } from '@/components/exercises/FuelPlanExerciseView';
import { getExercise } from '@/exercises/registry';
import NotFound from '../NotFound';

export default function ExerciseDetail() {
  const { exerciseId = '' } = useParams();
  const exercise = getExercise(exerciseId);
  if (!exercise) return <NotFound />;
  // la key reinicia el formulario al cambiar de ejercicio
  return <FuelPlanExerciseView key={exercise.id} exercise={exercise} />;
}
