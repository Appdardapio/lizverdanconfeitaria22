import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import brigadeiroImg from '@/assets/brigadeiro.jpg';
import beijinhoImg from '@/assets/beijinho.jpg';
import tortaMorangoImg from '@/assets/torta-morango.jpg';

interface Product {
  id: string;
  foto: string;
  nome: string;
  descricao: string;
  valor: number;
  estoque: number;
  disponibilidade: boolean;
}

interface CartItem {
  nome: string;
  valor: number;
  quantidade: number;
  subtotal: number;
}

interface Order {
  id: string;
  nome_cliente: string;
  whatsapp: string;
  endereco?: string;
  itens: CartItem[];
  status: string;
  data_pedido: string;
  modo_entrega: string;
  forma_pagamento: string;
}

interface BakeryContextType {
  // Auth
  logado: boolean;
  setLogado: (value: boolean) => void;
  
  // Products
  produtos: Product[];
  setProdutos: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Cart
  carrinho: CartItem[];
  setCarrinho: (cart: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Orders
  pedidos: Order[];
  setPedidos: (orders: Order[]) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (id: string, status: string) => void;
}

const BakeryContext = createContext<BakeryContextType | undefined>(undefined);

export const BakeryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logado, setLogado] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [pedidos, setPedidos] = useState<Order[]>([]);

  // Load products from database
  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    }
  };

  const insertSampleProducts = async () => {
    const sampleProducts = [
      {
        foto: brigadeiroImg,
        nome: 'Brigadeiro Gourmet',
        descricao: 'Delicioso brigadeiro artesanal com chocolate belga',
        valor: 3.50,
        estoque: 50,
        disponibilidade: true,
      },
      {
        foto: beijinhoImg,
        nome: 'Beijinho Premium',
        descricao: 'Beijinho tradicional com coco ralado fresco',
        valor: 3.00,
        estoque: 40,
        disponibilidade: true,
      },
      {
        foto: tortaMorangoImg,
        nome: 'Torta de Morango',
        descricao: 'Torta artesanal com morangos frescos e chantilly',
        valor: 45.00,
        estoque: 5,
        disponibilidade: true,
      },
    ];

    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(sampleProducts)
        .select();
      
      if (error) throw error;
      if (data) setProdutos(data);
    } catch (error) {
      console.error('Erro ao inserir produtos de exemplo:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens_pedido (
            produto_nome,
            quantidade,
            valor_unitario,
            subtotal
          )
        `)
        .order('data_pedido', { ascending: false });
      
      if (pedidosError) throw pedidosError;
      
      if (pedidosData) {
        const formattedOrders = pedidosData.map(pedido => ({
          id: pedido.id,
          nome_cliente: pedido.nome_cliente,
          whatsapp: pedido.whatsapp,
          endereco: pedido.endereco,
          status: pedido.status,
          data_pedido: pedido.data_pedido,
          modo_entrega: pedido.modo_entrega,
          forma_pagamento: pedido.forma_pagamento,
          itens: pedido.itens_pedido.map(item => ({
            nome: item.produto_nome,
            valor: item.valor_unitario,
            quantidade: item.quantidade,
            subtotal: item.subtotal
          }))
        }));
        setPedidos(formattedOrders);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert([{
          foto: product.foto || brigadeiroImg,
          nome: product.nome,
          descricao: product.descricao,
          valor: product.valor,
          estoque: product.estoque,
          disponibilidade: product.disponibilidade
        }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) setProdutos(prev => [...prev, data]);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (data) setProdutos(prev => prev.map(p => p.id === id ? data : p));
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const addToCart = (item: CartItem) => {
    setCarrinho(prev => {
      const existingIndex = prev.findIndex(cartItem => cartItem.nome === item.nome);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantidade += item.quantidade;
        updated[existingIndex].subtotal = updated[existingIndex].quantidade * updated[existingIndex].valor;
        return updated;
      }
      return [...prev, item];
    });
  };

  const clearCart = () => {
    setCarrinho([]);
  };

  const cartTotal = carrinho.reduce((total, item) => total + item.subtotal, 0);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      // Calculate total
      const total = carrinho.reduce((sum, item) => sum + item.subtotal, 0);
      
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('pedidos')
        .insert([{
          nome_cliente: order.nome_cliente,
          whatsapp: order.whatsapp,
          endereco: order.endereco,
          status: order.status,
          modo_entrega: order.modo_entrega,
          forma_pagamento: order.forma_pagamento,
          total: total
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Insert order items
      const items = carrinho.map(item => ({
        pedido_id: orderData.id,
        produto_nome: item.nome,
        quantidade: item.quantidade,
        valor_unitario: item.valor,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from('itens_pedido')
        .insert(items);
      
      if (itemsError) throw itemsError;
      
      // Update local state
      const newOrder = { 
        ...order, 
        id: orderData.id,
        itens: carrinho 
      };
      setPedidos(prev => [...prev, newOrder]);
      
      // Update stock for ordered items
      for (const item of carrinho) {
        const product = produtos.find(p => p.nome === item.nome);
        if (product) {
          await updateProduct(product.id, {
            estoque: Math.max(0, product.estoque - item.quantidade),
            disponibilidade: (product.estoque - item.quantidade) > 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <BakeryContext.Provider value={{
      logado,
      setLogado,
      produtos,
      setProdutos,
      addProduct,
      updateProduct,
      deleteProduct,
      carrinho,
      setCarrinho,
      addToCart,
      clearCart,
      cartTotal,
      pedidos,
      setPedidos,
      addOrder,
      updateOrderStatus,
    }}>
      {children}
    </BakeryContext.Provider>
  );
};

export const useBakery = () => {
  const context = useContext(BakeryContext);
  if (!context) {
    throw new Error('useBakery must be used within a BakeryProvider');
  }
  return context;
};