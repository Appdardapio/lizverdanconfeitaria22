import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the digital menu
    navigate('/cardapio');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
      <div className="text-center">
        <div className="text-6xl mb-4">🧁</div>
        <h1 className="text-4xl font-bold mb-4 text-primary">Liz Verdan Confeitaria</h1>
        <p className="text-xl text-muted-foreground">Redirecionando para o cardápio...</p>
      </div>
    </div>
  );
};

export default Index;
