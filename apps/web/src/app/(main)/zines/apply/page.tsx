import ApplyZineForm from './apply-zine-form';

export default function ApplyZinePage() {
  return <ApplyZineForm pageGenerationEnabled={process.env.READER_BETA_ENABLED === 'true'} />;
}
