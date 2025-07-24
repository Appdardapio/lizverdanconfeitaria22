-- Criar bucket para armazenar imagens de produtos
INSERT INTO storage.buckets (id, name, public) VALUES ('produtos-imagens', 'produtos-imagens', true);

-- Política para permitir leitura pública das imagens
CREATE POLICY "Imagens dos produtos são públicas"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produtos-imagens');

-- Política para permitir upload de imagens
CREATE POLICY "Admins podem fazer upload de imagens"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'produtos-imagens');

-- Política para permitir atualização de imagens
CREATE POLICY "Admins podem atualizar imagens"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produtos-imagens');

-- Política para permitir exclusão de imagens
CREATE POLICY "Admins podem deletar imagens"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produtos-imagens');