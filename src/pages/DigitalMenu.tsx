import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBakery } from '@/contexts/BakeryContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import lizVerdanLogo from '@/assets/liz-verdan-logo.png';

const DigitalMenu = () => {
  const navigate = useNavigate();
  const {
    produtos,
    categorias,
    carrinho,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    addOrder,
  } = useBakery();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, name: string} | null>(null);
  const { toast } = useToast();
  const [orderData, setOrderData] = useState({
    nome_cliente: '',
    whatsapp: '',
    endereco: '',
    modo_entrega: '',
    forma_pagamento: ''
  });

  const availableProducts = produtos.filter(p => p.disponibilidade && p.estoque > 0);

  const handleQuantityChange = (productName: string, change: number) => {
    const product = produtos.find(p => p.nome === productName);
    if (!product) return;

    const currentQty = quantities[productName] || 1;
    const newQty = Math.max(1, Math.min(currentQty + change, product.estoque));
    setQuantities({...quantities, [productName]: newQty});
  };

  const handleAddToCart = (product: typeof produtos[0]) => {
    const quantity = quantities[product.nome] || 1;
    
    const success = addToCart({
      nome: product.nome,
      valor: product.valor,
      quantidade: quantity,
      subtotal: quantity * product.valor
    }, product.estoque);

    if (success) {
      toast({
        title: "✅ Adicionado ao carrinho!",
        description: `${quantity}x ${product.nome} - Veja seu carrinho abaixo para finalizar`,
      });

      // Reset quantity
      setQuantities({...quantities, [product.nome]: 1});
    } else {
      toast({
        variant: "destructive",
        title: "❌ Erro ao adicionar",
        description: `Não há quantidade suficiente em estoque. Disponível: ${product.estoque} unidades`,
      });
    }
  };

  const handleFinalizarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para retirada, endereço não é obrigatório
    const isEnderecoRequired = orderData.modo_entrega === 'Entrega';
    
    if (!orderData.nome_cliente || !orderData.whatsapp || !orderData.modo_entrega || !orderData.forma_pagamento || (isEnderecoRequired && !orderData.endereco)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
      });
      return;
    }

    addOrder({
      nome_cliente: orderData.nome_cliente,
      whatsapp: orderData.whatsapp,
      endereco: orderData.endereco,
      itens: carrinho,
      status: "Em preparo",
      data_pedido: new Date().toISOString(),
      modo_entrega: orderData.modo_entrega,
      forma_pagamento: orderData.forma_pagamento
    });

    // Enviar mensagem pelo WhatsApp
    let message = `🧁 *NOVO PEDIDO - Liz Verdan Confeitaria*

👤 *Cliente:* ${orderData.nome_cliente}
📱 *WhatsApp:* ${orderData.whatsapp}`;

    if (orderData.modo_entrega === 'Entrega') {
      message += `
🏠 *Endereço:* ${orderData.endereco}
🚚 *Entrega:* ${orderData.modo_entrega} (Valor de entrega: A combinar no WhatsApp)`;
    } else if (orderData.modo_entrega === 'Retirada') {
      message += `
🚚 *Entrega:* ${orderData.modo_entrega}

📍 *LOCAL PARA RETIRADA:*
• Instagram: @lizverdanconfeitaria
• WhatsApp: 22 99860-2746
• Endereço: Estr. dos Passageiros, 2915 - São João, São Pedro da Aldeia - RJ, 28942-444, Brasil`;
    }

    message += `
💳 *Pagamento:* ${orderData.forma_pagamento}

📦 *Itens do pedido:*
${carrinho.map(item => `• ${item.quantidade}x ${item.nome} - R$ ${item.subtotal.toFixed(2)}`).join('\n')}

💰 *Total: R$ ${cartTotal.toFixed(2)}*

⏰ *Tempo médio de preparo:* 
${orderData.modo_entrega === 'Retirada' ? '20 à 40 minutos' : '20 à 40 minutos + tempo de entrega'}

⏰ *Pedido feito em:* ${new Date().toLocaleString('pt-BR')}`;

    const whatsappUrl = `https://wa.me/5522998602746?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    clearCart();
    setShowCheckout(false);
    setOrderData({
      nome_cliente: '',
      whatsapp: '',
      endereco: '',
      modo_entrega: '',
      forma_pagamento: ''
    });

    toast({
      title: "Pedido enviado!",
      description: `Obrigada ${orderData.nome_cliente}! Seu pedido foi enviado pelo WhatsApp.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <img 
              src={lizVerdanLogo} 
              alt="Liz Verdan Confeitaria" 
              className="w-48 h-auto mx-auto mb-4"
            />
            <p className="opacity-90">Cardápio Digital</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        {!showCheckout ? (
          <>
            {/* Products Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Nossos Produtos</h2>
              
              {categorias.length > 0 ? (
                categorias.map((categoria) => {
                  const produtosCategoria = availableProducts.filter(p => p.categoria_id === categoria.id);
                  const produtosSemCategoria = availableProducts.filter(p => !p.categoria_id);
                  
                  if (produtosCategoria.length === 0 && categoria.nome !== 'Geral') return null;
                  
                  const produtosParaExibir = categoria.nome === 'Geral' 
                    ? [...produtosCategoria, ...produtosSemCategoria]
                    : produtosCategoria;
                    
                  if (produtosParaExibir.length === 0) return null;
                  
                  return (
                    <div key={categoria.id} className="mb-8">
                      <h3 className="text-xl font-semibold text-primary mb-4 border-b border-primary/20 pb-2">
                        {categoria.nome}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {produtosParaExibir.map((produto) => (
                  <Card key={produto.id} className="shadow-card hover:shadow-soft transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative group cursor-pointer" onClick={() => setSelectedImage({url: produto.foto, name: produto.nome})}>
                        <img 
                          src={produto.foto} 
                          alt={produto.nome}
                          className="w-full h-48 object-cover rounded-t-lg group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{produto.nome}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{produto.descricao}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-bold text-primary">
                            R$ {produto.valor.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <Label>Quantidade:</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(produto.nome, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {quantities[produto.nome] || 1}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(produto.nome, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-gradient-primary hover:opacity-90"
                          onClick={() => handleAddToCart(produto)}
                        >
                          Adicionar ao Carrinho
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableProducts.map((produto) => (
                    <Card key={produto.id} className="shadow-card hover:shadow-soft transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative group cursor-pointer" onClick={() => setSelectedImage({url: produto.foto, name: produto.nome})}>
                          <img 
                            src={produto.foto} 
                            alt={produto.nome}
                            className="w-full h-48 object-cover rounded-t-lg group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{produto.nome}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{produto.descricao}</p>
                          
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-bold text-primary">
                              R$ {produto.valor.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <Label>Quantidade:</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(produto.nome, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">
                                {quantities[produto.nome] || 1}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(produto.nome, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <Button 
                            className="w-full bg-gradient-primary hover:opacity-90"
                            onClick={() => handleAddToCart(produto)}
                          >
                            Adicionar ao Carrinho
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {availableProducts.length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum produto disponível no momento
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cart Section */}
            {carrinho.length > 0 && (
              <Card className="shadow-card mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Seu Carrinho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {carrinho.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{item.quantidade}x {item.nome}</span>
                          <div className="text-sm text-muted-foreground">
                            R$ {item.valor.toFixed(2)} cada
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">R$ {item.subtotal.toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.nome)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-gradient-primary hover:opacity-90"
                    onClick={() => setShowCheckout(true)}
                  >
                    Finalizar Pedido
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Checkout Form */
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Dados do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFinalizarPedido} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_cliente">Nome *</Label>
                    <Input
                      id="nome_cliente"
                      type="text"
                      value={orderData.nome_cliente}
                      onChange={(e) => setOrderData({...orderData, nome_cliente: e.target.value})}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={orderData.whatsapp}
                      onChange={(e) => setOrderData({...orderData, whatsapp: e.target.value})}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modo_entrega">Entrega ou Retirada? *</Label>
                    <Select value={orderData.modo_entrega} onValueChange={(value) => setOrderData({...orderData, modo_entrega: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrega">Entrega</SelectItem>
                        <SelectItem value="Retirada">Retirada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
                    <Select value={orderData.forma_pagamento} onValueChange={(value) => setOrderData({...orderData, forma_pagamento: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão de crédito">Cartão de crédito</SelectItem>
                        <SelectItem value="Cartão de débito">Cartão de débito</SelectItem>
                        <SelectItem value="Pix">Pix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {orderData.modo_entrega === 'Entrega' ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço completo *</Label>
                    <Textarea
                      id="endereco"
                      value={orderData.endereco}
                      onChange={(e) => setOrderData({...orderData, endereco: e.target.value})}
                      placeholder="Rua, número, bairro, cidade, CEP, ponto de referência..."
                      className="min-h-[100px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Inclua todas as informações necessárias para a entrega
                    </p>
                  </div>
                ) : orderData.modo_entrega === 'Retirada' ? (
                  <div className="space-y-4 md:col-span-2">
                    <div className="bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 text-primary">📍 Informações para Retirada</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Instagram:</span>
                          <span>@lizverdanconfeitaria</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">WhatsApp:</span>
                          <span>22 99860-2746</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium">Endereço:</span>
                          <span>Estr. dos Passageiros, 2915 - São João, São Pedro da Aldeia - RJ, 28942-444, Brasil</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    Voltar ao Carrinho
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    Enviar Pedido
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Modal para visualizar imagem em tamanho completo */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-4">
            <DialogHeader>
              <DialogTitle>{selectedImage?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center">
              <img 
                src={selectedImage?.url} 
                alt={selectedImage?.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer com informações de contato */}
        <div className="bg-gradient-primary text-primary-foreground py-8 px-6 rounded-lg shadow-soft mt-12">
          <div className="text-center space-y-4">
            <img 
              src={lizVerdanLogo} 
              alt="Liz Verdan Confeitaria" 
              className="w-32 h-auto mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-4">Liz Verdan Confeitaria</h3>
            
            <div className="space-y-2 text-sm opacity-90">
              <div className="flex items-center justify-center gap-2">
                <span className="font-medium">📷 Instagram:</span>
                <span>@lizverdanconfeitaria</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-medium">📱 WhatsApp:</span>
                <span>22 99860-2746</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-center">
                <span className="font-medium">📍 Endereço:</span>
                <span>Estr. dos Passageiros, 2915 - São João, São Pedro da Aldeia - RJ, 28942-444, Brasil</span>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-4 mt-6">
              <p className="text-xs opacity-70">Desenvolvido por: Dsm Consultoria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Admin Button */}
      <Button
        onClick={() => navigate('/admin')}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-transparent border-none text-transparent hover:text-transparent opacity-5 hover:opacity-10 transition-all"
        variant="ghost"
      >
        ⚙️
      </Button>
    </div>
  );
};

export default DigitalMenu;