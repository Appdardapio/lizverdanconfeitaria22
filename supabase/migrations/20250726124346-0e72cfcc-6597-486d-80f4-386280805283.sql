-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias
CREATE POLICY "Categorias são visíveis publicamente" 
ON public.categorias 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem inserir categorias" 
ON public.categorias 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar categorias" 
ON public.categorias 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins podem deletar categorias" 
ON public.categorias 
FOR DELETE 
USING (true);

-- Adicionar coluna categoria_id na tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN categoria_id UUID REFERENCES public.categorias(id);

-- Trigger para atualizar updated_at em categorias
CREATE TRIGGER update_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categoria padrão
INSERT INTO public.categorias (nome, descricao, ordem) 
VALUES ('Geral', 'Categoria padrão para produtos', 1);