import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Sample products for demonstration
  useEffect(() => {
    if (produtos.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: '1',
          foto: brigadeiroImg,
          nome: 'Brigadeiro Gourmet',
          descricao: 'Delicioso brigadeiro artesanal com chocolate belga',
          valor: 3.50,
          estoque: 50,
          disponibilidade: true,
        },
        {
          id: '2',
          foto: beijinhoImg,
          nome: 'Beijinho Premium',
          descricao: 'Beijinho tradicional com coco ralado fresco',
          valor: 3.00,
          estoque: 40,
          disponibilidade: true,
        },
        {
          id: '3',
          foto: tortaMorangoImg,
          nome: 'Torta de Morango',
          descricao: 'Torta artesanal com morangos frescos e chantilly',
          valor: 45.00,
          estoque: 5,
          disponibilidade: true,
        },
      ];
      setProdutos(sampleProducts);
    }
  }, [produtos.length]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { 
      ...product, 
      id: Date.now().toString(),
      foto: product.foto || brigadeiroImg
    };
    setProdutos(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
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

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = { ...order, id: Date.now().toString() };
    setPedidos(prev => [...prev, newOrder]);
    
    // Update stock for ordered items
    carrinho.forEach(item => {
      const product = produtos.find(p => p.nome === item.nome);
      if (product) {
        updateProduct(product.id, {
          estoque: Math.max(0, product.estoque - item.quantidade),
          disponibilidade: (product.estoque - item.quantidade) > 0
        });
      }
    });
  };

  const updateOrderStatus = (id: string, status: string) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
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