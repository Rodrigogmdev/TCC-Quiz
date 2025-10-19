interface FeedbackProps {
  correta: boolean | null;
}

const Feedback = ({ correta }: FeedbackProps) => {
  if (correta === null) return null;
  return (
    <div style={{ marginTop: '1rem', color: correta ? 'green' : 'red' }}>
      {correta ? '✅ Resposta correta!' : '❌ Tente novamente!'}
    </div>
  );
};

export default Feedback;
