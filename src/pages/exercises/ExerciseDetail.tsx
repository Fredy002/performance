import { Navigate, useParams } from 'react-router-dom';
import { FuelPlanExerciseView } from '@/components/exercises/FuelPlanExerciseView';
import { fuelFormQuery } from '@/components/fuel/fuelForm';
import { getExercise } from '@/exercises/registry';
import NotFound from '../NotFound';

export default function ExerciseDetail() {
  const { exerciseId = '' } = useParams();
  const exercise = getExercise(exerciseId);
  if (!exercise) return <NotFound />;
  // los ejercicios verificados viven en su herramienta: se redirige con los datos cargados
  if (exercise.status === 'verified') return <Navigate to={`/tools/fuel?${fuelFormQuery(exercise.input)}`} replace />;
  // la key reinicia el formulario al cambiar de ejercicio
  return <FuelPlanExerciseView key={exercise.id} exercise={exercise} />;
}
