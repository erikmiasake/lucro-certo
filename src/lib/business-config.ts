export type BusinessType = 'restaurante' | 'salao' | 'petshop' | 'loja' | 'academia' | 'outro' | 'pessoal';

export const costBenchmarks: Record<BusinessType, { fixedRange: [number, number]; variableRange: [number, number]; totalRange: [number, number] }> = {
  restaurante: { fixedRange: [15, 25], variableRange: [25, 35], totalRange: [40, 60] },
  salao: { fixedRange: [20, 30], variableRange: [10, 20], totalRange: [30, 50] },
  petshop: { fixedRange: [15, 25], variableRange: [30, 40], totalRange: [45, 65] },
  loja: { fixedRange: [10, 20], variableRange: [40, 55], totalRange: [50, 75] },
  academia: { fixedRange: [30, 45], variableRange: [5, 15], totalRange: [35, 60] },
  outro: { fixedRange: [15, 30], variableRange: [20, 35], totalRange: [35, 65] },
  pessoal: { fixedRange: [30, 50], variableRange: [20, 40], totalRange: [50, 80] },
};

export const businessImages: Partial<Record<BusinessType, string>> = {
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  salao: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
  petshop: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=600&auto=format&fit=crop',
  loja: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
  academia: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  outro: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
};


export type UsageMode = 'business' | 'personal';

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
  /** Personal mode uses adapted terminology */
  isPersonal?: boolean;
}

/** Helper to check if a business type is personal mode */
export function isPersonalMode(type: BusinessType | null): boolean {
  return type === 'pessoal';
}

// getAdaptedLabels removido — usar getModeCopyFromType de @/lib/modes

export const businessConfigs: Record<BusinessType, BusinessConfig> = {
  restaurante: {
    label: 'Restaurante / Lanchonete',
    icon: '🍽️',
    entryLabel: 'Receita',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Ingredientes', 'Bebidas', 'Embalagens', 'Descartáveis'],
      business: ['Aluguel', 'Energia', 'Gás', 'Água'],
    },
    productCostLabel: 'Custo de insumos',
    productCostExample: 'ex: ingredientes, bebidas',
    businessCostLabel: 'Custo do restaurante',
    businessCostExample: 'ex: aluguel, gás, energia',
  },
  salao: {
    label: 'Salão / Barbearia',
    icon: '💇',
    entryLabel: 'Receita',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Produtos', 'Tintas', 'Cremes', 'Lâminas'],
      business: ['Aluguel', 'Energia', 'Água'],
    },
    productCostLabel: 'Custo de produtos',
    productCostExample: 'ex: tintas, cremes',
    businessCostLabel: 'Custo do salão',
    businessCostExample: 'ex: aluguel, energia',
  },
  petshop: {
    label: 'Pet Shop',
    icon: '🐾',
    entryLabel: 'Receita',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Ração', 'Produtos pet', 'Medicamentos', 'Acessórios'],
      business: ['Aluguel', 'Energia', 'Água'],
    },
    productCostLabel: 'Custo de produtos',
    productCostExample: 'ex: ração, medicamentos',
    businessCostLabel: 'Custo do pet shop',
    businessCostExample: 'ex: aluguel, energia',
  },
  loja: {
    label: 'Loja',
    icon: '🛍️',
    entryLabel: 'Receita',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Mercadoria', 'Estoque', 'Embalagens'],
      business: ['Aluguel', 'Energia', 'Sistema/Software'],
    },
    productCostLabel: 'Custo de mercadoria',
    productCostExample: 'ex: estoque, mercadoria',
    businessCostLabel: 'Custo da loja',
    businessCostExample: 'ex: aluguel, contas',
  },
  academia: {
    label: 'Academia / Espaço Fitness',
    icon: '💪',
    entryLabel: 'Receita',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Equipamentos', 'Suplementos', 'Manutenção', 'Limpeza'],
      business: ['Aluguel', 'Energia', 'Água', 'Sistema/Software'],
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
      business: ['Aluguel', 'Energia', 'Contas'],
    },
    productCostLabel: 'Custo de produto',
    productCostExample: 'ex: estoque, materiais',
    businessCostLabel: 'Custo do negócio',
    businessCostExample: 'ex: aluguel, contas',
  },
  pessoal: {
    label: 'Finanças Pessoais',
    icon: '👤',
    entryLabel: 'Entradas',
    entryVerb: 'entrada',
    costCategories: {
      product: ['Alimentação', 'Transporte', 'Saúde', 'Lazer'],
      business: ['Moradia', 'Contas fixas', 'Assinaturas', 'Educação'],
    },
    productCostLabel: 'Gasto variável',
    productCostExample: 'ex: alimentação, transporte',
    businessCostLabel: 'Gasto fixo',
    businessCostExample: 'ex: aluguel, contas, assinaturas',
    isPersonal: true,
  },
};
