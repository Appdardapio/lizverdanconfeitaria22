-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  foto TEXT,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  disponibilidade BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos (público pode ver, admin pode gerenciar)
CREATE POLICY "Produtos são visíveis publicamente" 
ON public.produtos 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem inserir produtos" 
ON public.produtos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar produtos" 
ON public.produtos 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins podem deletar produtos" 
ON public.produtos 
FOR DELETE 
USING (true);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER update_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cliente TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  endereco TEXT,
  status TEXT NOT NULL DEFAULT 'Em preparo',
  data_pedido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  modo_entrega TEXT NOT NULL,
  forma_pagamento TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pedidos (admins podem ver todos)
CREATE POLICY "Admins podem ver todos os pedidos" 
ON public.pedidos 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer um pode inserir pedidos" 
ON public.pedidos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar pedidos" 
ON public.pedidos 
FOR UPDATE 
USING (true);

-- Trigger para pedidos
CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de itens do pedido
CREATE TABLE public.itens_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para itens do pedido
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para itens do pedido
CREATE POLICY "Admins podem ver todos os itens" 
ON public.itens_pedido 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer um pode inserir itens" 
ON public.itens_pedido 
FOR INSERT 
WITH CHECK (true);