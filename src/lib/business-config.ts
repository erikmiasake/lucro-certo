export type BusinessType = 'restaurante' | 'salao' | 'petshop' | 'loja' | 'academia' | 'outro';

export interface BusinessConfig {
  label: string;
  icon: string;
  entryLabel: string;
  entryVerb: string;
  costCategories: {
    product: string[];
    business: string[];
  };
  productCostLabel: string;
  productCostExample: string;
  businessCostLabel: string;
  businessCostExample: string;
}

export const businessConfigs: Record<BusinessType, BusinessConfig> = {
  restaurante: {
    label: 'Restaurante / Lanchonete',
    icon: '🍽️',
    entryLabel: 'Vendas',
    entryVerb: 'venda',
    costCategories: {
      product: ['Ingredientes', 'Bebidas', 'Embalagens', 'Descartáveis'],
      business: ['Aluguel', 'Energia', 'Gás', 'Funcionários', 'Água'],
    },
    productCostLabel: 'Custo de insumos',
    productCostExample: 'ex: ingredientes, bebidas',
    businessCostLabel: 'Custo do restaurante',
    businessCostExample: 'ex: aluguel, gás, energia',
  },
  salao: {
    label: 'Salão / Barbearia',
    icon: '💇',
    entryLabel: 'Atendimentos',
    entryVerb: 'atendimento',
    costCategories: {
      product: ['Produtos', 'Tintas', 'Cremes', 'Lâminas'],
      business: ['Aluguel', 'Energia', 'Água', 'Funcionários'],
    },
    productCostLabel: 'Custo de produtos',
    productCostExample: 'ex: tintas, cremes',
    businessCostLabel: 'Custo do salão',
    businessCostExample: 'ex: aluguel, energia',
  },
  petshop: {
    label: 'Pet Shop',
    icon: '🐾',
    entryLabel: 'Vendas e serviços',
    entryVerb: 'venda',
    costCategories: {
      product: ['Ração', 'Produtos pet', 'Medicamentos', 'Acessórios'],
      business: ['Aluguel', 'Energia', 'Água', 'Funcionários'],
    },
    productCostLabel: 'Custo de produtos',
    productCostExample: 'ex: ração, medicamentos',
    businessCostLabel: 'Custo do pet shop',
    businessCostExample: 'ex: aluguel, energia',
  },
  loja: {
    label: 'Loja',
    icon: '🛍️',
    entryLabel: 'Vendas',
    entryVerb: 'venda',
    costCategories: {
      product: ['Mercadoria', 'Estoque', 'Embalagens'],
      business: ['Aluguel', 'Energia', 'Funcionários', 'Sistema/Software'],
    },
    productCostLabel: 'Custo de mercadoria',
    productCostExample: 'ex: estoque, mercadoria',
    businessCostLabel: 'Custo da loja',
    businessCostExample: 'ex: aluguel, contas',
  },
  academia: {
    label: 'Academia / Espaço Fitness',
    icon: '💪',
    entryLabel: 'Mensalidades e serviços',
    entryVerb: 'receita',
    costCategories: {
      product: ['Equipamentos', 'Suplementos', 'Manutenção', 'Limpeza'],
      business: ['Aluguel', 'Energia', 'Água', 'Funcionários', 'Sistema/Software'],
    },
    productCostLabel: 'Custo operacional',
    productCostExample: 'ex: equipamentos, manutenção',
    businessCostLabel: 'Custo da academia',
    businessCostExample: 'ex: aluguel, energia, folha',
  },
  outro: {
    label: 'Outro',
    icon: '📦',
    entryLabel: 'Entradas',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Materiais', 'Produtos', 'Insumos'],
      business: ['Aluguel', 'Energia', 'Funcionários', 'Contas'],
    },
    productCostLabel: 'Custo de produto',
    productCostExample: 'ex: estoque, materiais',
    businessCostLabel: 'Custo do negócio',
    businessCostExample: 'ex: aluguel, contas',
  },
};
