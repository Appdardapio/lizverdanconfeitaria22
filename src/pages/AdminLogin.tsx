import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useBakery } from '@/contexts/BakeryContext';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const { setLogado } = useBakery();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usuario === '1' && senha === 'Brasil*123') {
      setLogado(true);
      toast({
        title: "Login realizado!",
        description: "Bem-vinda ao painel administrativo.",
      });
      navigate('/painel');
    } else {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Usuário ou senha incorretos!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-2xl text-primary-foreground">🧁</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Liz Verdan Confeitaria
          </CardTitle>
          <p className="text-muted-foreground">Acesso Restrito</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite o usuário"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;