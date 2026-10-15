import React from 'react';
import { Store } from '../types';
import { STORES } from '../data/mockData';
import { X, MapPin, Check, Phone, Clock } from 'lucide-react';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStore: Store;
  onSelectStore: (store: Store) => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  currentStore,
  onSelectStore
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-900" />
            <h3 className="font-extrabold text-slate-900 text-base">选择点餐门店</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {STORES.map((store) => {
            const isSelected = store.id === currentStore.id;
            return (
              <div
                key={store.id}
                onClick={() => {
                  onSelectStore(store);
                  onClose();
                }}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 ease-out active:scale-[0.98] ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-extrabold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{store.name}</h4>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        距您 {store.distance}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{store.address}</p>
                    <div className={`flex items-center gap-3 mt-2 text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {store.openTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {store.phone}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-md bg-[#C7F665] text-slate-900 flex items-center justify-center flex-shrink-0 mt-1 font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
