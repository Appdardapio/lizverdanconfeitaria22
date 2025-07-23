import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Trash2, Edit, LogOut } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    logado,
    setLogado,
    produtos,
    addProduct,
    updateProduct,
    deleteProduct,
    pedidos,
    updateOrderStatus
  } = useBakery();

  // Redirect if not logged in
  useEffect(() => {
    if (!logado) {
      navigate('/admin');
    }
  }, [logado, navigate]);

  // Product form state
  const [newProduct, setNewProduct] = useState({
    foto: '',
    nome: '',
    descricao: '',
    valor: '',
    estoque: '',
    disponibilidade: true
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState({
    foto: '',
    nome: '',
    descricao: '',
    valor: '',
    estoque: '',
    disponibilidade: true
  });

  const handleLogout = () => {
    setLogado(false);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/admin');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.nome || !newProduct.valor || !newProduct.estoque) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    addProduct({
      foto: newProduct.foto || '/api/placeholder/300/200',
      nome: newProduct.nome,
      descricao: newProduct.descricao,
      valor: parseFloat(newProduct.valor),
      estoque: parseInt(newProduct.estoque),
      disponibilidade: newProduct.disponibilidade
    });

    setNewProduct({
      foto: '',
      nome: '',
      descricao: '',
      valor: '',
      estoque: '',
      disponibilidade: true
    });

    toast({
      title: "Produto adicionado!",
      description: `${newProduct.nome} foi cadastrado com sucesso.`,
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id);
    setEditProduct({
      foto: product.foto,
      nome: product.nome,
      descricao: product.descricao,
      valor: product.valor.toString(),
      estoque: product.estoque.toString(),
      disponibilidade: product.disponibilidade
    });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editProduct.nome || !editProduct.valor || !editProduct.estoque || !editingProduct) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    updateProduct(editingProduct, {
      foto: editProduct.foto,
      nome: editProduct.nome,
      descricao: editProduct.descricao,
      valor: parseFloat(editProduct.valor),
      estoque: parseInt(editProduct.estoque),
      disponibilidade: editProduct.disponibilidade
    });

    setEditingProduct(null);
    setEditProduct({
      foto: '',
      nome: '',
      descricao: '',
      valor: '',
      estoque: '',
      disponibilidade: true
    });

    toast({
      title: "Produto atualizado!",
      description: `${editProduct.nome} foi atualizado com sucesso.`,
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({
      foto: '',
      nome: '',
      descricao: '',
      valor: '',
      estoque: '',
      disponibilidade: true
    });
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus);
    const order = pedidos.find(p => p.id === orderId);
    
    if (order) {
      // Simulate WhatsApp notification
      toast({
        title: "Status atualizado!",
        description: `Pedido de ${order.nome_cliente} agora está: ${newStatus}`,
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

        <Tabs defaultValue="cadastrar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cadastrar">Cadastrar Produto</TabsTrigger>
            <TabsTrigger value="produtos">Produtos Cadastrados</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastrar">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Novo Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="foto">Foto do Produto (URL)</Label>
                      <Input
                        id="foto"
                        type="url"
                        value={newProduct.foto}
                        onChange={(e) => setNewProduct({...newProduct, foto: e.target.value})}
                        placeholder="https://exemplo.com/foto.jpg"
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

                    <div className="flex items-center space-x-2 md:col-span-2">
                      <Switch
                        id="disponibilidade"
                        checked={newProduct.disponibilidade}
                        onCheckedChange={(checked) => setNewProduct({...newProduct, disponibilidade: checked})}
                      />
                      <Label htmlFor="disponibilidade">Disponível para venda?</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                    Salvar Produto
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
                            <Label htmlFor="edit-foto">Foto do Produto (URL)</Label>
                            <Input
                              id="edit-foto"
                              type="url"
                              value={editProduct.foto}
                              onChange={(e) => setEditProduct({...editProduct, foto: e.target.value})}
                              placeholder="https://exemplo.com/foto.jpg"
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
                          <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                            Salvar Alterações
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
                    
                    <div className="mt-2">
                      <Badge variant="outline">Status atual: {pedido.status}</Badge>
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