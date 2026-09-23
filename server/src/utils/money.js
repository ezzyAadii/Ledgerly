export const toPaise = value => Math.round(Number(value) * 100);
export const fromPaise = value => Number((Number(value || 0) / 100).toFixed(2));
export const mapMoney = (row, fields) => { const out={...row}; for(const f of fields) if(f in out) out[f]=fromPaise(out[f]); return out; };
