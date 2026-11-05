import { Navigate, useParams } from 'react-router-dom';
import { FuelPlanExerciseView } from '@/components/exercises/FuelPlanExerciseView';
import { ClimbExerciseView } from '@/components/exercises/ClimbExerciseView';
import { TakeoffEprExerciseView } from '@/components/exercises/TakeoffEprExerciseView';
import { getExercise } from '@/exercises/registry';
import NotFound from '../NotFound';
import { exerciseToolHref } from './exerciseLinks';

export default function ExerciseDetail() {
  const { exerciseId = '' } = useParams();
  const exercise = getExercise(exerciseId);
  if (!exercise) return <NotFound />;
  // los ejercicios verificados viven en su herramienta: se redirige con los datos cargados
  if (exercise.status === 'verified') return <Navigate to={exerciseToolHref(exercise)} replace />;
  // la key reinicia el formulario al cambiar de ejercicio
  if (exercise.kind === 'fuel-plan') return <FuelPlanExerciseView key={exercise.id} exercise={exercise} />;
  if (exercise.kind === 'takeoff-epr') return <TakeoffEprExerciseView key={exercise.id} exercise={exercise} />;
  return <ClimbExerciseView key={exercise.id} exercise={exercise} />;
}
