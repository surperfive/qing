import React from 'react';
import { createRoot } from 'react-dom/client';
import { IconSheet } from './IconSheet';

const style = document.createElement('style');
style.textContent = `
.art-full{width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden}
.art-full img{width:100%;height:100%;object-fit:contain;display:block}
.art-full svg{width:100%;height:100%;display:block}
.grid.custom .art img{width:100%;height:100%;object-fit:contain;display:block}
.grid.custom .art{overflow:hidden}
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(<IconSheet />);
