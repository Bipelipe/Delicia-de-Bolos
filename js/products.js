// Catálogo demonstrativo: confirme os produtos, os tamanhos e os valores com a loja.
// Valores em centavos evitam erros de arredondamento no cálculo da sacola.
export const products = [
  {
    id: 'bolo-morango', name: 'Um amor de morango', category: 'bolos', categoryLabel: 'Bolo artesanal',
    description: 'Massa fofinha, creme de baunilha e morangos. Um clássico que abraça.',
    image: 'assets/products-sheet.png', photoPosition: '0% 0%', alt: 'Bolo de creme decorado com morangos frescos', badge: 'O queridinho', badgeType: 'rose',
    variants: [{ label: 'Pequeno · 10 fatias', price: 12000 }, { label: 'Médio · 20 fatias', price: 21000 }, { label: 'Grande · 30 fatias', price: 29000 }],
  },
  {
    id: 'bolo-chocolate', name: 'Chocolate & mais chocolate', category: 'bolos', categoryLabel: 'Bolo artesanal',
    description: 'Massa de cacau, recheio de brigadeiro e uma generosa dose de felicidade.',
    image: 'assets/products-sheet.png', photoPosition: '50% 0%', alt: 'Bolo de chocolate com cobertura cremosa de brigadeiro', badge: '',
    variants: [{ label: 'Pequeno · 10 fatias', price: 13000 }, { label: 'Médio · 20 fatias', price: 23000 }, { label: 'Grande · 30 fatias', price: 32000 }],
  },
  {
    id: 'brigadeiros', name: 'Brigadeiro de coração', category: 'docinhos', categoryLabel: 'Docinhos',
    description: 'Chocolate, granulado e aquele gostinho de festa que a gente ama.',
    image: 'assets/products-sheet.png', photoPosition: '100% 0%', alt: 'Brigadeiros de chocolate em delicadas forminhas', badge: 'Não pode faltar', badgeType: 'cream',
    variants: [{ label: 'Caixinha · 25 unidades', price: 6500 }, { label: 'Caixa · 50 unidades', price: 12000 }, { label: 'Cento · 100 unidades', price: 22000 }],
  },
  {
    id: 'beijinhos', name: 'Um beijinho de coco', category: 'docinhos', categoryLabel: 'Docinhos',
    description: 'Delicado, cremoso e coberto de coco. Carinho em uma só mordida.',
    image: 'assets/products-sheet.png', photoPosition: '0% 100%', alt: 'Docinhos beijinho cobertos com coco ralado', badge: '',
    variants: [{ label: 'Caixinha · 25 unidades', price: 6000 }, { label: 'Caixa · 50 unidades', price: 11000 }, { label: 'Cento · 100 unidades', price: 20000 }],
  },
  {
    id: 'cupcake-baunilha', name: 'Pequenos encantos', category: 'cupcakes', categoryLabel: 'Cupcakes',
    description: 'Baunilha de verdade e cobertura suave. Pequenos no tamanho, grandes no afeto.',
    image: 'assets/products-sheet.png', photoPosition: '50% 100%', alt: 'Cupcakes de baunilha com cobertura rosa e branca', badge: 'Puro charme', badgeType: 'rose',
    variants: [{ label: 'Baunilha · caixa com 6', price: 4800 }, { label: 'Baunilha · caixa com 12', price: 9000 }],
  },
  {
    id: 'cupcake-chocolate', name: 'Só mais um, vai?', category: 'cupcakes', categoryLabel: 'Cupcakes',
    description: 'Cupcake de chocolate com cobertura de brigadeiro. Impossível resistir.',
    image: 'assets/products-sheet.png', photoPosition: '100% 100%', alt: 'Cupcakes de chocolate com cobertura de brigadeiro', badge: '',
    variants: [{ label: 'Chocolate · caixa com 6', price: 5400 }, { label: 'Chocolate · caixa com 12', price: 10000 }],
  },
];
