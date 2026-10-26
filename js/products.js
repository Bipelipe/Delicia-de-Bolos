// Opções e valores conforme o cardápio enviado pela confeitaria.
// Docinhos são vendidos por cento; cupcakes, por unidade.
// Valores em centavos evitam erros de arredondamento no cálculo da sacola.
export const products = [
  {
    id: 'bolo-morango', name: 'Um amor de morango', category: 'bolos', categoryLabel: 'Bolo artesanal',
    description: 'Massa fofinha, creme de baunilha e morangos. Um clássico que abraça.',
    image: 'assets/products-sheet.png', photoPosition: '0% 0%', alt: 'Bolo de creme decorado com morangos frescos', badge: 'O queridinho', badgeType: 'rose',
    variants: [{ label: '1 kg · 10 fatias', price: 9000 }, { label: '1,5 kg · 15 fatias', price: 13500 }, { label: '2 kg · 20 fatias', price: 18000 }, { label: '2,5 kg · 25 fatias', price: 22500 }],
  },
  {
    id: 'bolo-chocolate', name: 'Chocolate & mais chocolate', category: 'bolos', categoryLabel: 'Bolo artesanal',
    description: 'Massa de cacau, recheio de brigadeiro e uma generosa dose de felicidade.',
    image: 'assets/products-sheet.png', photoPosition: '50% 0%', alt: 'Bolo de chocolate com cobertura cremosa de brigadeiro', badge: '',
    variants: [{ label: '1 kg · 10 fatias', price: 9000 }, { label: '1,5 kg · 15 fatias', price: 13500 }, { label: '2 kg · 20 fatias', price: 18000 }, { label: '2,5 kg · 25 fatias', price: 22500 }],
  },
  {
    id: 'brigadeiros', name: 'Brigadeiro de coração', category: 'docinhos', categoryLabel: 'Docinhos',
    description: 'Chocolate, granulado e aquele gostinho de festa que a gente ama.',
    image: 'assets/products-sheet.png', photoPosition: '100% 0%', alt: 'Brigadeiros de chocolate em delicadas forminhas', badge: 'Não pode faltar', badgeType: 'cream',
    variants: [{ label: 'Cento · 100 unidades', price: 12000 }],
  },
  {
    id: 'beijinhos', name: 'Um beijinho de coco', category: 'docinhos', categoryLabel: 'Docinhos',
    description: 'Delicado, cremoso e coberto de coco. Carinho em uma só mordida.',
    image: 'assets/products-sheet.png', photoPosition: '0% 100%', alt: 'Docinhos beijinho cobertos com coco ralado', badge: '',
    variants: [{ label: 'Cento · 100 unidades', price: 12000 }],
  },
  {
    id: 'cupcake-baunilha', name: 'Pequenos encantos', category: 'cupcakes', categoryLabel: 'Cupcakes',
    description: 'Baunilha de verdade e cobertura suave. Pequenos no tamanho, grandes no afeto.',
    image: 'assets/products-sheet.png', photoPosition: '50% 100%', alt: 'Cupcakes de baunilha com cobertura rosa e branca', badge: 'Puro charme', badgeType: 'rose',
    variants: [{ label: 'Baunilha · unidade', price: 600 }],
  },
  {
    id: 'cupcake-chocolate', name: 'Só mais um, vai?', category: 'cupcakes', categoryLabel: 'Cupcakes',
    description: 'Cupcake de chocolate com cobertura de brigadeiro. Impossível resistir.',
    image: 'assets/products-sheet.png', photoPosition: '100% 100%', alt: 'Cupcakes de chocolate com cobertura de brigadeiro', badge: '',
    variants: [{ label: 'Chocolate · unidade', price: 600 }],
  },
];
