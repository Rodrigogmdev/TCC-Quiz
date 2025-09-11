interface FAQProps {
  onNavigateToHome: () => void;
}

const faqData = [
  {
    question: 'Qual é o objetivo deste projeto?',
    answer: 'Este projeto é um Trabalho de Conclusão de Curso (TCC) que tem como objetivo criar uma ferramenta educacional interativa para o ensino de Teoria dos Conjuntos. A ideia é demonstrar a aplicação de tecnologias web modernas em um contexto educacional.'
  },
  {
    question: 'Como funciona o quiz?',
    answer: 'Na tela inicial, você escolhe a quantidade de questões que deseja responder. Em seguida, o quiz apresenta perguntas sobre operações de conjuntos (união, intersecção, etc.). Você seleciona uma alternativa e o sistema informa se a sua resposta está correta antes de avançar para a próxima questão.'
  },
  {
    question: 'De onde vêm as questões do quiz?',
    answer: 'As questões foram geradas a partir de uma Inteligencia artifical, revisadas e resolvidas por humanos, garantindo a melhor experiência possível para nossos usuarios '
  },
  {
    question: 'Quais são os próximos passos para o projeto?',
    answer: 'Como planos futuros, pretende-se salvar o histórico de pontuação, adicionar mais tópicos de matemática e expandir a variedade de questões.'
  }
];

const FAQ = ({ onNavigateToHome }: FAQProps) => {
  return (
    <div className="faq-container">
      <h2>Perguntas Frequentes (FAQ)</h2>
      {faqData.map((item, index) => (
        <div key={index} className="faq-item">
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
      <div className="gerador-container">
        <button className="button" onClick={onNavigateToHome}>
          Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default FAQ;