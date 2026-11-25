(function(){"use strict";var m={},c={};function r(n){if(c[n])return c[n].exports;var o={exports:{}};c[n]=o;m[n](o,o.exports,r);return o.exports}
m["./core"]=function(module,exports,require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.varName = exports.esc = exports.totals = exports.amortI = exports.amortN = exports.excelNpvTrap = exports.signChanges = exports.npvAt = exports.expand = exports.MAX_COUNT = exports.MAX_GROUPS = exports.pyOf = exports.tvmOf = exports.PPY = exports.money = exports.PRECISION = exports.irrShowable = exports.shows = exports.disp = exports.CALC_NAME = exports.CALC_IDS = void 0;
exports.fixed = fixed;
exports.group = group;
exports.typed = typed;
exports.parseNum = parseNum;
exports.inputText = inputText;
exports.tvmResidual = tvmResidual;
exports.tvmSolve = tvmSolve;
exports.tvmShown = tvmShown;
exports.tvmSteps = tvmSteps;
exports.answerDisplay = answerDisplay;
exports.tvmIssues = tvmIssues;
exports.tvmMistakes = tvmMistakes;
exports.irrOf = irrOf;
exports.payback = payback;
exports.npvSteps = npvSteps;
exports.npvMistakes = npvMistakes;
exports.schedule = schedule;
exports.calcAmort = calcAmort;
exports.priceSteps = priceSteps;
exports.sacSteps = sacSteps;
exports.keysHtml = keysHtml;
exports.keysPanel = keysPanel;
exports.tvmResults = tvmResults;
exports.mistakeText = mistakeText;
exports.npvResults = npvResults;
exports.amortResults = amortResults;
exports.scheduleCsv = scheduleCsv;
exports.CALC_IDS = ['hp12c', 'baii', 'hp10bii'];
exports.CALC_NAME = { hp12c: 'HP 12C', baii: 'BA II Plus', hp10bii: 'HP 10bII+' };
function fixed(x, d) {
    var _a;
    if (!isFinite(x))
        return 'NaN';
    const neg = x < 0;
    const s = Math.abs(x).toFixed(Math.min(d + 8, 20));
    const [int, frac = ''] = s.split('.');
    let digits = (int + frac.slice(0, d)).split('').map(Number);
    if (Number((_a = frac[d]) !== null && _a !== void 0 ? _a : '0') >= 5) {
        let k = digits.length - 1;
        while (k >= 0) {
            if (digits[k] < 9) {
                digits[k]++;
                break;
            }
            digits[k] = 0;
            k--;
        }
        if (k < 0)
            digits = [1, ...digits];
    }
    const all = digits.join('');
    const ip = all.slice(0, all.length - d) || '0', fp = all.slice(all.length - d);
    const out = d ? `${ip}.${fp}` : ip;
    return neg && /[1-9]/.test(out) ? `-${out}` : out;
}
function group(s, lang) {
    const neg = s.startsWith('-');
    const [int, frac] = s.replace('-', '').split('.');
    const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'pt' ? '.' : ',');
    return `${neg ? '-' : ''}${g}${frac !== undefined ? (lang === 'pt' ? ',' : '.') + frac : ''}`;
}
const disp = (x, lang) => group(fixed(x, 2), lang);
exports.disp = disp;
const shows = (x) => isFinite(x) && (x === 0 || Math.abs(x) >= 0.005) && Math.abs(x) < 1e8;
exports.shows = shows;
const dsp = (x, lang, label = '') => ((0, exports.shows)(x) ? `${label}${(0, exports.disp)(x, lang)}` : null);
const irrShowable = (irr) => isFinite(irr) && irr > -0.55 && irr < 9.9;
exports.irrShowable = irrShowable;
exports.PRECISION = { hp12c: 10, baii: 13, hp10bii: 12 };
const sig = (x, p) => Number(x.toPrecision(p));
const money = (x, lang, d = 2) => group(fixed(x, d), lang);
exports.money = money;
function typed(x) {
    const a = Math.abs(x);
    let s = a.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
    const digits = s.replace('.', '').replace(/^0+/, '').length;
    if (digits > 10)
        s = String(Number(a.toPrecision(10)));
    return s;
}
function parseNum(raw, lang) {
    let s = raw.trim().replace(/\s/g, '').replace(/^\+/, '').replace('−', '-');
    if (!s)
        return NaN;
    if (lang === 'pt') {
        if (s.includes(','))
            s = s.replace(/\./g, '').replace(',', '.');
        else if (/^-?\d{1,3}(\.\d{3})+$/.test(s))
            s = s.replace(/\./g, '');
    }
    else
        s = s.replace(/,/g, '');
    return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? Number(s) : NaN;
}
function inputText(x, lang) {
    const s = String(Number(x.toPrecision(12)));
    return lang === 'pt' ? s.replace('.', ',') : s;
}
exports.PPY = [12, 4, 2, 1];
const SIGN = {
    loan: { pv: 1, pmt: -1, fv: -1 },
    save: { pv: -1, pmt: -1, fv: 1 },
};
const tvmOf = (s) => ({
    n: s.nUnit === 'year' ? s.n * s.ppy : s.n,
    i: s.ratePer === 'year' ? s.rate / 100 / s.ppy : s.rate / 100,
    pv: SIGN[s.kind].pv * s.pv, pmt: SIGN[s.kind].pmt * s.pmt, fv: SIGN[s.kind].fv * s.fv, b: s.begin,
});
exports.tvmOf = tvmOf;
const pyOf = (s) => (s.ratePer === 'year' ? s.ppy : 1);
exports.pyOf = pyOf;
function tvmResidual(t) {
    if (Math.abs(t.i) < 1e-12)
        return t.pv + t.pmt * t.n + t.fv;
    const g = (1 + t.i) ** t.n;
    return t.pv * g + t.pmt * (1 + (t.b ? t.i : 0)) * (g - 1) / t.i + t.fv;
}
function tvmSolve(t, v) {
    const { n, i, pv, pmt, fv, b } = t;
    const g = (1 + i) ** n, a = Math.abs(i) < 1e-12 ? n : (g - 1) / i, k = 1 + (b ? i : 0);
    if (v === 'fv')
        return -(pv * g + pmt * k * a);
    if (v === 'pv')
        return -(fv + pmt * k * a) / g;
    if (v === 'pmt')
        return a === 0 ? NaN : -(pv * g + fv) / (k * a);
    if (v === 'n') {
        if (Math.abs(i) < 1e-12)
            return pmt === 0 ? NaN : -(pv + fv) / pmt;
        const num = pmt * k - fv * i, den = pmt * k + pv * i;
        const x = num / den;
        return x > 0 && isFinite(x) ? Math.log(x) / Math.log(1 + i) : NaN;
    }
    const f = (r) => tvmResidual(Object.assign(Object.assign({}, t), { i: r }));
    const pos = [1e-9, 1e-4, 1e-3, 0.002, 0.005, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1, 0.15, 0.2, 0.3, 0.5, 0.75, 1, 2, 5, 10];
    const neg = [1e-9, -1e-4, -1e-3, -0.01, -0.05, -0.1, -0.2, -0.5, -0.9, -0.99];
    const pairs = [];
    for (let j = 0; j + 1 < pos.length; j++)
        pairs.push([pos[j], pos[j + 1]]);
    for (let j = 0; j + 1 < neg.length; j++)
        pairs.push([neg[j + 1], neg[j]]);
    for (const [lo0, hi0] of pairs) {
        let lo = lo0, hi = hi0, flo = f(lo), fhi = f(hi);
        if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0)
            continue;
        for (let it = 0; it < 200; it++) {
            const m = (lo + hi) / 2, fm = f(m);
            if (flo * fm <= 0) {
                hi = m;
                fhi = fm;
            }
            else {
                lo = m;
                flo = fm;
            }
        }
        return (lo + hi) / 2;
    }
    return NaN;
}
function tvmShown(calc, s, value) {
    if (s.solve === 'rate')
        return value * 100 * (calc === 'hp12c' ? 1 : (0, exports.pyOf)(s));
    if (s.solve === 'n' && calc === 'hp12c') {
        const f = value - Math.floor(value);
        return f < 0.005 ? Math.floor(value) : Math.ceil(value);
    }
    return value;
}
const BA_LABEL = { n: 'N', rate: 'I/Y', pv: 'PV', pmt: 'PMT', fv: 'FV' };
const KEY = {
    baii: { n: 'N', rate: 'IY', pv: 'PV', pmt: 'PMT', fv: 'FV' },
    hp12c: { n: 'N', rate: 'I', pv: 'PV', pmt: 'PMT', fv: 'FV' },
    hp10bii: { n: 'N', rate: 'I/YR', pv: 'PV', pmt: 'PMT', fv: 'FV' },
};
const signed = (x, key) => `${typed(x)}${x < 0 ? ' CHS' : ''} ${key}`;
const tx = (lang, en, pt) => (lang === 'en' ? en : pt);
const nt = (x, lang) => group(String(Number(x.toPrecision(12))), lang);
function tvmSteps(calc, s, lang) {
    const t = (0, exports.tvmOf)(s), py = (0, exports.pyOf)(s), out = [];
    const known = ['n', 'rate', 'pv', 'pmt', 'fv'].filter((v) => v !== s.solve);
    const value = tvmSolve(t, s.solve);
    const shown = tvmShown(calc, s, value);
    const amt = (v) => t[v];
    const say = {
        n: tx(lang, `Number of payments: ${nt(t.n, lang)}.`, `Número de pagamentos: ${nt(t.n, lang)}.`),
        rate: '',
        pv: tx(lang, `Present value${t.pv < 0 ? ', negative: money you put in' : t.pv > 0 ? ', positive: money you receive' : ''}.`, `Valor presente${t.pv < 0 ? ', negativo: dinheiro que sai do seu bolso' : t.pv > 0 ? ', positivo: dinheiro que você recebe' : ''}.`),
        pmt: tx(lang, `Payment${t.pmt < 0 ? ', negative: you pay it' : ', positive: you receive it'}.`, `Parcela${t.pmt < 0 ? ', negativa: você paga' : ', positiva: você recebe'}.`),
        fv: tx(lang, `Future value${t.fv < 0 ? ', negative: you pay it at the end' : ', positive: you receive it at the end'}.`, `Valor futuro${t.fv < 0 ? ', negativo: você paga no fim' : ', positivo: você recebe no fim'}.`),
    };
    const pyText = s.ratePer === 'year'
        ? tx(lang, `${nt(py, lang)} payment${py === 1 ? '' : 's'} per year`, `${nt(py, lang)} pagamento${py === 1 ? '' : 's'} por ano`)
        : tx(lang, '1, because the rate is per period', '1, porque a taxa é por período');
    const solveSay = tx(lang, 'The answer.', 'A resposta.');
    if (calc === 'baii') {
        out.push({ keys: 's:FV', say: tx(lang, 'CLR TVM: N, I/Y, PV, PMT and FV back to 0.', 'CLR TVM: N, I/Y, PV, PMT e FV voltam a 0.'), display: (0, exports.disp)(0, lang) });
        out.push({ keys: `s:IY ${py} ENTER`, say: tx(lang, `P/Y = ${pyText} (C/Y follows).`, `P/Y = ${pyText} (o C/Y acompanha).`), display: `P/Y= ${(0, exports.disp)(py, lang)}` });
        out.push({ keys: 's:CPT', say: tx(lang, 'QUIT.', 'QUIT.'), display: (0, exports.disp)(0, lang) });
        out.push({ keys: 's:PMT', say: tx(lang, s.begin ? 'BGN worksheet: it shows END or BGN.' : 'BGN worksheet: it should show END. If it shows BGN, press 2ND SET.', s.begin ? 'Planilha BGN: mostra END ou BGN.' : 'Planilha BGN: deve mostrar END. Se mostrar BGN, aperte 2ND SET.'), display: 'END' });
        if (s.begin)
            out.push({ keys: 's:ENTER', say: tx(lang, 'SET until BGN shows: payments at the start of each period.', 'SET até aparecer BGN: pagamentos no início de cada período.'), display: 'BGN' });
        out.push({ keys: 's:CPT', say: tx(lang, 'QUIT.', 'QUIT.'), display: (0, exports.disp)(0, lang) });
        for (const v of known) {
            if (v === 'n')
                out.push({ keys: `${typed(t.n)} N`, say: say.n, display: `N= ${(0, exports.disp)(t.n, lang)}` });
            else if (v === 'rate')
                out.push({ keys: `${typed(s.rate)} IY`, say: s.ratePer === 'year' ? tx(lang, 'The yearly rate in percent (the calculator divides by P/Y).', 'A taxa anual em porcentagem (a calculadora divide pelo P/Y).') : tx(lang, 'The rate per period in percent.', 'A taxa por período em porcentagem.'), display: `I/Y= ${(0, exports.disp)(s.rate, lang)}` });
            else if (amt(v) !== 0)
                out.push({ keys: signed(amt(v), KEY.baii[v]), say: say[v], display: dsp(amt(v), lang, `${BA_LABEL[v]}= `) });
        }
        out.push({ keys: `CPT ${KEY.baii[s.solve]}`, say: solveSay, display: dsp(shown, lang, `${BA_LABEL[s.solve]}= `), answer: true });
        if (s.begin)
            out.push({ keys: 's:PMT s:ENTER s:CPT', say: tx(lang, 'Back to END for the next problem.', 'Volta para END para a próxima conta.'), display: (0, exports.shows)(shown) ? (0, exports.disp)(0, lang) : null });
        return out;
    }
    if (calc === 'hp12c') {
        out.push({ keys: 'f:XY', say: tx(lang, 'CLEAR FIN: n, i, PV, PMT and FV back to 0 (the display does not change).', 'CLEAR FIN: n, i, PV, PMT e FV voltam a 0 (o visor não muda).'), display: null, same: true });
        out.push({ keys: s.begin ? 'g:7' : 'g:8', say: s.begin ? tx(lang, 'BEG: payments at the start of each period (BEGIN shows on the display).', 'BEG: pagamentos no início de cada período (aparece BEGIN no visor).') : tx(lang, 'END: payments at the end of each period (BEGIN must not show).', 'END: pagamentos no fim de cada período (o BEGIN não pode aparecer).'), display: null, same: true });
        for (const v of known) {
            if (v === 'n')
                out.push({ keys: `${typed(t.n)} N`, say: say.n, display: (0, exports.disp)(t.n, lang) });
            else if (v === 'rate') {
                if (s.ratePer === 'period' || s.ppy === 1)
                    out.push({ keys: `${typed(s.rate)} I`, say: tx(lang, 'The rate per period in percent.', 'A taxa por período em porcentagem.'), display: (0, exports.disp)(t.i * 100, lang) });
                else if (s.ppy === 12)
                    out.push({ keys: `${typed(s.rate)} g:I`, say: tx(lang, '12÷: the yearly rate divided by 12, stored in i.', '12÷: a taxa anual dividida por 12, guardada em i.'), display: (0, exports.disp)(t.i * 100, lang) });
                else
                    out.push({ keys: `${typed(s.rate)} ENTER ${s.ppy} DIV I`, say: tx(lang, `The yearly rate divided by ${s.ppy}: the rate per period, stored in i.`, `A taxa anual dividida por ${s.ppy}: a taxa por período, guardada em i.`), display: (0, exports.disp)(t.i * 100, lang) });
            }
            else if (amt(v) !== 0)
                out.push({ keys: signed(amt(v), KEY.hp12c[v]), say: say[v], display: dsp(amt(v), lang) });
        }
        if (s.solve === 'rate') {
            const yearly = s.ratePer === 'year' && s.ppy > 1;
            out.push({ keys: 'I', say: tx(lang, 'The rate per period.', 'A taxa por período.'), display: dsp(shown, lang), answer: !yearly });
            if (yearly)
                out.push({ keys: `${s.ppy} TIMES`, say: tx(lang, 'Times the payments per year: the yearly rate.', 'Vezes os pagamentos por ano: a taxa anual.'), display: dsp(shown * s.ppy, lang), answer: true });
        }
        else
            out.push({ keys: KEY.hp12c[s.solve], say: s.solve === 'n' ? tx(lang, 'The answer (the 12C rounds n up to a whole number).', 'A resposta (a 12C arredonda o n para cima, para um número inteiro).') : solveSay, display: dsp(shown, lang), answer: true });
        return out;
    }
    out.push({ keys: 'o:C', say: tx(lang, 'C ALL: clears the TVM values and sets END (P/YR is kept).', 'C ALL: limpa os valores do TVM e põe em END (o P/YR fica).'), display: (0, exports.disp)(0, lang) });
    out.push({ keys: `${py} o:PMT`, say: tx(lang, `P/YR = ${pyText}.`, `P/YR = ${pyText}.`), display: (0, exports.disp)(py, lang) });
    if (s.begin)
        out.push({ keys: 'o:MAR', say: tx(lang, 'BEG/END: BEGIN shows, payments at the start of each period.', 'BEG/END: aparece BEGIN, pagamentos no início de cada período.'), display: null, same: true });
    for (const v of known) {
        if (v === 'n')
            out.push({ keys: `${typed(t.n)} N`, say: say.n, display: (0, exports.disp)(t.n, lang) });
        else if (v === 'rate')
            out.push({ keys: `${typed(s.rate)} I/YR`, say: s.ratePer === 'year' ? tx(lang, 'The yearly rate in percent (the calculator divides by P/YR).', 'A taxa anual em porcentagem (a calculadora divide pelo P/YR).') : tx(lang, 'The rate per period in percent.', 'A taxa por período em porcentagem.'), display: (0, exports.disp)(s.rate, lang) });
        else if (amt(v) !== 0)
            out.push({ keys: signed(amt(v), KEY.hp10bii[v]), say: say[v], display: dsp(amt(v), lang) });
    }
    out.push({ keys: KEY.hp10bii[s.solve], say: solveSay, display: dsp(shown, lang), answer: true });
    if (s.begin)
        out.push({ keys: 'o:MAR', say: tx(lang, 'Back to END for the next problem.', 'Volta para END para a próxima conta.'), display: null, same: true });
    return out;
}
function answerDisplay(calc, s, lang) {
    return tvmSteps(calc, s, lang).find((x) => x.answer).display;
}
function tvmIssues(s) {
    const t = (0, exports.tvmOf)(s), out = [];
    if (s.solve !== 'n' && (!Number.isInteger(Math.round(t.n * 1e9) / 1e9) || t.n < 1))
        out.push('n-int');
    if (t.n > 9999)
        out.push('n-range');
    const v = tvmSolve(t, s.solve);
    if (!isFinite(v))
        out.push('nosol');
    return out;
}
function tvmMistakes(calc, s) {
    const out = [];
    const nPay = (0, exports.tvmOf)(s).n;
    if (s.solve !== 'rate') {
        const py = (0, exports.pyOf)(s);
        let wrong;
        if (calc === 'baii')
            wrong = py !== 1 ? Object.assign(Object.assign({}, s), { ratePer: 'period' }) : Object.assign(Object.assign({}, s), { ratePer: 'year', ppy: 12, nUnit: 'pay', n: nPay });
        else if (calc === 'hp12c')
            wrong = py !== 1 ? Object.assign(Object.assign({}, s), { ratePer: 'period' }) : undefined;
        else
            wrong = py !== 12 ? Object.assign(Object.assign({}, s), { ratePer: 'year', ppy: 12, nUnit: 'pay', n: nPay }) : Object.assign(Object.assign({}, s), { ratePer: 'period' });
        if (wrong)
            out.push({ id: 'py', state: wrong });
    }
    out.push({ id: 'timing', state: Object.assign(Object.assign({}, s), { begin: !s.begin }) });
    if (s.solve !== 'n' && s.ppy > 1 && nPay % s.ppy === 0)
        out.push({ id: 'years', state: Object.assign(Object.assign({}, s), { nUnit: 'pay', n: nPay / s.ppy }) });
    const right = answerDisplay(calc, s, 'en');
    return out.filter((m) => { const d = answerDisplay(calc, m.state, 'en'); return d !== null && d !== right; });
}
exports.MAX_GROUPS = 20;
exports.MAX_COUNT = 99;
const expand = (s) => [s.cf0, ...s.flows.flatMap((f) => Array(f.k).fill(f.a))];
exports.expand = expand;
const npvAt = (r, cfs) => cfs.reduce((sum, c, t) => sum + c / (1 + r) ** t, 0);
exports.npvAt = npvAt;
const signChanges = (cfs) => {
    let n = 0, last = 0;
    for (const c of cfs) {
        if (c === 0)
            continue;
        if (last && Math.sign(c) !== last)
            n++;
        last = Math.sign(c);
    }
    return n;
};
exports.signChanges = signChanges;
function irrOf(cfs) {
    if ((0, exports.signChanges)(cfs) !== 1)
        return NaN;
    const f = (r) => (0, exports.npvAt)(r, cfs);
    let lo = -0.9999, hi = 1;
    while (f(lo) * f(hi) > 0 && hi < 1e6)
        hi *= 2;
    if (f(lo) * f(hi) > 0)
        return NaN;
    for (let it = 0; it < 300; it++) {
        const m = (lo + hi) / 2;
        if (f(lo) * f(m) <= 0)
            hi = m;
        else
            lo = m;
    }
    return (lo + hi) / 2;
}
function payback(cfs, r = 0) {
    const d = cfs.map((c, t) => c / (1 + r) ** t);
    let sum = d[0];
    if (sum >= 0)
        return 0;
    for (let t = 1; t < d.length; t++) {
        if (sum + d[t] >= 0 && d[t] > 0)
            return t - 1 + -sum / d[t];
        sum += d[t];
    }
    return NaN;
}
function npvSteps(calc, s, lang, o = {}) {
    var _a;
    const cfs = (0, exports.expand)(s), r = s.rate / 100;
    const rr = o.skipPyr ? r / o.skipPyr : r;
    const npv = (0, exports.npvAt)(rr, cfs), irr = irrOf(cfs);
    const irrShown = irr * 100 * ((_a = o.skipPyr) !== null && _a !== void 0 ? _a : 1);
    const out = [];
    const two = (j) => String(j).padStart(2, '0');
    const cf0say = tx(lang, `CF0, today${s.cf0 < 0 ? ': negative, money that goes out' : ''}.`, `CF0, hoje${s.cf0 < 0 ? ': negativo, dinheiro que sai' : ''}.`);
    const flowSay = (j, f) => {
        const first = 1 + s.flows.slice(0, j - 1).reduce((x, g) => x + g.k, 0), last = first + f.k - 1;
        return f.k === 1 ? tx(lang, `Period ${first}.`, `Período ${first}.`) : tx(lang, `Periods ${first} to ${last}.`, `Períodos ${first} a ${last}.`);
    };
    const countSay = (f) => (f.k === 1 ? tx(lang, 'It happens once.', 'Acontece uma vez.') : tx(lang, `It happens ${f.k} times in a row.`, `Acontece ${f.k} vezes seguidas.`));
    const irrSay = tx(lang, 'IRR in percent per period.', 'TIR em porcentagem por período.');
    const irrOk = (0, exports.irrShowable)(irr) && (0, exports.shows)(irrShown);
    if (calc === 'baii') {
        out.push({ keys: 'CF s:CE_C', say: tx(lang, 'Cash-flow worksheet, then CLR WORK to erase old flows.', 'Planilha de fluxo de caixa e CLR WORK para apagar fluxos antigos.'), display: `CFo= ${(0, exports.disp)(0, lang)}` });
        out.push({ keys: `${typed(s.cf0)}${s.cf0 < 0 ? ' CHS' : ''} ENTER`, say: cf0say, display: `CFo= ${(0, exports.disp)(s.cf0, lang)}` });
        s.flows.forEach((f, j) => {
            out.push({ keys: `DOWN ${typed(f.a)}${f.a < 0 ? ' CHS' : ''} ENTER`, say: flowSay(j + 1, f), display: `C${two(j + 1)}= ${(0, exports.disp)(f.a, lang)}` });
            out.push({ keys: f.k === 1 ? 'DOWN' : `DOWN ${f.k} ENTER`, say: countSay(f), display: `F${two(j + 1)}= ${(0, exports.disp)(f.k, lang)}` });
        });
        out.push({ keys: `NPV ${typed(s.rate)} ENTER`, say: tx(lang, 'NPV worksheet: the discount rate I, in percent per period.', 'Planilha NPV: a taxa de desconto I, em porcentagem por período.'), display: `I= ${(0, exports.disp)(s.rate, lang)}` });
        out.push({ keys: 'DOWN CPT', say: tx(lang, 'NPV.', 'VPL (NPV).'), display: dsp(npv, lang, 'NPV= ') });
        out.push({ keys: 'IRR CPT', say: irrSay, display: irrOk ? `IRR= ${(0, exports.disp)(irrShown, lang)}` : null });
        return out;
    }
    if (calc === 'hp12c') {
        out.push({ keys: 'f:CLX', say: tx(lang, 'CLEAR REG: erase old cash flows and registers.', 'CLEAR REG: apaga fluxos e registros antigos.'), display: (0, exports.disp)(0, lang) });
        out.push({ keys: `${typed(s.cf0)}${s.cf0 < 0 ? ' CHS' : ''} g:PV`, say: cf0say, display: (0, exports.disp)(s.cf0, lang) });
        s.flows.forEach((f, j) => {
            out.push({ keys: `${typed(f.a)}${f.a < 0 ? ' CHS' : ''} g:PMT`, say: flowSay(j + 1, f), display: (0, exports.disp)(f.a, lang) });
            if (f.k > 1)
                out.push({ keys: `${f.k} g:FV`, say: tx(lang, `Nj: ${countSay(f)}`, `Nj: ${countSay(f)}`), display: (0, exports.disp)(f.k, lang) });
        });
        out.push({ keys: `${typed(s.rate)} I`, say: tx(lang, 'The discount rate in percent per period.', 'A taxa de desconto em porcentagem por período.'), display: (0, exports.disp)(s.rate, lang) });
        out.push({ keys: 'f:PV', say: tx(lang, 'NPV.', 'VPL (NPV).'), display: dsp(npv, lang) });
        out.push({ keys: 'f:FV', say: irrSay, display: irrOk ? (0, exports.disp)(irrShown, lang) : null });
        return out;
    }
    out.push({ keys: 'o:C', say: tx(lang, 'C ALL: clears old cash flows.', 'C ALL: apaga fluxos antigos.'), display: (0, exports.disp)(0, lang) });
    if (!o.skipPyr)
        out.push({ keys: '1 o:PMT', say: tx(lang, 'P/YR = 1: one cash flow per period, so IRR/YR is the rate per period.', 'P/YR = 1: um fluxo por período, e o IRR/YR é a taxa por período.'), display: (0, exports.disp)(1, lang) });
    out.push({ keys: `${typed(s.cf0)}${s.cf0 < 0 ? ' CHS' : ''} CFJ`, say: cf0say, display: (0, exports.disp)(s.cf0, lang) });
    s.flows.forEach((f, j) => {
        out.push({ keys: `${typed(f.a)}${f.a < 0 ? ' CHS' : ''} CFJ`, say: flowSay(j + 1, f), display: (0, exports.disp)(f.a, lang) });
        if (f.k > 1)
            out.push({ keys: `${f.k} o:CFJ`, say: tx(lang, `Nj: ${countSay(f)}`, `Nj: ${countSay(f)}`), display: (0, exports.disp)(f.k, lang) });
    });
    out.push({ keys: `${typed(s.rate)} I/YR`, say: tx(lang, 'The discount rate in percent per period.', 'A taxa de desconto em porcentagem por período.'), display: (0, exports.disp)(s.rate, lang) });
    out.push({ keys: 'o:PRC', say: tx(lang, 'NPV.', 'VPL (NPV).'), display: dsp(npv, lang) });
    out.push({ keys: 'o:CST', say: tx(lang, 'IRR/YR: with P/YR = 1, the IRR per period.', 'IRR/YR: com P/YR = 1, a TIR por período.'), display: irrOk ? (0, exports.disp)(irrShown, lang) : null });
    return out;
}
function npvMistakes(calc, s, lang) {
    const out = [];
    const last = (st) => ({ npv: st[st.length - 2].display, irr: st[st.length - 1].display });
    const right = last(npvSteps(calc, s, lang));
    if (s.cf0 < 0)
        out.push(Object.assign({ id: 'cf0-sign' }, last(npvSteps(calc, Object.assign(Object.assign({}, s), { cf0: -s.cf0 }), lang))));
    if (s.flows.some((f) => f.k > 1))
        out.push(Object.assign({ id: 'counts' }, last(npvSteps(calc, Object.assign(Object.assign({}, s), { flows: s.flows.map((f) => (Object.assign(Object.assign({}, f), { k: 1 }))) }), lang))));
    if (calc === 'hp10bii')
        out.push(Object.assign({ id: 'pyr' }, last(npvSteps(calc, s, lang, { skipPyr: 12 }))));
    return out.filter((m) => m.npv !== null && m.npv !== right.npv);
}
const excelNpvTrap = (s) => (0, exports.npvAt)(s.rate / 100, (0, exports.expand)(s)) / (1 + s.rate / 100);
exports.excelNpvTrap = excelNpvTrap;
const amortN = (s) => (s.nUnit === 'year' ? s.n * 12 : s.n);
exports.amortN = amortN;
const amortI = (s) => (s.ratePer === 'year' ? s.rate / 1200 : s.rate / 100);
exports.amortI = amortI;
const r2 = (x) => Number(fixed(x, 2));
function schedule(s, sys = s.sys) {
    const n = (0, exports.amortN)(s), i = (0, exports.amortI)(s), rows = [];
    let bal = s.pv;
    const level = r2(Math.abs(i) < 1e-12 ? s.pv / n : s.pv * i / (1 - (1 + i) ** -n));
    for (let k = 1; k <= n; k++) {
        const int = r2(bal * i);
        let prin = sys === 'price' ? r2(level - int) : r2(bal - r2(s.pv * (n - k) / n));
        if (k === n)
            prin = r2(bal);
        bal = r2(bal - prin);
        rows.push({ k, pay: r2(prin + int), int, prin, bal });
    }
    return rows;
}
const totals = (rows) => {
    var _a, _b, _c, _d;
    return ({
        paid: r2(rows.reduce((x, r) => x + r.pay, 0)), int: r2(rows.reduce((x, r) => x + r.int, 0)),
        first: (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.pay) !== null && _b !== void 0 ? _b : 0, last: (_d = (_c = rows[rows.length - 1]) === null || _c === void 0 ? void 0 : _c.pay) !== null && _d !== void 0 ? _d : 0,
    });
};
exports.totals = totals;
function calcAmort(s, from, to) {
    const i = (0, exports.amortI)(s), n = (0, exports.amortN)(s);
    const pmt = r2(Math.abs(i) < 1e-12 ? s.pv / n : s.pv * i / (1 - (1 + i) ** -n));
    let bal = s.pv, int = 0, prin = 0, intBefore = 0;
    for (let k = 1; k <= to; k++) {
        const ik = r2(bal * i), pk = pmt - ik;
        bal = bal - pk;
        if (k >= from) {
            int += ik;
            prin += pk;
        }
        else
            intBefore += ik;
    }
    return { pmt, int: -int, prin: -prin, bal, intBefore: -intBefore };
}
const tvmForAmort = (s) => ({
    kind: 'loan', solve: 'pmt', n: s.n, nUnit: s.nUnit, rate: s.rate, ratePer: s.ratePer, pv: s.pv, pmt: 0, fv: 0, ppy: 12, begin: false,
});
function priceSteps(calc, s, lang) {
    const out = tvmSteps(calc, tvmForAmort(s), lang);
    const { from: a, to: b } = s;
    const m = calcAmort(s, a, b);
    const range = a === b ? tx(lang, `payment ${a}`, `parcela ${a}`) : tx(lang, `payments ${a} to ${b}`, `parcelas ${a} a ${b}`);
    if (calc === 'baii') {
        out.push({ keys: `s:PV ${a} ENTER`, say: tx(lang, 'AMORT worksheet: P1, the first payment of the range.', 'Planilha AMORT: P1, a primeira parcela do intervalo.'), display: `P1= ${(0, exports.disp)(a, lang)}` });
        out.push({ keys: `DOWN ${b} ENTER`, say: tx(lang, 'P2, the last payment of the range.', 'P2, a última parcela do intervalo.'), display: `P2= ${(0, exports.disp)(b, lang)}` });
        out.push({ keys: 'DOWN', say: tx(lang, `Balance after payment ${b}.`, `Saldo devedor depois da parcela ${b}.`), display: `BAL= ${(0, exports.disp)(m.bal, lang)}` });
        out.push({ keys: 'DOWN', say: tx(lang, `Principal repaid in ${range}.`, `Amortização (principal) em ${range}.`), display: `PRN= ${(0, exports.disp)(m.prin, lang)}` });
        out.push({ keys: 'DOWN', say: tx(lang, `Interest paid in ${range}.`, `Juros pagos em ${range}.`), display: `INT= ${(0, exports.disp)(m.int, lang)}` });
        return out;
    }
    if (calc === 'hp12c') {
        if (a > 1)
            out.push({ keys: `${a - 1} f:N`, say: tx(lang, `AMORT: payments 1 to ${a - 1} first (AMORT always continues from the last payment amortized).`, `AMORT: primeiro as parcelas 1 a ${a - 1} (o AMORT sempre continua de onde parou).`), display: (0, exports.disp)(m.intBefore, lang) });
        out.push({ keys: `${b - a + 1} f:N`, say: tx(lang, `AMORT: interest paid in ${range}.`, `AMORT: juros pagos em ${range}.`), display: (0, exports.disp)(m.int, lang) });
        out.push({ keys: 'XY', say: tx(lang, `x≷y: principal repaid in ${range}.`, `x≷y: amortização (principal) em ${range}.`), display: (0, exports.disp)(m.prin, lang) });
        out.push({ keys: 'RCL PV', say: tx(lang, `RCL PV: the balance after payment ${b}.`, `RCL PV: o saldo devedor depois da parcela ${b}.`), display: (0, exports.disp)(m.bal, lang) });
        return out;
    }
    out.push({ keys: `${a} INPUT ${b} o:FV`, say: tx(lang, `AMORT for ${range}.`, `AMORT das ${range}.`), display: `${a}- ${b}` });
    out.push({ keys: 'EQ', say: tx(lang, `Principal repaid in ${range}.`, `Amortização (principal) em ${range}.`), display: (0, exports.disp)(m.prin, lang) });
    out.push({ keys: 'EQ', say: tx(lang, `Interest paid in ${range}.`, `Juros pagos em ${range}.`), display: (0, exports.disp)(m.int, lang) });
    out.push({ keys: 'EQ', say: tx(lang, `Balance after payment ${b}.`, `Saldo devedor depois da parcela ${b}.`), display: (0, exports.disp)(m.bal, lang) });
    return out;
}
function sacSteps(calc, s, lang, k = s.from) {
    const n = (0, exports.amortN)(s), p = exports.PRECISION[calc];
    const a = sig(s.pv / n, p), prod = sig(a * (k - 1), p), bal = k > 1 ? sig(s.pv - prod, p) : s.pv;
    const rate = s.ratePer === 'year' ? (calc === 'hp12c' ? sig(s.rate / 12, p) : s.rate) : s.rate;
    const int = calc === 'hp12c' ? sig(bal * rate, p) / 100 : sig(sig(bal * rate, p) / (s.ratePer === 'year' ? 1200 : 100), p);
    const pay = sig(a + int, p);
    const rateKeys = s.ratePer === 'year' ? `${typed(s.rate)} ENTER 12 DIV` : typed(s.rate);
    const out = [];
    const sayA = tx(lang, 'Principal per month: the loan ÷ the number of payments.', 'Amortização mensal: o valor financiado ÷ o número de parcelas.');
    const sayStore = tx(lang, 'Keep it in memory 1.', 'Guarda na memória 1.');
    const sayBal = tx(lang, `Balance before payment ${k}: the loan minus ${k - 1} principal payments.`, `Saldo antes da parcela ${k}: o valor financiado menos ${k - 1} amortizações.`);
    const sayInt = tx(lang, `Interest of payment ${k}: the balance times the monthly rate.`, `Juros da parcela ${k}: o saldo vezes a taxa mensal.`);
    const sayPay = tx(lang, `Payment ${k}: principal + interest.`, `Parcela ${k}: amortização + juros.`);
    if (calc === 'hp12c') {
        out.push({ keys: `${typed(s.pv)} ENTER ${n} DIV`, say: sayA, display: (0, exports.disp)(a, lang) });
        out.push({ keys: 'STO 1', say: sayStore, display: (0, exports.disp)(a, lang) });
        if (k > 1) {
            out.push({ keys: `${k - 1} TIMES`, say: tx(lang, `${k - 1} principal payments.`, `${k - 1} amortizações.`), display: (0, exports.disp)(prod, lang) });
            out.push({ keys: `CHS ${typed(s.pv)} PLUS`, say: sayBal, display: (0, exports.disp)(bal, lang) });
        }
        else
            out.push({ keys: typed(s.pv), say: tx(lang, 'Balance before payment 1: the whole loan.', 'Saldo antes da parcela 1: o valor financiado inteiro.'), display: (0, exports.disp)(s.pv, lang) });
        out.push({ keys: `${rateKeys} PCT`, say: sayInt, display: (0, exports.disp)(int, lang) });
        out.push({ keys: 'RCL 1 PLUS', say: sayPay, display: (0, exports.disp)(pay, lang) });
        return out;
    }
    const sto = calc === 'baii' ? 'STO 1' : 'o:RCL 1';
    const div = s.ratePer === 'year' ? 1200 : 100;
    out.push({ keys: `${typed(s.pv)} DIV ${n} EQ`, say: sayA, display: (0, exports.disp)(a, lang) });
    out.push({ keys: sto, say: sayStore, display: (0, exports.disp)(a, lang) });
    if (k > 1) {
        out.push({ keys: `TIMES ${k - 1} EQ`, say: tx(lang, `${k - 1} principal payments.`, `${k - 1} amortizações.`), display: (0, exports.disp)(prod, lang) });
        out.push({ keys: `CHS PLUS ${typed(s.pv)} EQ`, say: sayBal, display: (0, exports.disp)(bal, lang) });
        out.push({ keys: `TIMES ${typed(s.rate)} DIV ${div} EQ`, say: sayInt, display: (0, exports.disp)(int, lang) });
    }
    else
        out.push({ keys: `${typed(s.pv)} TIMES ${typed(s.rate)} DIV ${div} EQ`, say: sayInt, display: (0, exports.disp)(int, lang) });
    out.push({ keys: 'PLUS RCL 1 EQ', say: sayPay, display: (0, exports.disp)(pay, lang) });
    return out;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
exports.esc = esc;
const isNumTok = (t) => /^[0-9.]+$/.test(t);
function keysHtml(cfg, calc, keys) {
    return `<span class="keys">${keys.split(/\s+/).filter(Boolean).map((t) => {
        var _a;
        if (isNumTok(t))
            return `<span class="num">${(0, exports.esc)(cfg.lang === 'pt' ? t.replace('.', ',') : t)}</span>`;
        const c = (_a = cfg.caps[calc]) === null || _a === void 0 ? void 0 : _a[t];
        if (!c)
            throw new Error(`no key cap for ${calc} ${t}`);
        return c;
    }).join('')}</span>`;
}
const lcd = (d, lang, same = false) => (d !== null ? `<span class="lcd">${(0, exports.esc)(d)}</span>` : same ? `<span class="nochg">${lang === 'en' ? 'no change' : 'não muda'}</span>` : '<span class="nochg">—</span>');
const W = {
    step: { en: 'Step', pt: 'Passo' }, keys: { en: 'Keys', pt: 'Teclas' }, display: { en: 'Display shows', pt: 'Mostrador' }, what: { en: 'What it does', pt: 'O que faz' },
    keysFor: { en: 'Keys for these numbers on the', pt: 'Teclas para estes números na' },
    cta: { en: 'Press these keys on your phone: {app}, free on Android', pt: 'Repita estas teclas no celular: {app}, grátis para Android' },
    ctaBtn: { en: 'Open in Google Play', pt: 'Abrir no Google Play' },
    ctaMore: { en: 'About the app', pt: 'Sobre o app' },
    qr: { en: 'Scan to open on your phone', pt: 'Aponte a câmera do celular' },
    wrongTitle: { en: 'Your calculator shows something else?', pt: 'A sua calculadora mostra outro número?' },
    wrongIntro: { en: 'Each of these comes from keying these same numbers with one thing wrong:', pt: 'Cada um destes sai destes mesmos números com uma coisa errada:' },
    youSee: { en: 'You see', pt: 'Você vê' }, why: { en: 'Why', pt: 'Por quê' },
    share: { en: 'Copy a link to these numbers', pt: 'Copiar o link com estes números' }, copied: { en: 'Link copied', pt: 'Link copiado' },
    csv: { en: 'Download the table (CSV)', pt: 'Baixar a tabela (CSV)' },
    noCalc: { en: 'Fix the highlighted field to see the answer.', pt: 'Corrija o campo destacado para ver a resposta.' },
};
const w = (k, lang) => W[k][lang];
function stepsTable(cfg, calc, steps) {
    const L = cfg.lang;
    const rows = steps.map((s, i) => `<tr><td class="n">${i + 1}</td><td>${keysHtml(cfg, calc, s.keys)}</td><td>${lcd(s.display, L, s.same)}</td><td>${(0, exports.esc)(s.say)}</td></tr>`).join('');
    return `<div class="tw"><table class="steps"><thead><tr><th>${w('step', L)}</th><th>${w('keys', L)}</th><th>${w('display', L)}</th><th>${w('what', L)}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function calcPicker(cfg, calc) {
    if (cfg.fixed)
        return '';
    const opts = exports.CALC_IDS.map((c) => `<label class="chip"><input type="radio" name="calc" value="${c}"${c === calc ? ' checked' : ''}><span>${exports.CALC_NAME[c]}</span></label>`).join('');
    return `<div class="seg" role="radiogroup" aria-label="${L(cfg, 'Calculator', 'Calculadora')}">${opts}</div>`;
}
const L = (cfg, en, pt) => (cfg.lang === 'en' ? en : pt);
function keysPanel(cfg, calc, steps, extra = '') {
    const app = cfg.apps[calc];
    const qr = cfg.qr[calc];
    const cta = `<aside class="practise tool-cta"><div><p class="hero-h">${(0, exports.esc)(W.cta[cfg.lang].replace('{app}', app.app))}</p>
<p><a class="play" href="${(0, exports.esc)(app.play)}" data-play>${w('ctaBtn', cfg.lang)}</a> <a class="more-link" href="${(0, exports.esc)(app.page)}">${w('ctaMore', cfg.lang)}</a></p><p class="ios" hidden>${L(cfg, 'Available on Android.', 'Disponível para Android.')}</p></div>
${qr ? `<figure class="qr">${qr}<figcaption>${w('qr', cfg.lang)}</figcaption></figure>` : ''}</aside>`;
    return `<section class="keyspanel"><h2 class="kh">${w('keysFor', cfg.lang)} ${exports.CALC_NAME[calc]}</h2>${calcPicker(cfg, calc)}${stepsTable(cfg, calc, steps)}${extra}${cta}</section>`;
}
const card = (label, value, sub = '', main = false) => `<div class="card${main ? ' main' : ''}"><span class="cl">${(0, exports.esc)(label)}</span><span class="cv">${(0, exports.esc)(value)}</span>${sub ? `<span class="cs">${(0, exports.esc)(sub)}</span>` : ''}</div>`;
const VAR_NAME = {
    n: { en: 'Number of payments', pt: 'Número de pagamentos' },
    rate: { en: 'Interest rate', pt: 'Taxa de juros' },
    pv: { en: 'Present value', pt: 'Valor presente' },
    pmt: { en: 'Payment', pt: 'Parcela' },
    fv: { en: 'Future value', pt: 'Valor futuro' },
};
const varName = (v, lang) => VAR_NAME[v][lang];
exports.varName = varName;
const perName = (ppy, lang) => { var _a; return ((_a = { 12: tx(lang, 'month', 'mês'), 4: tx(lang, 'quarter', 'trimestre'), 2: tx(lang, 'half-year', 'semestre'), 1: tx(lang, 'year', 'ano') }[ppy]) !== null && _a !== void 0 ? _a : ''); };
function tvmResults(cfg, s, calc) {
    const lang = cfg.lang, t = (0, exports.tvmOf)(s);
    const issues = tvmIssues(s);
    if (issues.includes('n-int') || issues.includes('n-range'))
        return `<p class="note">${(0, exports.esc)(L(cfg, 'The number of payments must be a whole number from 1 to 9,999 (with "years", years × payments per year).', 'O número de pagamentos deve ser um número inteiro de 1 a 9.999 (em "anos", anos × pagamentos por ano).'))}</p>`;
    if (issues.includes('nosol'))
        return `<p class="note">${(0, exports.esc)(L(cfg, 'These numbers have no solution: check that money goes in both directions (for a loan, the loan is received and the payments are paid; for savings, the deposits go in and the future value comes out). The calculator would show an error here.', 'Estes números não têm solução: confira se o dinheiro vai nos dois sentidos (num financiamento, o valor é recebido e as parcelas são pagas; numa aplicação, os depósitos entram e o valor futuro sai). A calculadora mostraria um erro.'))}</p>`;
    const v = tvmSolve(t, s.solve);
    const sgn = s.solve === 'n' || s.solve === 'rate' ? 1 : SIGN[s.kind][s.solve];
    const cards = [];
    const per = perName(s.ppy, lang);
    let headline, sub = '';
    if (s.solve === 'rate') {
        const iy = v * 100 * s.ppy, eff = ((1 + v) ** s.ppy - 1) * 100;
        headline = `${(0, exports.money)(v * 100, lang, 4)}% ${tx(lang, 'per', 'ao')} ${per}`;
        sub = s.ppy > 1 ? tx(lang, `${(0, exports.money)(iy, lang, 4)}% a year (nominal), ${(0, exports.money)(eff, lang, 4)}% effective`, `${(0, exports.money)(iy, lang, 4)}% ao ano (nominal), ${(0, exports.money)(eff, lang, 4)}% efetiva`) : '';
    }
    else if (s.solve === 'n') {
        headline = `${(0, exports.money)(v, lang, 2)} ${tx(lang, 'payments', 'pagamentos')}`;
        sub = s.ppy > 1 ? tx(lang, `${(0, exports.money)(v / s.ppy, lang, 2)} years`, `${(0, exports.money)(v / s.ppy, lang, 2)} anos`) : '';
    }
    else
        headline = (0, exports.money)(v * sgn, lang);
    cards.push(card((0, exports.varName)(s.solve, lang), headline, sub, true));
    const pmt = s.solve === 'pmt' ? v : t.pmt, n = s.solve === 'n' ? v : t.n;
    if (pmt !== 0 && s.solve !== 'rate') {
        const totalPay = Math.abs(pmt) * n;
        cards.push(card(tx(lang, 'Total of the payments', 'Soma das parcelas'), (0, exports.money)(totalPay, lang)));
        if (s.kind === 'loan') {
            const pv = s.solve === 'pv' ? v : t.pv, fv = s.solve === 'fv' ? v : t.fv;
            cards.push(card(tx(lang, 'Total interest', 'Total de juros'), (0, exports.money)(totalPay + Math.abs(fv) - Math.abs(pv), lang)));
        }
        else {
            const pv = s.solve === 'pv' ? v : t.pv, fv = s.solve === 'fv' ? v : t.fv;
            cards.push(card(tx(lang, 'Interest earned', 'Juros ganhos'), (0, exports.money)(Math.abs(fv) - totalPay - Math.abs(pv), lang)));
        }
    }
    if (s.solve !== 'rate' && s.ppy > 1) {
        const i = t.i;
        cards.push(card(tx(lang, 'Effective yearly rate', 'Taxa efetiva ao ano'), `${(0, exports.money)(((1 + i) ** s.ppy - 1) * 100, lang, 2)}%`));
    }
    const neg = s.solve !== 'n' && s.solve !== 'rate' && v * sgn < 0;
    const warn = neg ? `<p class="note">${(0, exports.esc)(L(cfg, 'The answer is negative: with these numbers the money flows the other way. Check the Loan / Savings choice.', 'A resposta saiu negativa: com estes números o dinheiro vai no sentido contrário. Confira a escolha Financiamento / Aplicação.'))}</p>` : '';
    const steps = tvmSteps(calc, s, lang);
    const mistakes = tvmMistakes(calc, s);
    const wrongRows = mistakes.map((m) => {
        const shown = answerDisplay(calc, m.state, lang);
        return `<tr><td>${lcd(shown, lang)}</td><td data-l="${w('why', lang)}">${(0, exports.esc)(mistakeText(calc, s, m.id, lang))}</td></tr>`;
    }).join('');
    const wrong = mistakes.length ? `<h3>${w('wrongTitle', lang)}</h3><p>${w('wrongIntro', lang)}</p><div class="tw"><table class="traps"><thead><tr><th>${w('youSee', lang)}</th><th>${w('why', lang)}</th></tr></thead><tbody>${wrongRows}</tbody></table></div>` : '';
    return `<div class="cards-out">${cards.join('')}</div>${warn}${keysPanel(cfg, calc, steps, wrong)}`;
}
function mistakeText(calc, s, id, lang) {
    const py = (0, exports.pyOf)(s);
    if (id === 'timing')
        return s.begin
            ? tx(lang, 'Payments were counted at the end of each period (END). These are at the start: switch to BEGIN.', 'As parcelas foram contadas no fim de cada período (END). Aqui elas são no início: mude para BEGIN.')
            : tx(lang, 'BEGIN is still on from an earlier problem: the first payment is counted today. Switch back to END.', 'O BEGIN ficou ligado de uma conta anterior: a primeira parcela conta como paga hoje. Volte para END.');
    if (id === 'years')
        return tx(lang, 'N was entered in years. N counts payments: years × payments per year.', 'O n foi digitado em anos. O n conta pagamentos: anos × pagamentos por ano.');
    if (calc === 'baii')
        return py !== 1
            ? tx(lang, `P/Y is 1, so the yearly rate was charged on every payment. Set P/Y to ${py}.`, `O P/Y está em 1, e a taxa anual foi cobrada em cada parcela. Ponha o P/Y em ${py}.`)
            : tx(lang, 'P/Y is still 12 from an earlier problem, so the rate was divided by 12. Set P/Y to 1.', 'O P/Y ficou em 12 de uma conta anterior, e a taxa foi dividida por 12. Ponha o P/Y em 1.');
    if (calc === 'hp12c')
        return tx(lang, `The yearly rate went into i as it is. i is the rate per period: divide by ${s.ppy}${s.ppy === 12 ? ' (g 12÷ does it)' : ''}.`, `A taxa anual entrou direto no i. O i é a taxa por período: divida por ${s.ppy}${s.ppy === 12 ? ' (o g 12÷ faz isso)' : ''}.`);
    return py !== 12
        ? tx(lang, `P/YR is 12 (the factory setting, and C ALL keeps it), so the rate was divided by 12. Set P/YR to ${py}.`, `O P/YR está em 12 (o padrão de fábrica, e o C ALL não muda), e a taxa foi dividida por 12. Ponha o P/YR em ${py}.`)
        : tx(lang, 'P/YR is 1 from an earlier problem, so the yearly rate was charged on every payment. Set P/YR to 12.', 'O P/YR ficou em 1 de uma conta anterior, e a taxa anual foi cobrada em cada parcela. Ponha o P/YR em 12.');
}
function npvResults(cfg, s, calc) {
    const lang = cfg.lang, cfs = (0, exports.expand)(s), r = s.rate / 100;
    const npv = (0, exports.npvAt)(r, cfs), irr = irrOf(cfs), changes = (0, exports.signChanges)(cfs);
    const pb = payback(cfs), dpb = payback(cfs, r);
    const inflows = cfs.slice(1).reduce((x, c, t) => x + (c > 0 ? c / (1 + r) ** (t + 1) : 0), 0);
    const pi = s.cf0 < 0 ? (npv - s.cf0) / -s.cf0 : NaN;
    const cards = [
        card(tx(lang, 'NPV', 'VPL'), (0, exports.money)(npv, lang), npv >= 0 ? tx(lang, `≥ 0: the flows earn at least ${nt(s.rate, lang)}% per period`, `≥ 0: os fluxos rendem pelo menos ${nt(s.rate, lang)}% por período`) : tx(lang, `< 0: the flows earn less than ${nt(s.rate, lang)}% per period`, `< 0: os fluxos rendem menos de ${nt(s.rate, lang)}% por período`), true),
        card(tx(lang, 'IRR', 'TIR'), isFinite(irr) ? `${(0, exports.money)(irr * 100, lang, 2)}%` : '—', isFinite(irr) ? tx(lang, 'per period', 'por período') : changes === 0 ? tx(lang, 'needs both negative and positive flows', 'precisa de fluxos negativos e positivos') : tx(lang, 'the signs change more than once: there may be several IRRs', 'o sinal muda mais de uma vez: pode haver várias TIRs')),
        card(tx(lang, 'Payback', 'Payback'), isFinite(pb) ? `${(0, exports.money)(pb, lang, 2)} ${tx(lang, 'periods', 'períodos')}` : '—'),
        card(tx(lang, 'Discounted payback', 'Payback descontado'), isFinite(dpb) ? `${(0, exports.money)(dpb, lang, 2)} ${tx(lang, 'periods', 'períodos')}` : '—'),
    ];
    if (isFinite(pi) && inflows > 0)
        cards.push(card(tx(lang, 'Profitability index', 'Índice de lucratividade'), (0, exports.money)(pi, lang, 2)));
    const steps = npvSteps(calc, s, lang);
    const mistakes = npvMistakes(calc, s, lang);
    const text = {
        'cf0-sign': tx(lang, 'CF0 went in positive (the change-sign key was missed), so the investment counts as money received.', 'O CF0 entrou positivo (faltou a tecla de troca de sinal), e o investimento conta como dinheiro recebido.'),
        counts: tx(lang, 'Each repeated flow was entered once, without its count (Nj / F), so later flows move to earlier periods.', 'Cada fluxo repetido entrou uma vez só, sem a contagem (Nj / F), e os fluxos seguintes mudam de período.'),
        pyr: tx(lang, 'P/YR was left at 12: the rate is divided by 12 for NPV, and IRR/YR comes out 12 times the IRR per period.', 'O P/YR ficou em 12: a taxa é dividida por 12 no VPL, e o IRR/YR sai 12 vezes a TIR por período.'),
    };
    const rows = mistakes.map((m) => `<tr><td>${lcd(m.npv, lang)}</td><td data-l="${w('why', lang)}">${(0, exports.esc)(text[m.id])}</td></tr>`);
    rows.push(`<tr><td>${lcd((0, exports.disp)((0, exports.excelNpvTrap)(s), lang), lang)}</td><td data-l="${w('why', lang)}">${(0, exports.esc)(tx(lang, 'Spreadsheet NPV() with CF0 inside the range: it discounts every flow one period too many. Use =NPV(rate, CF1:CFn) + CF0.', 'VPL() da planilha com o CF0 dentro do intervalo: ela desconta todos os fluxos um período a mais. Use =VPL(taxa; CF1:CFn) + CF0.'))}</td></tr>`);
    const wrong = `<h3>${tx(lang, 'Got a different NPV?', 'Deu outro VPL?')}</h3><p>${w('wrongIntro', lang)}</p><div class="tw"><table class="traps"><thead><tr><th>${w('youSee', lang)}</th><th>${w('why', lang)}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    let cum = 0;
    const pvRows = cfs.map((c, t) => { const d = c / (1 + r) ** t; cum += d; return `<tr><td class="n">${t}</td><td class="r">${(0, exports.money)(c, lang)}</td><td class="r">${(0, exports.money)(d, lang)}</td><td class="r">${(0, exports.money)(cum, lang)}</td></tr>`; });
    const pvTable = `<details class="sched"><summary>${tx(lang, 'Present value of each period', 'Valor presente de cada período')}</summary><div class="tw"><table class="num-t"><thead><tr><th>${tx(lang, 'Period', 'Período')}</th><th>${tx(lang, 'Cash flow', 'Fluxo')}</th><th>${tx(lang, 'Present value', 'Valor presente')}</th><th>${tx(lang, 'Running total', 'Acumulado')}</th></tr></thead><tbody>${pvRows.join('')}</tbody></table></div></details>`;
    return `<div class="cards-out">${cards.join('')}</div>${pvTable}${keysPanel(cfg, calc, steps, wrong)}`;
}
function amortResults(cfg, s, calc, all = false) {
    const lang = cfg.lang, n = (0, exports.amortN)(s);
    const price = schedule(s, 'price'), sac = schedule(s, 'sac');
    const tp = (0, exports.totals)(price), ts = (0, exports.totals)(sac);
    const nm = (sys) => (sys === 'price' ? tx(lang, 'Price (level payment)', 'Tabela Price') : tx(lang, 'SAC (constant principal)', 'SAC'));
    const col = (sys, t) => `<div class="sys${s.sys === sys ? ' on' : ''}"><p class="sys-h">${nm(sys)}</p>
${card(sys === 'price' ? tx(lang, 'Monthly payment', 'Parcela') : tx(lang, 'First payment', 'Primeira parcela'), (0, exports.money)(t.first, lang), sys === 'sac' ? tx(lang, `falls to ${(0, exports.money)(t.last, lang)}`, `cai até ${(0, exports.money)(t.last, lang)}`) : '', true)}
${card(tx(lang, 'Total interest', 'Total de juros'), (0, exports.money)(t.int, lang))}${card(tx(lang, 'Total paid', 'Total pago'), (0, exports.money)(t.paid, lang))}</div>`;
    const diff = tp.int - ts.int;
    const compare = `<p class="cmp">${(0, exports.esc)(tx(lang, `SAC pays ${(0, exports.money)(diff, lang)} less interest; Price starts ${(0, exports.money)(ts.first - tp.first, lang)} lower each month.`, `No SAC você paga ${(0, exports.money)(diff, lang)} a menos de juros; na Price a primeira parcela é ${(0, exports.money)(ts.first - tp.first, lang)} menor.`))}</p>`;
    const rows = schedule(s);
    const cut = !all && rows.length > 14;
    const row = (r) => `<tr><td class="n">${r.k}</td><td class="r">${(0, exports.money)(r.pay, lang)}</td><td class="r">${(0, exports.money)(r.int, lang)}</td><td class="r">${(0, exports.money)(r.prin, lang)}</td><td class="r">${(0, exports.money)(r.bal, lang)}</td></tr>`;
    const body = cut
        ? rows.slice(0, 12).map(row).join('') + `<tr class="gap"><td colspan="5">⋯</td></tr>` + row(rows[rows.length - 1])
        : rows.map(row).join('');
    const table = `<div class="sched-h"><h2>${tx(lang, 'Month-by-month schedule', 'Planilha mês a mês')}: ${nm(s.sys)}</h2><button type="button" class="btn-sm" data-csv>${w('csv', lang)}</button></div>
<div class="tw"><table class="num-t"><thead><tr><th>#</th><th>${tx(lang, 'Payment', 'Parcela')}</th><th>${tx(lang, 'Interest', 'Juros')}</th><th>${tx(lang, 'Principal', 'Amortização')}</th><th>${tx(lang, 'Balance', 'Saldo devedor')}</th></tr></thead><tbody>${body}</tbody></table></div>
${cut ? `<p><button type="button" class="btn-sm" data-expand>${tx(lang, `Show all ${n} months`, `Mostrar os ${n} meses`)}</button></p>` : ''}
<p class="fine">${(0, exports.esc)(tx(lang, 'Amounts are rounded to the cent each month and the last payment closes the balance, as bank schedules do. Taxes, insurance and fees are not included.', 'Valores arredondados ao centavo a cada mês, com a última parcela fechando o saldo, como nas planilhas dos bancos. Sem IOF, seguros e tarifas.'))}</p>`;
    const steps = s.sys === 'price' ? priceSteps(calc, s, lang) : sacSteps(calc, s, lang);
    const note = s.sys === 'sac'
        ? `<p class="fine">${(0, exports.esc)(tx(lang, `SAC has no AMORT key on the calculator: these keys work out payment ${s.from} by hand. The calculator keeps every decimal, so its last digit can differ by a cent from the table.`, `O SAC não tem tecla própria na calculadora: estas teclas calculam a parcela ${s.from} na mão. A calculadora guarda todas as casas decimais, e o último dígito pode diferir em um centavo da tabela.`))}</p>`
        : `<p class="fine">${(0, exports.esc)(tx(lang, 'AMORT rounds each amount to the display (2 decimals), like the table. Set the calculator to 2 decimals for the same last digit.', 'O AMORT arredonda cada valor para o visor (2 casas), como a tabela. Deixe a calculadora com 2 casas para o mesmo último dígito.'))}</p>`;
    return `<div class="cols">${col('price', tp)}${col('sac', ts)}</div>${compare}${table}${keysPanel(cfg, calc, steps, note)}`;
}
function scheduleCsv(s, lang) {
    const sep = lang === 'pt' ? ';' : ',';
    const f = (x) => (lang === 'pt' ? fixed(x, 2).replace('.', ',') : fixed(x, 2));
    const head = lang === 'pt' ? ['Parcela', 'Valor', 'Juros', 'Amortizacao', 'Saldo'] : ['Payment', 'Amount', 'Interest', 'Principal', 'Balance'];
    return [head.join(sep), ...schedule(s).map((r) => [r.k, f(r.pay), f(r.int), f(r.prin), f(r.bal)].join(sep))].join('\r\n') + '\r\n';
}

};
m["./forms"]=function(module,exports,require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tvmForm = tvmForm;
exports.flowRow = flowRow;
exports.npvForm = npvForm;
exports.amortForm = amortForm;
exports.readTvm = readTvm;
exports.readNpv = readNpv;
exports.readAmort = readAmort;
exports.toQuery = toQuery;
exports.fromQuery = fromQuery;
const core_1 = require("./core");
const t = (lang, en, pt) => (lang === 'en' ? en : pt);
function field(name, label, value, extra = '', hint = '', solving = false) {
    return `<label class="fld${extra ? ' wide' : ''}${solving ? ' solving' : ''}" data-f="${name}"><span class="fl">${label}</span><span class="fi"><input name="${name}" inputmode="decimal" autocomplete="off" spellcheck="false" value="${(0, core_1.esc)(value)}"${solving ? ' disabled placeholder="?"' : ''}>${extra}</span>${hint ? `<span class="fh">${hint}</span>` : ''}</label>`;
}
function select(name, value, opts, label) {
    return `<select name="${name}" aria-label="${(0, core_1.esc)(label)}">${opts.map(([v, txt]) => `<option value="${v}"${v === value ? ' selected' : ''}>${(0, core_1.esc)(txt)}</option>`).join('')}</select>`;
}
function seg(name, value, opts, label) {
    return `<div class="seg" role="radiogroup" aria-label="${(0, core_1.esc)(label)}">${opts.map(([v, txt]) => `<label class="chip"><input type="radio" name="${name}" value="${v}"${v === value ? ' checked' : ''}><span>${txt}</span></label>`).join('')}</div>`;
}
const both = (loan, save) => `<span class="k-loan">${loan}</span><span class="k-save">${save}</span>`;
function tvmForm(s, lang) {
    const v = (x) => (0, core_1.inputText)(x, lang);
    const solveOpts = ['pmt', 'pv', 'fv', 'rate', 'n'].map((x) => [x, (0, core_1.varName)(x, lang)]);
    return `<div class="row">${seg('kind', s.kind, [['loan', t(lang, 'Loan', 'Financiamento')], ['save', t(lang, 'Savings / investment', 'Aplicação')]], t(lang, 'Kind of problem', 'Tipo de conta'))}</div>
<div class="row find"><span class="fl">${t(lang, 'Find', 'Calcular')}</span>${seg('solve', s.solve, solveOpts, t(lang, 'Find', 'Calcular'))}</div>
<div class="grid">
${field('pv', both(t(lang, 'Loan amount (PV)', 'Valor financiado (PV)'), t(lang, 'Amount today (PV)', 'Valor inicial (PV)')), v(s.pv), '', '', s.solve === 'pv')}
${field('pmt', both(t(lang, 'Payment (PMT)', 'Parcela (PMT)'), t(lang, 'Deposit each period (PMT)', 'Depósito por período (PMT)')), v(s.pmt), '', '', s.solve === 'pmt')}
${field('fv', both(t(lang, 'Balloon at the end, if any (FV)', 'Saldo no fim, se houver (FV)'), t(lang, 'Future value (FV)', 'Valor futuro (FV)')), v(s.fv), '', '', s.solve === 'fv')}
${field('rate', t(lang, 'Interest rate (I/Y)', 'Taxa de juros (i)'), v(s.rate), select('ratePer', s.ratePer, [['year', t(lang, '% a year', '% ao ano')], ['period', t(lang, '% per period', '% por período')]], t(lang, 'Rate unit', 'Unidade da taxa')), '', s.solve === 'rate')}
${field('n', t(lang, 'Term (N)', 'Prazo (n)'), v(s.n), select('nUnit', s.nUnit, [['pay', t(lang, 'payments', 'pagamentos')], ['year', t(lang, 'years', 'anos')]], t(lang, 'Term unit', 'Unidade do prazo')), '', s.solve === 'n')}
<label class="fld"><span class="fl">${t(lang, 'Payments per year', 'Pagamentos por ano')}</span><span class="fi">${select('ppy', String(s.ppy), [['12', t(lang, '12 (monthly)', '12 (mensal)')], ['4', t(lang, '4 (quarterly)', '4 (trimestral)')], ['2', t(lang, '2 (semiannual)', '2 (semestral)')], ['1', t(lang, '1 (yearly)', '1 (anual)')]], t(lang, 'Payments per year', 'Pagamentos por ano'))}</span></label>
<label class="fld wide"><span class="fl">${t(lang, 'Payments are made', 'Pagamentos')}</span><span class="fi">${select('begin', s.begin ? '1' : '0', [['0', t(lang, 'at the end of each period (END)', 'no fim de cada período (END)')], ['1', t(lang, 'at the start, the first one today (BEGIN)', 'no início, a primeira hoje (BEGIN)')]], t(lang, 'Payment timing', 'Momento dos pagamentos'))}</span></label>
</div>`;
}
function flowRow(f, j, lang) {
    return `<li class="flow"><span class="fno">${t(lang, 'Flow', 'Fluxo')} ${j}</span><input name="a" inputmode="decimal" autocomplete="off" aria-label="${t(lang, `Cash flow ${j}`, `Fluxo ${j}`)}" value="${(0, core_1.esc)((0, core_1.inputText)(f.a, lang))}"><span class="x">×</span><input name="k" inputmode="numeric" autocomplete="off" aria-label="${t(lang, `Times in a row (flow ${j})`, `Vezes seguidas (fluxo ${j})`)}" value="${f.k}"><button type="button" class="rm" data-rm aria-label="${t(lang, `Remove flow ${j}`, `Remover o fluxo ${j}`)}">✕</button></li>`;
}
function npvForm(s, lang) {
    return `<div class="grid">
${field('rate', t(lang, 'Discount rate (% per period)', 'Taxa de desconto (% por período)'), (0, core_1.inputText)(s.rate, lang))}
${field('cf0', t(lang, 'Initial cash flow, CF0 (negative for an investment)', 'Fluxo inicial, CF0 (negativo num investimento)'), (0, core_1.inputText)(s.cf0, lang))}
</div>
<p class="fl flows-h">${t(lang, 'Later cash flows, in order (amount × how many periods in a row)', 'Fluxos seguintes, em ordem (valor × quantos períodos seguidos)')}</p>
<ol class="flows">${s.flows.map((f, j) => flowRow(f, j + 1, lang)).join('')}</ol>
<p><button type="button" class="btn-sm" data-add>${t(lang, '+ Add a cash flow', '+ Adicionar fluxo')}</button> <span class="fh">${t(lang, `Up to ${core_1.MAX_GROUPS} flows, each repeated up to ${core_1.MAX_COUNT} times (the HP 12C's limits).`, `Até ${core_1.MAX_GROUPS} fluxos, cada um repetido até ${core_1.MAX_COUNT} vezes (os limites da HP 12C).`)}</span></p>`;
}
function amortForm(s, lang) {
    const v = (x) => (0, core_1.inputText)(x, lang);
    return `<div class="grid">
${field('pv', t(lang, 'Loan amount', 'Valor financiado'), v(s.pv))}
${field('rate', t(lang, 'Interest rate', 'Taxa de juros'), v(s.rate), select('ratePer', s.ratePer, [['period', t(lang, '% a month', '% ao mês')], ['year', t(lang, '% a year', '% ao ano')]], t(lang, 'Rate unit', 'Unidade da taxa')))}
${field('n', t(lang, 'Term', 'Prazo'), v(s.n), select('nUnit', s.nUnit, [['pay', t(lang, 'months', 'meses')], ['year', t(lang, 'years', 'anos')]], t(lang, 'Term unit', 'Unidade do prazo')))}
</div>
<div class="row"><span class="fl">${t(lang, 'Schedule and keys for', 'Planilha e teclas da')}</span>${seg('sys', s.sys, [['price', t(lang, 'Level payment (Price)', 'Tabela Price')], ['sac', t(lang, 'Constant principal (SAC)', 'SAC')]], t(lang, 'Amortization system', 'Sistema de amortização'))}</div>
<div class="grid">
${field('from', t(lang, 'Keys for payments from', 'Teclas das parcelas de'), String(s.from))}
${field('to', t(lang, 'to', 'até'), String(s.to), '', t(lang, 'SAC: the keys work out the first one', 'SAC: as teclas calculam a primeira'))}
</div>`;
}
const num = (get, name, lang, bad, ok, empty) => {
    const raw = get(name);
    const x = raw.trim() === '' && empty !== undefined ? empty : (0, core_1.parseNum)(raw, lang);
    if (!isFinite(x) || !ok(x))
        bad.push(name);
    return x;
};
const money = (x) => x >= 0 && x < 1e8;
const int = (lo, hi) => (x) => Number.isInteger(x) && x >= lo && x <= hi;
function readTvm(get, lang) {
    const bad = [];
    const solve = get('solve');
    const opt = (name, ok, empty) => (solve === name ? 0 : num(get, name, lang, bad, ok, empty));
    const ppy = Number(get('ppy'));
    const nUnit = get('nUnit') === 'year' ? 'year' : 'pay';
    const state = {
        kind: get('kind') === 'save' ? 'save' : 'loan', solve,
        n: opt('n', nUnit === 'year' ? (x) => x > 0 && Number.isInteger(x * ppy) && x * ppy <= 9999 : int(1, 9999)), nUnit,
        rate: opt('rate', (x) => x >= 0 && x < 1000), ratePer: get('ratePer') === 'period' ? 'period' : 'year',
        pv: opt('pv', money, 0), pmt: opt('pmt', money, 0), fv: opt('fv', money, 0),
        ppy: [12, 4, 2, 1].includes(ppy) ? ppy : 12, begin: get('begin') === '1',
    };
    return { state: bad.length ? null : state, bad };
}
function readNpv(get, rows, lang) {
    const bad = [];
    const rate = num(get, 'rate', lang, bad, (x) => x > -100 && x < 1000);
    const cf0 = num(get, 'cf0', lang, bad, (x) => Math.abs(x) < 1e8);
    const flows = rows.map((r, j) => {
        const a = r.a.trim() === '' ? 0 : (0, core_1.parseNum)(r.a, lang), k = r.k.trim() === '' ? 1 : (0, core_1.parseNum)(r.k, lang);
        if (!isFinite(a) || Math.abs(a) >= 1e8)
            bad.push(`a${j}`);
        if (!int(1, core_1.MAX_COUNT)(k))
            bad.push(`k${j}`);
        return { a, k };
    });
    if (!flows.length || flows.length > core_1.MAX_GROUPS)
        bad.push('flows');
    return { state: bad.length ? null : { cf0, flows, rate }, bad };
}
function readAmort(get, lang) {
    const bad = [];
    const nUnit = get('nUnit') === 'year' ? 'year' : 'pay';
    const s = {
        pv: num(get, 'pv', lang, bad, (x) => x > 0 && x < 1e8),
        rate: num(get, 'rate', lang, bad, (x) => x >= 0 && x < 100),
        ratePer: get('ratePer') === 'year' ? 'year' : 'period',
        n: num(get, 'n', lang, bad, nUnit === 'year' ? int(1, 50) : int(1, 600)), nUnit,
        sys: get('sys') === 'sac' ? 'sac' : 'price',
        from: 1, to: 1,
    };
    const n = isFinite(s.n) ? (0, core_1.amortN)(s) : 1;
    s.from = num(get, 'from', lang, bad, int(1, n));
    s.to = num(get, 'to', lang, bad, (x) => int(1, n)(x) && x >= s.from);
    return { state: bad.length ? null : s, bad };
}
function toQuery(tool, s, calc) {
    const p = [];
    const n = (x) => String(Number(x.toPrecision(12)));
    if (tool === 'tvm') {
        const x = s;
        p.push(['k', x.kind], ['s', x.solve], ['n', n(x.n)], ['nu', x.nUnit], ['r', n(x.rate)], ['rp', x.ratePer], ['pv', n(x.pv)], ['pmt', n(x.pmt)], ['fv', n(x.fv)], ['f', String(x.ppy)], ['b', x.begin ? '1' : '0']);
    }
    else if (tool === 'npv') {
        const x = s;
        p.push(['r', n(x.rate)], ['cf0', n(x.cf0)], ['cf', x.flows.map((f) => `${n(f.a)}*${f.k}`).join('_')]);
    }
    else {
        const x = s;
        p.push(['pv', n(x.pv)], ['r', n(x.rate)], ['rp', x.ratePer], ['n', n(x.n)], ['nu', x.nUnit], ['sys', x.sys], ['a', String(x.from)], ['z', String(x.to)]);
    }
    if (calc)
        p.push(['c', calc]);
    return p.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}
function fromQuery(tool, q, base) {
    const f = (k, d) => { const v = q.get(k); const x = v === null ? NaN : Number(v); return isFinite(x) ? x : d; };
    const one = (k, opts, d) => { const v = q.get(k); return v && opts.includes(v) ? v : d; };
    const c = q.get('c');
    const calc = c && core_1.CALC_IDS.includes(c) ? c : undefined;
    if (tool === 'tvm') {
        const b = base;
        return { calc, state: {
                kind: one('k', ['loan', 'save'], b.kind), solve: one('s', ['n', 'rate', 'pv', 'pmt', 'fv'], b.solve),
                n: f('n', b.n), nUnit: one('nu', ['pay', 'year'], b.nUnit), rate: f('r', b.rate), ratePer: one('rp', ['year', 'period'], b.ratePer),
                pv: f('pv', b.pv), pmt: f('pmt', b.pmt), fv: f('fv', b.fv), ppy: [12, 4, 2, 1].includes(f('f', b.ppy)) ? f('f', b.ppy) : b.ppy, begin: q.has('b') ? q.get('b') === '1' : b.begin,
            } };
    }
    if (tool === 'npv') {
        const b = base;
        const cf = q.get('cf');
        let flows = b.flows;
        if (cf) {
            const parsed = cf.split('_').map((x) => { const [a, k] = x.split('*'); return { a: Number(a), k: Number(k !== null && k !== void 0 ? k : '1') }; });
            if (parsed.length && parsed.length <= core_1.MAX_GROUPS && parsed.every((x) => isFinite(x.a) && Number.isInteger(x.k) && x.k >= 1 && x.k <= core_1.MAX_COUNT))
                flows = parsed;
        }
        return { calc, state: { rate: f('r', b.rate), cf0: f('cf0', b.cf0), flows } };
    }
    const b = base;
    return { calc, state: {
            pv: f('pv', b.pv), rate: f('r', b.rate), ratePer: one('rp', ['year', 'period'], b.ratePer), n: f('n', b.n), nUnit: one('nu', ['pay', 'year'], b.nUnit),
            sys: one('sys', ['price', 'sac'], b.sys), from: f('a', b.from), to: f('z', b.to),
        } };
}

};
m["./ui"]=function(module,exports,require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const forms_1 = require("./forms");
function start() {
    var _a;
    const root = document.querySelector('[data-tool]');
    const bootEl = document.getElementById('tool-boot');
    if (!root || !bootEl)
        return;
    const boot = JSON.parse(bootEl.textContent || '{}');
    const { tool, cfg } = boot;
    const lang = cfg.lang;
    const form = root.querySelector('form');
    const out = root.querySelector('.tool-out');
    let calc = boot.calc;
    let all = false;
    let current = boot.state;
    const els = (name) => Array.from(form.querySelectorAll(`[name="${name}"]`));
    const get = (name) => {
        var _a, _b, _c, _d;
        const list = els(name);
        const radio = list.find((e) => e instanceof HTMLInputElement && e.type === 'radio');
        if (radio)
            return (_b = (_a = list.find((e) => e.checked)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        return (_d = (_c = list[0]) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : '';
    };
    const set = (name, value) => {
        for (const e of els(name)) {
            if (e instanceof HTMLInputElement && e.type === 'radio')
                e.checked = e.value === value;
            else
                e.value = value;
        }
    };
    function fill(s) {
        if (tool === 'tvm') {
            const x = s;
            set('kind', x.kind);
            set('solve', x.solve);
            set('ratePer', x.ratePer);
            set('nUnit', x.nUnit);
            set('ppy', String(x.ppy));
            set('begin', x.begin ? '1' : '0');
            for (const k of ['n', 'rate', 'pv', 'pmt', 'fv'])
                set(k, (0, core_1.inputText)(x[k], lang));
        }
        else if (tool === 'npv') {
            const x = s;
            set('rate', (0, core_1.inputText)(x.rate, lang));
            set('cf0', (0, core_1.inputText)(x.cf0, lang));
            form.querySelector('.flows').innerHTML = x.flows.map((f, j) => (0, forms_1.flowRow)(f, j + 1, lang)).join('');
        }
        else {
            const x = s;
            set('pv', (0, core_1.inputText)(x.pv, lang));
            set('rate', (0, core_1.inputText)(x.rate, lang));
            set('ratePer', x.ratePer);
            set('n', (0, core_1.inputText)(x.n, lang));
            set('nUnit', x.nUnit);
            set('sys', x.sys);
            set('from', String(x.from));
            set('to', String(x.to));
        }
    }
    function read() {
        if (tool === 'tvm')
            return (0, forms_1.readTvm)(get, lang);
        if (tool === 'npv') {
            const rows = Array.from(form.querySelectorAll('.flow')).map((li) => ({
                a: li.querySelector('[name="a"]').value, k: li.querySelector('[name="k"]').value,
            }));
            return (0, forms_1.readNpv)(get, rows, lang);
        }
        return (0, forms_1.readAmort)(get, lang);
    }
    function mark(bad) {
        var _a, _b;
        form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
        for (const b of bad) {
            const m = /^([ak])(\d+)$/.exec(b);
            if (m && tool === 'npv')
                (_b = (_a = form.querySelectorAll('.flow')[Number(m[2])]) === null || _a === void 0 ? void 0 : _a.querySelector(`[name="${m[1]}"]`)) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-invalid', 'true');
            else
                els(b).forEach((e) => e.setAttribute('aria-invalid', 'true'));
        }
    }
    let shown = '';
    function render() {
        if (!current)
            return;
        const html = tool === 'tvm' ? (0, core_1.tvmResults)(cfg, current, calc) : tool === 'npv' ? (0, core_1.npvResults)(cfg, current, calc) : (0, core_1.amortResults)(cfg, current, calc, all);
        if (html === shown && !out.querySelector('.fixit'))
            return;
        shown = html;
        out.innerHTML = html;
        if (/iPhone|iPad|iPod/.test(navigator.userAgent || '')) {
            out.querySelectorAll('[data-play]').forEach((a) => { a.hidden = true; });
            out.querySelectorAll('.ios').forEach((p) => { p.hidden = false; });
        }
    }
    function update(remember = true) {
        var _a, _b;
        if (tool === 'tvm') {
            const solve = get('solve');
            root.dataset.kind = get('kind');
            form.querySelectorAll('[data-f]').forEach((f) => {
                const on = f.dataset.f === solve;
                f.classList.toggle('solving', on);
                const input = f.querySelector('input');
                if (input) {
                    input.disabled = on;
                    input.placeholder = on ? '?' : '';
                }
            });
        }
        const r = read();
        mark(r.bad);
        if (!r.state) {
            (_a = out.querySelector('.cards-out, .cols')) === null || _a === void 0 ? void 0 : _a.classList.add('stale');
            const msg = (_b = out.querySelector('.fixit')) !== null && _b !== void 0 ? _b : out.insertAdjacentElement('afterbegin', Object.assign(document.createElement('p'), { className: 'note fixit' }));
            if (msg)
                msg.textContent = lang === 'en' ? 'Fix the highlighted field to see the answer.' : 'Corrija o campo destacado para ver a resposta.';
            return;
        }
        current = r.state;
        if (tool === 'tvm') {
            const s = Object.assign({}, current);
            const v = (0, core_1.tvmSolve)((0, core_1.tvmOf)(s), s.solve);
            if (isFinite(v)) {
                const val = s.solve === 'rate' ? Number((0, core_1.fixed)(v * 100 * (s.ratePer === 'year' ? s.ppy : 1), 4)) : s.solve === 'n' ? Number((0, core_1.fixed)(s.nUnit === 'year' ? v / s.ppy : v, 2)) : Number((0, core_1.fixed)(Math.abs(v), 2));
                s[s.solve] = val;
                set(s.solve, (0, core_1.inputText)(val, lang));
            }
            current = s;
        }
        render();
        if (remember) {
            try {
                history.replaceState(null, '', `${location.pathname}?${(0, forms_1.toQuery)(tool, current, cfg.fixed ? undefined : calc)}${location.hash}`);
            }
            catch (_c) { }
        }
    }
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', () => update());
    form.addEventListener('change', (e) => { const t = e.target; if (t instanceof HTMLSelectElement || t.type === 'radio')
        update(); });
    form.addEventListener('click', (e) => {
        var _a, _b;
        const b = e.target.closest('button');
        if (!b)
            return;
        if (b.hasAttribute('data-add')) {
            const list = form.querySelector('.flows');
            if (list.children.length >= 20)
                return;
            list.insertAdjacentHTML('beforeend', (0, forms_1.flowRow)({ a: 0, k: 1 }, list.children.length + 1, lang));
            (_b = (_a = list.lastElementChild) === null || _a === void 0 ? void 0 : _a.querySelector('input')) === null || _b === void 0 ? void 0 : _b.select();
            update();
        }
        else if (b.hasAttribute('data-rm')) {
            const list = form.querySelector('.flows');
            if (list.children.length <= 1)
                return;
            b.closest('li').remove();
            Array.from(list.children).forEach((li, j) => { const no = li.querySelector('.fno'); if (no)
                no.textContent = no.textContent.replace(/\d+$/, String(j + 1)); });
            update();
        }
    });
    (_a = root.querySelector('[data-share]')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
        const b = e.currentTarget;
        const url = location.href;
        const done = () => { const old = b.textContent; b.textContent = lang === 'en' ? 'Link copied' : 'Link copiado'; setTimeout(() => { b.textContent = old; }, 1800); };
        if (navigator.clipboard)
            navigator.clipboard.writeText(url).then(done, () => window.prompt('', url));
        else
            window.prompt('', url);
    });
    out.addEventListener('change', (e) => {
        const t = e.target;
        if (t.name === 'calc') {
            calc = t.value;
            render();
            update();
        }
    });
    out.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !current)
            return;
        if (b.hasAttribute('data-expand')) {
            all = true;
            render();
        }
        else if (b.hasAttribute('data-csv')) {
            const blob = new Blob(['﻿' + (0, core_1.scheduleCsv)(current, lang)], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = lang === 'en' ? 'amortization-schedule.csv' : 'planilha-financiamento.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }
    });
    const q = new URLSearchParams(location.search);
    if (Array.from(q.keys()).length) {
        const r = (0, forms_1.fromQuery)(tool, q, boot.state);
        if (r.calc && !cfg.fixed)
            calc = r.calc;
        fill(r.state);
        update(false);
    }
    else
        update(false);
}
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start);
else
    start();

};
r("./ui");})();
