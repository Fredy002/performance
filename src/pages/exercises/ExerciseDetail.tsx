import { Navigate, useParams } from 'react-router-dom';
import { FuelPlanExerciseView } from '@/components/exercises/FuelPlanExerciseView';
import { ClimbExerciseView } from '@/components/exercises/ClimbExerciseView';
import { TakeoffEprExerciseView } from '@/components/exercises/TakeoffEprExerciseView';
import { getExercise, getExerciseDisplay } from '@/exercises/registry';
import NotFound from '../NotFound';
import { exerciseToolHref } from './exerciseLinks';
import { useI18n } from '@/i18n';

function withExerciseDisplay<T extends NonNullable<ReturnType<typeof getExercise>>>(exercise: T, display: ReturnType<typeof getExerciseDisplay>) {
  return {
    ...exercise,
    title: display.title,
    summary: display.summary,
    statement: display.statement,
    questions: display.questions,
    assumptions: display.assumptions,
    remarks: display.remarks,
    expected: exercise.expected.map((step, index) => ({ ...step, label: display.expectedLabels[index] })),
  };
}

export default function ExerciseDetail() {
  const { locale } = useI18n();
  const { exerciseId = '' } = useParams();
  const exercise = getExercise(exerciseId);
  if (!exercise) return <NotFound />;
  const display = getExerciseDisplay(exercise, locale);
  // los ejercicios verificados viven en su herramienta: se redirige con los datos cargados
  if (exercise.status === 'verified') return <Navigate to={exerciseToolHref(exercise)} replace />;
  // la key reinicia el formulario al cambiar de ejercicio
  if (exercise.kind === 'fuel-plan') return <FuelPlanExerciseView key={exercise.id} exercise={withExerciseDisplay(exercise, display)} />;
  if (exercise.kind === 'takeoff-epr') return <TakeoffEprExerciseView key={exercise.id} exercise={withExerciseDisplay(exercise, display)} />;
  return <ClimbExerciseView key={exercise.id} exercise={withExerciseDisplay(exercise, display)} />;
}
