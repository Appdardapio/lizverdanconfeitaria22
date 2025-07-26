import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useBakery } from '@/contexts/BakeryContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, LogOut, Check, X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    logado,
    setLogado,
    produtos,
    categorias,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    pedidos,
    updateOrderStatus,
    deleteOrder
  } = useBakery();

  // Redirect if not logged in
  useEffect(() => {
    if (!logado) {
      navigate('/admin');
    }
  }, [logado, navigate]);

  // Category form state
  const [newCategory, setNewCategory] = useState({
    nome: '',
    descricao: '',
    ordem: '1'
  });

  // Product form state
  const [newProduct, setNewProduct] = useState({
    foto: '',
    nome: '',
    descricao: '',
    valor: '',
    estoque: '',
    disponibilidade: true,
    categoria_id: ''
  });
  
  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [uploadingNew, setUploadingNew] = useState(false);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState({
    foto: '',
    nome: '',
    descricao: '',
    valor: '',
    estoque: '',
    disponibilidade: true,
    categoria_id: ''
  });
  
  const [editProductFile, setEditProductFile] = useState<File | null>(null);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const handleLogout = () => {
    setLogado(false);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/admin');
  };

  // Upload image function
  const uploadImage = async (file: File, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('produtos-imagens')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('produtos-imagens')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.nome) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome da categoria é obrigatório!",
      });
      return;
    }

    try {
      addCategory({
        nome: newCategory.nome,
        descricao: newCategory.descricao,
        ordem: parseInt(newCategory.ordem),
        ativa: true
      });

      setNewCategory({
        nome: '',
        descricao: '',
        ordem: '1'
      });

      toast({
        title: "Categoria adicionada!",
        description: `${newCategory.nome} foi cadastrada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar categoria",
        variant: "destructive"
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.nome || !newProduct.valor || !newProduct.estoque) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    setUploadingNew(true);
    
    try {
      let imageUrl = '';
      
      if (newProductFile) {
        const fileName = `${Date.now()}_${newProductFile.name}`;
        imageUrl = await uploadImage(newProductFile, fileName);
        
        if (!imageUrl) {
          toast({
            title: "Erro",
            description: "Falha ao fazer upload da imagem",
            variant: "destructive"
          });
          setUploadingNew(false);
          return;
        }
      }

      addProduct({
        foto: imageUrl || '/api/placeholder/300/200',
        nome: newProduct.nome,
        descricao: newProduct.descricao,
        valor: parseFloat(newProduct.valor),
        estoque: parseInt(newProduct.estoque),
        disponibilidade: newProduct.disponibilidade,
        categoria_id: newProduct.categoria_id || undefined
      });

      setNewProduct({
        foto: '',
        nome: '',
        descricao: '',
        valor: '',
        estoque: '',
        disponibilidade: true,
        categoria_id: ''
      });
      setNewProductFile(null);

      toast({
        title: "Produto adicionado!",
        description: `${newProduct.nome} foi cadastrado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto",
        variant: "destructive"
      });
    } finally {
      setUploadingNew(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id);
    setEditProduct({
      foto: product.foto,
      nome: product.nome,
      descricao: product.descricao,
      valor: product.valor.toString(),
      estoque: product.estoque.toString(),
      disponibilidade: product.disponibilidade,
      categoria_id: product.categoria_id || ''
    });
    setEditProductFile(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editProduct.nome || !editProduct.valor || !editProduct.estoque || !editingProduct) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    setUploadingEdit(true);
    
    try {
      let imageUrl = editProduct.foto;
      
      if (editProductFile) {
        const fileName = `${Date.now()}_${editProductFile.name}`;
        const uploadedUrl = await uploadImage(editProductFile, fileName);
        
        if (!uploadedUrl) {
          toast({
            title: "Erro",
            description: "Falha ao fazer upload da imagem",
            variant: "destructive"
          });
          setUploadingEdit(false);
          return;
        }
        
        imageUrl = uploadedUrl;
      }

      updateProduct(editingProduct, {
        foto: imageUrl,
        nome: editProduct.nome,
        descricao: editProduct.descricao,
        valor: parseFloat(editProduct.valor),
        estoque: parseInt(editProduct.estoque),
        disponibilidade: editProduct.disponibilidade,
        categoria_id: editProduct.categoria_id || undefined
      });

      setEditingProduct(null);
      setEditProduct({
        foto: '',
        nome: '',
        descricao: '',
        valor: '',
        estoque: '',
        disponibilidade: true,
        categoria_id: ''
      });
      setEditProductFile(null);

      toast({
        title: "Produto atualizado!",
        description: `${editProduct.nome} foi atualizado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar produto",
        variant: "destructive"
      });
    } finally {
      setUploadingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({
      foto: '',
      nome: '',
      descricao: '',
      valor: '',
      estoque: '',
      disponibilidade: true,
      categoria_id: ''
    });
    setEditProductFile(null);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus);
    const order = pedidos.find(p => p.id === orderId);
    
    if (order) {
      // Se o status for "Saiu para entrega", enviar mensagem no WhatsApp para o cliente
      if (newStatus === "Saiu para entrega") {
        const total = order.itens.reduce((sum, item) => sum + item.subtotal, 0);
        const message = `Olá ${order.nome_cliente}! 🚚\n\nSeu pedido saiu para entrega e já está a caminho!\n\nItens do pedido:\n${order.itens.map(item => `• ${item.quantidade}x ${item.nome}`).join('\n')}\n\nTotal: R$ ${total.toFixed(2)}\n\nObrigado pela preferência! 😊`;
        
        const whatsappNumber = order.whatsapp.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
      }
      
      toast({
        title: "Status atualizado!",
        description: `Pedido de ${order.nome_cliente} agora está: ${newStatus}`,
      });
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, "Aceito");
    const order = pedidos.find(p => p.id === orderId);
    
    if (order) {
      const total = order.itens.reduce((sum, item) => sum + item.subtotal, 0);
      const message = `Olá ${order.nome_cliente}! ✅\n\nSeu pedido foi ACEITO e já está sendo preparado!\n\nItens do pedido:\n${order.itens.map(item => `• ${item.quantidade}x ${item.nome}`).join('\n')}\n\nTotal: R$ ${total.toFixed(2)}\n\nObrigado pela preferência! 😊`;
      
      const whatsappNumber = order.whatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Pedido aceito!",
        description: `Pedido de ${order.nome_cliente} foi aceito e cliente notificado.`,
      });
    }
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, "Recusado");
    const order = pedidos.find(p => p.id === orderId);
    
    if (order) {
      const message = `Olá ${order.nome_cliente}! ❌\n\nInfelizmente não conseguimos aceitar seu pedido no momento.\n\nPor favor, entre em contato conosco para mais informações.\n\nObrigado pela compreensão! 😊`;
      
      const whatsappNumber = order.whatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Pedido recusado!",
        description: `Pedido de ${order.nome_cliente} foi recusado e cliente notificado.`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!logado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">Liz Verdan Confeitaria</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="categorias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar Produto</TabsTrigger>
            <TabsTrigger value="produtos">Produtos Cadastrados</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="categorias">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-nome">Nome da Categoria *</Label>
                      <Input
                        id="cat-nome"
                        type="text"
                        value={newCategory.nome}
                        onChange={(e) => setNewCategory({...newCategory, nome: e.target.value})}
                        placeholder="Ex: Bolos, Doces, Salgados"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cat-descricao">Descrição</Label>
                      <Input
                        id="cat-descricao"
                        type="text"
                        value={newCategory.descricao}
                        onChange={(e) => setNewCategory({...newCategory, descricao: e.target.value})}
                        placeholder="Descrição da categoria"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cat-ordem">Ordem de Exibição</Label>
                      <Input
                        id="cat-ordem"
                        type="number"
                        value={newCategory.ordem}
                        onChange={(e) => setNewCategory({...newCategory, ordem: e.target.value})}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Categoria
                  </Button>
                </form>

                <div className="space-y-3">
                  <h3 className="font-semibold">Categorias Cadastradas:</h3>
                  {categorias.map((categoria) => (
                    <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{categoria.nome}</span>
                        {categoria.descricao && (
                          <span className="text-muted-foreground text-sm ml-2">- {categoria.descricao}</span>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">(Ordem: {categoria.ordem})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteCategory(categoria.id);
                          toast({
                            title: "Categoria excluída!",
                            description: `${categoria.nome} foi removida com sucesso.`,
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {categorias.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma categoria cadastrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadastrar">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Novo Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="foto">Foto do Produto</Label>
                      <Input
                        id="foto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewProductFile(e.target.files?.[0] || null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        type="text"
                        value={newProduct.nome}
                        onChange={(e) => setNewProduct({...newProduct, nome: e.target.value})}
                        placeholder="Nome do produto"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={newProduct.descricao}
                        onChange={(e) => setNewProduct({...newProduct, descricao: e.target.value})}
                        placeholder="Descrição do produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={newProduct.valor}
                        onChange={(e) => setNewProduct({...newProduct, valor: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque *</Label>
                      <Input
                        id="estoque"
                        type="number"
                        value={newProduct.estoque}
                        onChange={(e) => setNewProduct({...newProduct, estoque: e.target.value})}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select value={newProduct.categoria_id} onValueChange={(value) => setNewProduct({...newProduct, categoria_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 md:col-span-2">
                      <Switch
                        id="disponibilidade"
                        checked={newProduct.disponibilidade}
                        onCheckedChange={(checked) => setNewProduct({...newProduct, disponibilidade: checked})}
                      />
                      <Label htmlFor="disponibilidade">Disponível para venda?</Label>
                    </div>
                  </div>

                  <Button type="submit" disabled={uploadingNew} className="w-full bg-gradient-primary hover:opacity-90">
                    {uploadingNew ? 'Salvando...' : 'Salvar Produto'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produtos">
            <div className="grid gap-4">
              {produtos.map((produto) => (
                <Card key={produto.id} className={`shadow-card ${!produto.disponibilidade ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-6">
                    {editingProduct === produto.id ? (
                      // Edit form
                      <form onSubmit={handleUpdateProduct} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-foto">Foto do Produto</Label>
                            <Input
                              id="edit-foto"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditProductFile(e.target.files?.[0] || null)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-nome">Nome *</Label>
                            <Input
                              id="edit-nome"
                              type="text"
                              value={editProduct.nome}
                              onChange={(e) => setEditProduct({...editProduct, nome: e.target.value})}
                              placeholder="Nome do produto"
                              required
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="edit-descricao">Descrição</Label>
                            <Textarea
                              id="edit-descricao"
                              value={editProduct.descricao}
                              onChange={(e) => setEditProduct({...editProduct, descricao: e.target.value})}
                              placeholder="Descrição do produto"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-valor">Valor (R$) *</Label>
                            <Input
                              id="edit-valor"
                              type="number"
                              step="0.01"
                              value={editProduct.valor}
                              onChange={(e) => setEditProduct({...editProduct, valor: e.target.value})}
                              placeholder="0.00"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-estoque">Estoque *</Label>
                            <Input
                              id="edit-estoque"
                              type="number"
                              value={editProduct.estoque}
                              onChange={(e) => setEditProduct({...editProduct, estoque: e.target.value})}
                              placeholder="0"
                              required
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="edit-categoria">Categoria</Label>
                            <Select value={editProduct.categoria_id} onValueChange={(value) => setEditProduct({...editProduct, categoria_id: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {categorias.map((categoria) => (
                                  <SelectItem key={categoria.id} value={categoria.id}>
                                    {categoria.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2 md:col-span-2">
                            <Switch
                              id="edit-disponibilidade"
                              checked={editProduct.disponibilidade}
                              onCheckedChange={(checked) => setEditProduct({...editProduct, disponibilidade: checked})}
                            />
                            <Label htmlFor="edit-disponibilidade">Disponível para venda?</Label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={uploadingEdit} className="bg-gradient-primary hover:opacity-90">
                            {uploadingEdit ? 'Salvando...' : 'Salvar Alterações'}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCancelEdit}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      // Display view
                      <div className="flex gap-4">
                        <img 
                          src={produto.foto} 
                          alt={produto.nome}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{produto.nome}</h3>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditProduct(produto)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  deleteProduct(produto.id);
                                  toast({
                                    title: "Produto excluído!",
                                    description: `${produto.nome} foi removido com sucesso.`,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-2">{produto.descricao}</p>
                          <div className="flex gap-4 items-center">
                            <span className="font-semibold">R$ {produto.valor.toFixed(2)}</span>
                            <span>Estoque: {produto.estoque}</span>
                            <Badge variant={produto.disponibilidade ? "default" : "destructive"}>
                              {produto.disponibilidade ? "Disponível" : "Indisponível"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={produto.disponibilidade}
                            onCheckedChange={(checked) => updateProduct(produto.id, { disponibilidade: checked })}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pedidos">
            <div className="grid gap-4">
              {pedidos
                .sort((a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime())
                .map((pedido) => (
                <Card key={pedido.id} className={`shadow-card ${
                  pedido.modo_entrega === 'Entrega' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{pedido.nome_cliente}</h3>
                        <p className="text-muted-foreground">{pedido.whatsapp}</p>
                        <p className="text-sm">Data: {formatDate(pedido.data_pedido)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={pedido.modo_entrega === 'Entrega' ? 'default' : 'secondary'}>
                          {pedido.modo_entrega}
                        </Badge>
                        <p className="text-sm mt-1">{pedido.forma_pagamento}</p>
                      </div>
                    </div>

                    {pedido.endereco && (
                      <p className="text-sm mb-4"><strong>Endereço:</strong> {pedido.endereco}</p>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Itens do pedido:</h4>
                      {pedido.itens.map((item, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>{item.quantidade}x {item.nome}</span>
                          <span>R$ {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {pedido.status === "Em preparo" && (
                      <div className="flex gap-2 mt-4 mb-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAcceptOrder(pedido.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aceitar Pedido
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectOrder(pedido.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Recusar Pedido
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant={pedido.status === "Em preparo" ? "default" : "outline"}
                        onClick={() => handleStatusChange(pedido.id, "Em preparo")}
                      >
                        Em preparo
                      </Button>
                      <Button
                        size="sm"
                        variant={pedido.status === "Pronto" ? "default" : "outline"}
                        onClick={() => handleStatusChange(pedido.id, "Pronto")}
                      >
                        Pronto
                      </Button>
                      <Button
                        size="sm"
                        variant={pedido.status === "Saiu para entrega" ? "default" : "outline"}
                        onClick={() => handleStatusChange(pedido.id, "Saiu para entrega")}
                      >
                        Saiu para entrega
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline">Status atual: {pedido.status}</Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteOrder(pedido.id);
                          toast({
                            title: "Pedido excluído!",
                            description: `Pedido de ${pedido.nome_cliente} foi removido com sucesso.`,
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir Pedido
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pedidos.length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum pedido encontrado
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;