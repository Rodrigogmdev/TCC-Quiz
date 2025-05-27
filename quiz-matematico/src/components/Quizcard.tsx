interface QuizCardProps {
  pergunta: string;
  alternativas: string[];
  onResponder: (resposta: string) => void;
}

const QuizCard = ({ pergunta, alternativas, onResponder }: QuizCardProps) => {
  return (
    <div>
      <p><strong>{pergunta}</strong></p>
      <ul>
        {alternativas.map((alt, i) => (
          <li key={i}>
            <button className="button" onClick={() => onResponder(alt)}>
              {alt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizCard;
