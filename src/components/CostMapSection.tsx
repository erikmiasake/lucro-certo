import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import {
  getCostMap, updateCostMapItem, deleteCostMapItem, addCostMapItem,
  CostClassification, CostMapItem
} from '@/lib/store';
import {
  Package, Building2, Trash2, Plus, ArrowRightLeft, Sparkles, X
} from 'lucide-react';

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CostItemRow({ item, onUpdate, onDelete, onToggle, onRename }: {
  item: CostMapItem;
  onUpdate: (id: string, value: number) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [inputVal, setInputVal] = useState(item.value > 0 ? item.value.toString() : '');
  const [nameVal, setNameVal] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const num = parseFloat(inputVal.replace(',', '.')) || 0;
    onUpdate(item.id, num);
    setEditing(false);
  };

  const handleStartEdit = () => {
    setInputVal(item.value > 0 ? item.value.toString() : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveName = () => {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== item.name) {
      onRename(item.id, trimmed);
    } else {
      setNameVal(item.name);
    }
    setEditingName(false);
  };

  const handleStartEditName = () => {
    setNameVal(item.name);
    setEditingName(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-2 p-3 rounded-xl card-elevated group"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        item.classification === 'variable' ? 'bg-accent/10' : 'bg-purple-500/10'
      }`}>
        {item.classification === 'variable'
          ? <Package className="h-3.5 w-3.5 text-accent" />
          : <Building2 className="h-3.5 w-3.5 text-purple-400" />
        }
      </div>

      <div className="flex-1 min-w-0">
        {!editingName ? (
          <button
            onClick={handleStartEditName}
            className="text-xs font-medium text-foreground truncate block hover:text-primary transition-colors cursor-text"
            title="Clique para renomear"
          >
            {item.name}
          </button>
        ) : (
          <input
            ref={nameRef}
            type="text"
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            className="w-full text-xs font-medium bg-secondary/50 rounded-lg px-2 py-1 outline-none border border-border focus:border-primary/40 text-foreground"
          />
        )}
        {!editing ? (
          <button
            onClick={handleStartEdit}
            className={`text-sm font-bold mt-0.5 transition-colors ${
              item.value > 0 ? 'text-foreground' : 'text-muted-foreground/40'
            }`}
          >
            {item.value > 0 ? fmt(item.value) : 'R$ 0,00 — toque para editar'}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-muted-foreground">R$</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-24 text-sm font-bold bg-secondary/50 rounded-lg px-2 py-1 outline-none border border-border focus:border-primary/40 text-foreground"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggle(item.id)}
          title={item.classification === 'fixed' ? 'Mover para variável' : 'Mover para fixo'}
          className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function CostMapSection() {
  const state = useStore();
  const costMap = getCostMap();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<CostClassification>('variable');
  const addRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (id: string, value: number) => {
    updateCostMapItem(id, { value });
  };

  const handleDelete = (id: string) => {
    deleteCostMapItem(id);
  };

  const handleToggle = (id: string) => {
    const item = state.costMap.find(i => i.id === id);
    if (item) {
      updateCostMapItem(id, { classification: item.classification === 'fixed' ? 'variable' : 'fixed' });
    }
  };

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      addCostMapItem(trimmed, newClass);
      setNewName('');
      setShowAdd(false);
    }
  };

  if (state.costMap.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl card-elevated">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-foreground text-sm font-semibold mb-1">Nenhum custo configurado</p>
        <p className="text-muted-foreground text-xs mb-4 max-w-xs mx-auto">
          Adicione seus custos para calcular seu lucro real
        </p>
        <button
          onClick={() => { setShowAdd(true); setTimeout(() => addRef.current?.focus(), 50); }}
          className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Adicionar custo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Guidance */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] text-primary/90 font-medium">Preencha os valores para calcular seu lucro real</p>
          <p className="text-[10px] text-primary/50 mt-0.5">Você pode ajustar ou adicionar novos custos a qualquer momento</p>
        </div>
      </motion.div>

      {/* Variable Costs */}
      {costMap.variable.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-3.5 w-3.5 text-accent" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Custos Variáveis</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">{fmt(costMap.totalVariable)}</span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence>
              {costMap.variable.map(item => (
                <CostItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Fixed Costs */}
      {costMap.fixed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Custos Fixos</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">{fmt(costMap.totalFixed)}</span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence>
              {costMap.fixed.map(item => (
                <CostItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add new cost */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl card-elevated space-y-3">
              <input
                ref={addRef}
                type="text"
                placeholder="Nome do custo (ex: Marketing)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNewClass('variable')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    newClass === 'variable' ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-secondary/50 text-muted-foreground border border-border'
                  }`}
                >
                  <Package className="h-3 w-3 inline mr-1" /> Variável
                </button>
                <button
                  onClick={() => setNewClass('fixed')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    newClass === 'fixed' ? 'bg-purple-500/15 text-purple-400 border border-purple-400/30' : 'bg-secondary/50 text-muted-foreground border border-border'
                  }`}
                >
                  <Building2 className="h-3 w-3 inline mr-1" /> Fixo
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">
                  Adicionar
                </button>
                <button onClick={() => { setShowAdd(false); setNewName(''); }} className="px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-xs">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Total */}
      {costMap.total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between"
        >
          <span className="text-xs font-medium text-muted-foreground">Total de custos</span>
          <span className="text-sm font-bold text-foreground">{fmt(costMap.total)}</span>
        </motion.div>
      )}
    </div>
  );
}
