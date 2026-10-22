import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  Users, Flame, Clock, Sparkles, Search, Download, Sun, Moon,
  Trash2, LayoutDashboard, Inbox, Plus, X, Copy, Check, Maximize2,
} from 'lucide-react';
import { Toast } from './Toast';

/* ------------------------------------------------------------------ */
/* Dados iniciais                                                     */
/* ------------------------------------------------------------------ */
const INITIAL_CONTACTS = [
  {
    id: '1',
    nome: 'Carlos Silva',
    whatsapp: '5535999990001',
    mensagem: 'Quero abrir uma empresa no Paraguai, mas não sei se é melhor EAS ou Unipersonal. Ainda não tenho cédula.',
    status: 'Novo',
    analiseIA: null,
  },
  {
    id: '2',
    nome: 'Mariana Costa',
    whatsapp: '5535999990002',
    mensagem: 'Já tenho cédula paraguaia e quero contratar o serviço de abertura de EAS.',
    status: 'Em atendimento',
    analiseIA: null,
  },
  {
    id: '3',
    nome: 'Roberto Alves',
    whatsapp: '5535999990003',
    mensagem: 'Ainda não quero abrir empresa. Gostaria de aprender mais sobre negócios no Paraguai.',
    status: 'Novo',
    analiseIA: null,
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const SEM_ANALISE = 'Sem análise';
const PRIORIDADES = ['Alta', 'Média', 'Baixa'];

const normPrioridade = (p) => {
  if (!p) return null;
  const s = String(p).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (s.startsWith('alt')) return 'Alta';
  if (s.startsWith('med')) return 'Média';
  if (s.startsWith('bai')) return 'Baixa';
  return null;
};

const getPrio = (c) => (c.analiseIA ? normPrioridade(c.analiseIA.prioridade) || 'Média' : SEM_ANALISE);
const getCat = (c) => c.analiseIA?.categoria || SEM_ANALISE;
const CAT_BADGE = {
  'Abertura de empresa': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'Consultoria': 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  'Produtos digitais': 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  'Outros serviços': 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};
const catBadge = (cat) => CAT_BADGE[cat] || 'border-line bg-raised text-mute';

const waLink = (c) => {
  let n = String(c.whatsapp).replace(/\D/g, '');
  if (!n.startsWith('55') && n.length <= 11) n = '55' + n;
  
  const textoPronto = c.analiseIA?.mensagem_vendedor || c.analiseIA?.resposta || '';
  return `https://wa.me/${n}?text=${encodeURIComponent(textoPronto)}`;
};

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

const exportarCSV = (linhas) => {
  const cab = ['Nome', 'WhatsApp', 'Mensagem', 'Status', 'Categoria', 'Prioridade', 'Resposta da IA'];
  const corpo = linhas.map((c) => [
    c.nome, c.whatsapp, c.mensagem, c.status,
    c.analiseIA?.categoria || '', c.analiseIA ? getPrio(c) : '', c.analiseIA?.resposta || '',
  ]);
  const csv = '\uFEFF' + [cab, ...corpo].map((r) => r.map(csvCell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `sirius-contatos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ------------------------------------------------------------------ */
/* Pequenos componentes                                               */
/* ------------------------------------------------------------------ */
const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const StarMark = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 1.5c.6 5.2 2.3 8.9 3.9 10.5 1.6 1.6 4.4 2.5 6.6 2.7v.6c-2.2.2-5 1.1-6.6 2.7-1.6 1.6-3.3 5.3-3.9 10.5h-.0C11.4 23.3 9.7 19.6 8.1 18c-1.6-1.6-4.4-2.5-6.6-2.7v-.6c2.2-.2 5-1.1 6.6-2.7C9.7 10.4 11.4 6.7 12 1.5Z" />
  </svg>
);

const Card = ({ className = '', children, ...rest }) => (
  <section className={`rounded-xl border border-line bg-surface ${className}`} {...rest}>
    {children}
  </section>
);

const KpiCard = ({ icon: Icon, label, value, hint, destaque }) => (
  <Card className="p-5 flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-sm text-mute">{label}</p>
      <p className="mt-2 font-serif text-4xl font-semibold text-ink tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-mute">{hint}</p>
    </div>
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
        destaque ? 'bg-gold text-navy' : 'bg-raised text-gold'
      }`}
    >
      <Icon size={20} strokeWidth={2} />
    </span>
  </Card>
);

const NavItem = ({ icon: Icon, label, href, active }) => (
  <a
    href={href}
    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
      active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-gold-soft' : ''} />
    <span className="hidden lg:inline">{label}</span>
  </a>
);

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [contatos, setContatos] = useState(() => {
    try {
      const salvos = localStorage.getItem('sirius_crm_contatos');
      return salvos ? JSON.parse(salvos) : INITIAL_CONTACTS;
    } catch (e) {
      console.error("Erro ao carregar do localStorage, usando padrão:", e);
      return INITIAL_CONTACTS;
    }
  });

  const [form, setForm] = useState({ nome: '', whatsapp: '', mensagem: '' });
  const [loadingId, setLoadingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [copiadoId, setCopiadoId] = useState(null);
  const [selectedContactDetails, setSelectedContactDetails] = useState(null);
  const copiaTimer = useRef(null);
  useEffect(() => () => clearTimeout(copiaTimer.current), []);

  const handleCopiar = async (contato) => {
    const texto = contato.analiseIA?.mensagem_vendedor || contato.analiseIA?.resposta || '';
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoId(contato.id);
      clearTimeout(copiaTimer.current);
      copiaTimer.current = setTimeout(() => setCopiadoId(null), 2000);
    } catch (e) {
      console.error('Erro ao copiar:', e);
      setErroToast('Não foi possível copiar. Copie manualmente.');
    }
  };

  const [erroToast, setErroToast] = useState(null);

  // Fecha o modal de detalhes com Esc
  useEffect(() => {
    if (!selectedContactDetails) return;
    const onKey = (e) => e.key === 'Escape' && setSelectedContactDetails(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedContactDetails]);

  // Filtros
  const [busca, setBusca] = useState('');
  const [fPrio, setFPrio] = useState('Todas');
  const [fCat, setFCat] = useState('Todas');

  // Tema claro / escuro 
  const [dark, setDark] = useState(() => {
    const salvo = localStorage.getItem('sirius_theme');
    if (salvo) return salvo === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sirius_theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Persistência dos contatos
  useEffect(() => {
    localStorage.setItem('sirius_crm_contatos', JSON.stringify(contatos));
  }, [contatos]);

  /* ---------------- Handlers ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp || !form.mensagem) return;

    const novoContato = {
      id: Date.now().toString(),
      nome: form.nome,
      whatsapp: form.whatsapp,
      mensagem: form.mensagem,
      status: 'Novo',
      analiseIA: null,
    };

    setContatos([novoContato, ...contatos]);
    setForm({ nome: '', whatsapp: '', mensagem: '' });
    setShowForm(false);
  };

  const handleStatusChange = (id, novoStatus) => {
    setContatos(contatos.map((c) => (c.id === id ? { ...c, status: novoStatus } : c)));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este contato?')) return;
    setContatos((prev) => prev.filter((c) => c.id !== id));
    setSelectedContactDetails((atual) => (atual?.id === id ? null : atual));
  };

  const handleAnalisarIA = async (contato) => {
    setLoadingId(contato.id);
    try {
      // PLANO B ADICIONADO: Se a variável de ambiente não carregar, usa a URL padrão
      const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/analisar-contato';

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: contato.nome,
          whatsapp: contato.whatsapp,
          mensagem: contato.mensagem,
        }),
      });

      if (!response.ok) throw new Error('Falha na resposta do servidor n8n');

      const data = await response.json();

      setContatos((prev) =>
        prev.map((c) =>
          c.id === contato.id
            ? {
                ...c,
                analiseIA: {
                  categoria: data.categoria || 'Outros serviços',
                  prioridade: data.prioridade || 'Média',
                  resposta: data.resposta || 'Análise concluída com sucesso.',
                  sentimento: data.sentimento || 'Neutro',
                  mensagem_vendedor: data.mensagem_vendedor || '',
                },
              }
            : c
        )
      );
    } catch (err) {
      setErroToast('Erro ao conectar ao n8n. Verifique se o workflow está ativo e a URL correta.');      
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------- Derivados: KPIs, gráficos, filtros ---------------- */
  const kpis = useMemo(() => {
    const analisados = contatos.filter((c) => c.analiseIA).length;
    return {
      total: contatos.length,
      alta: contatos.filter((c) => getPrio(c) === 'Alta').length,
      pendentes: contatos.filter((c) => c.status === 'Novo').length,
      analisados,
    };
  }, [contatos]);

  const dadosPrioridade = useMemo(() => {
    const contagem = {};
    [...PRIORIDADES, SEM_ANALISE].forEach((p) => (contagem[p] = 0));
    contatos.forEach((c) => (contagem[getPrio(c)] += 1));
    return Object.entries(contagem).map(([name, value]) => ({ name, value }));
  }, [contatos]);

  const dadosCategoria = useMemo(() => {
    const contagem = {};
    contatos.forEach((c) => {
      if (c.analiseIA) contagem[getCat(c)] = (contagem[getCat(c)] || 0) + 1;
    });
    return Object.entries(contagem)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [contatos]);

  const categorias = useMemo(
    () => [...new Set(contatos.map(getCat))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [contatos]
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return contatos.filter((c) => {
      if (q && !c.nome.toLowerCase().includes(q)) return false;
      if (fPrio !== 'Todas' && getPrio(c) !== fPrio) return false;
      if (fCat !== 'Todas' && getCat(c) !== fCat) return false;
      return true;
    });
  }, [contatos, busca, fPrio, fCat]);

  const filtrosAtivos = busca || fPrio !== 'Todas' || fCat !== 'Todas';
  const limparFiltros = () => { setBusca(''); setFPrio('Todas'); setFCat('Todas'); };

  const togglePrio = (nome) => nome && setFPrio((atual) => (atual === nome ? 'Todas' : nome));
  const toggleCat = (nome) => nome && setFCat((atual) => (atual === nome ? 'Todas' : nome));

  /* ---------------- Cores dos gráficos por tema ---------------- */
  const cor = {
    Alta: '#C9A24B',
    'Média': dark ? '#5B8DD6' : '#2F5FA8',
    Baixa: dark ? '#8EA0BF' : '#8A9AB5',
    [SEM_ANALISE]: dark ? '#2E4268' : '#D3DAE6',
  };
  const tick = dark ? '#8C9CB8' : '#64708A';
  const grade = dark ? '#243A5E' : '#E3E8F1';
  const barra = dark ? '#D4AF5A' : '#122648';

  const tooltipStyle = {
    backgroundColor: 'rgb(var(--surface))',
    border: '1px solid rgb(var(--line))',
    borderRadius: 8,
    color: 'rgb(var(--ink))',
    fontSize: 12,
  };

  const statusCor = {
    Novo: 'text-amber-700 dark:text-amber-300 border-amber-500/40',
    'Em atendimento': 'text-sky-700 dark:text-sky-300 border-sky-500/40',
    Finalizado: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
  };

  const pills = ['Todas', ...PRIORIDADES, SEM_ANALISE];

  /* ------------------------------------------------------------------ */
  return (
    <div className="flex min-h-screen bg-canvas font-sans text-ink">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col bg-sidebar px-3 py-6 md:flex lg:w-60 lg:px-4">
        <div className="mb-8 flex items-center gap-3 px-1.5">
          <StarMark className="h-8 w-8 shrink-0 text-gold" />
          <div className="hidden leading-tight lg:block">
            <p className="font-serif text-lg font-semibold text-white">Sirius</p>
            <p className="text-xs tracking-wide text-white/50">Advisory</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Principal">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="#dashboard" active />
          <NavItem icon={Inbox} label="Contatos" href="#contatos" />
        </nav>
        <p className="mt-auto hidden px-3 text-xs text-white/40 lg:block">Mini-CRM · Desafio técnico</p>
      </aside>

      {/* ---------------- Conteúdo ---------------- */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8" id="dashboard">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Topo */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StarMark className="h-7 w-7 text-gold md:hidden" />
              <div>
                <h1 className="font-serif text-2xl font-semibold md:text-3xl">Gestão de contatos</h1>
                <p className="text-sm text-mute">Triagem de leads com análise de IA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark((d) => !d)}
                aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
                title={dark ? 'Tema claro' : 'Tema escuro'}
                className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setShowForm((s) => !s)}
                aria-expanded={showForm}
                className="flex h-10 items-center gap-2 rounded-lg bg-gold px-4 text-sm font-semibold text-navy transition-colors hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {showForm ? <X size={16} /> : <Plus size={16} />}
                {showForm ? 'Fechar' : 'Novo contato'}
              </button>
            </div>
          </header>

          {/* Formulário */}
          {showForm && (
            <Card className="p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold">Novo contato</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-mute">Nome completo</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-mute">WhatsApp</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5535999998888"
                    className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-mute">Mensagem do interessado</span>
                  <textarea
                    required
                    rows="2"
                    placeholder="Descreva a solicitação ou dúvida do cliente..."
                    className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                  />
                </label>
                <div className="flex justify-end md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft dark:bg-gold dark:text-navy dark:hover:bg-gold-soft"
                  >
                    Cadastrar contato
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={Users} label="Total de contatos" value={kpis.total} hint="Todos os registros" />
            <KpiCard icon={Flame} label="Leads de alta prioridade" value={kpis.alta} hint="Segundo a análise de IA" destaque />
            <KpiCard icon={Clock} label="Contatos pendentes" value={kpis.pendentes} hint="Status “Novo”, aguardando atendimento" />
            <KpiCard
              icon={Sparkles}
              label="Analisados por IA"
              value={kpis.analisados}
              hint={`${kpis.total - kpis.analisados} ainda sem análise`}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <h2 className="font-serif text-lg font-semibold">Prioridade dos leads</h2>
              <p className="text-xs text-mute">Clique em uma fatia para filtrar a tabela</p>
              <div className="relative mt-2 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPrioridade}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                      onClick={(d) => togglePrio(d?.name ?? d?.payload?.name)}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    >
                      {dadosPrioridade.map((d) => (
                        <Cell
                          key={d.name}
                          fill={cor[d.name]}
                          fillOpacity={fPrio === 'Todas' || fPrio === d.name ? 1 : 0.3}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'rgb(var(--ink))' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-serif text-3xl font-semibold tabular-nums">{kpis.total}</p>
                    <p className="text-xs text-mute">contatos</p>
                  </div>
                </div>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {dadosPrioridade.map((d) => (
                  <li key={d.name}>
                    <button
                      onClick={() => togglePrio(d.name)}
                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cor[d.name] }} />
                      <span className="flex-1 text-mute">{d.name}</span>
                      <span className="font-semibold tabular-nums">{d.value}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 lg:col-span-3">
              <h2 className="font-serif text-lg font-semibold">Contatos por categoria</h2>
              <p className="text-xs text-mute">Considera apenas contatos já analisados · clique em uma barra para filtrar</p>
              {dadosCategoria.length === 0 ? (
                <div className="mt-4 grid h-56 place-items-center rounded-lg border border-dashed border-line text-center text-sm text-mute">
                  <p className="max-w-xs">Use “Analisar com IA” em um contato para ver as categorias aqui.</p>
                </div>
              ) : (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosCategoria} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                      <CartesianGrid horizontal={false} stroke={grade} />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fill: tick, fontSize: 12 }}
                        tickFormatter={(s) => (s.length > 20 ? s.slice(0, 19) + '…' : s)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        itemStyle={{ color: 'rgb(var(--ink))' }}
                        cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(18,38,72,0.05)' }}
                      />
                      <Bar
                        dataKey="value"
                        name="Contatos"
                        radius={[0, 6, 6, 0]}
                        barSize={22}
                        onClick={(d) => toggleCat(d?.name ?? d?.payload?.name)}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        {dadosCategoria.map((d) => (
                          <Cell key={d.name} fill={barra} fillOpacity={fCat === 'Todas' || fCat === d.name ? 1 : 0.3} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Tabela */}
          <Card className="overflow-hidden" id="contatos">
            <div className="space-y-4 border-b border-line p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-semibold">Lista de contatos</h2>
                  <p className="text-xs text-mute">
                    {filtrados.length} de {contatos.length} {contatos.length === 1 ? 'contato' : 'contatos'}
                  </p>
                </div>
                <button
                  onClick={() => exportarCSV(filtrados)}
                  disabled={filtrados.length === 0}
                  className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-medium transition-colors hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={16} className="text-gold" />
                  Exportar CSV
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="relative w-full sm:w-64">
                  <span className="sr-only">Buscar por nome</span>
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                  <input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome"
                    className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm focus:border-gold focus:outline-none"
                  />
                </label>

                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por prioridade">
                  {pills.map((p) => (
                    <button
                      key={p}
                      onClick={() => setFPrio(p)}
                      aria-pressed={fPrio === p}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                        fPrio === p
                          ? 'border-navy bg-navy text-white dark:border-gold dark:bg-gold dark:text-navy'
                          : 'border-line text-mute hover:bg-raised hover:text-ink'
                      }`}
                    >
                      {p === 'Todas' ? 'Todas as prioridades' : p}
                    </button>
                  ))}
                </div>

                <label className="sm:ml-auto">
                  <span className="sr-only">Filtrar por categoria</span>
                  <select
                    value={fCat}
                    onChange={(e) => setFCat(e.target.value)}
                    className="h-10 rounded-lg border border-line bg-canvas px-3 text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="Todas">Todas as categorias</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-raised text-xs text-mute">
                  <tr>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Mensagem</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Análise de IA</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center text-mute">
                        {contatos.length === 0 ? (
                          'Nenhum contato cadastrado. Clique em “Novo contato” para começar.'
                        ) : (
                          <>
                            Nenhum contato encontrado com esses filtros.{' '}
                            {filtrosAtivos && (
                              <button onClick={limparFiltros} className="font-medium text-gold underline underline-offset-2">
                                Limpar filtros
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((contato) => {
                      const prio = getPrio(contato);
                      const copiado = copiadoId === contato.id;
                      return (
                        <tr key={contato.id} className="align-top transition-colors hover:bg-raised/60">
                          {/* CONTATO + BADGE DE CATEGORIA */}
                          <td className="px-4 py-4">
                            <div className="font-medium">{contato.nome}</div>
                            <div className="text-xs text-mute tabular-nums">{contato.whatsapp}</div>
                            <span
                              title="Categoria"
                              className={`mt-2 inline-block whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${catBadge(contato.analiseIA?.categoria)}`}
                            >
                              {contato.analiseIA?.categoria || 'Sem categoria'}
                            </span>
                          </td>

                          {/* MENSAGEM */}
                          <td className="max-w-[220px] px-4 py-4 text-xs text-mute">
                            <button
                              type="button"
                              onClick={() => setSelectedContactDetails(contato)}
                              title="Ver mensagem completa"
                              className="block w-full text-left transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                            >
                              <span className="line-clamp-2 break-words">{contato.mensagem}</span>
                            </button>
                          </td>

                          {/* STATUS */}
                          <td className="whitespace-nowrap px-4 py-4">
                            <select
                              value={contato.status}
                              onChange={(e) => handleStatusChange(contato.id, e.target.value)}
                              aria-label={`Status de ${contato.nome}`}
                              className={`cursor-pointer rounded-full border bg-canvas px-3 py-1 text-xs font-semibold focus:outline-none ${statusCor[contato.status]}`}
                            >
                              <option value="Novo">Novo</option>
                              <option value="Em atendimento">Em atendimento</option>
                              <option value="Finalizado">Finalizado</option>
                            </select>
                          </td>

                          {/* ANÁLISE DE IA */}
                          <td className="max-w-[260px] px-4 py-4">
                            {contato.analiseIA ? (
                              <div className="space-y-1.5 rounded-lg border border-line bg-canvas p-3 text-xs">
                                <div className="flex flex-wrap gap-1">
                                  <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] font-medium" title="Sentimento do cliente">
                                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                                    {contato.analiseIA.sentimento}
                                  </span>
                                  <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-[11px] font-medium" title="Prioridade">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cor[prio] }} />
                                    {prio}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedContactDetails(contato)}
                                  title="Ver análise completa"
                                  className="block w-full border-t border-line pt-1.5 text-left text-[11px] italic leading-relaxed text-mute transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                                >
                                  <span className="line-clamp-2 break-words">“{contato.analiseIA.resposta}”</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs italic text-mute">Pendente de análise</span>
                            )}
                          </td>

                          {/* AÇÕES */}
                          <td className="px-4 py-4">
                            <div className="flex flex-nowrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedContactDetails(contato)}
                                aria-label={`Ver detalhes de ${contato.nome}`}
                                title="Ver detalhes"
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-mute transition-colors hover:bg-raised hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                              >
                                <Maximize2 size={16} />
                              </button>

                              {contato.analiseIA ? (
                                <>
                                  <a
                                    href={waLink(contato)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Enviar resposta da IA para ${contato.nome} no WhatsApp`}
                                    title="Abrir no WhatsApp com a resposta da IA"
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#25D366] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                                  >
                                    <WhatsAppIcon className="h-4 w-4" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopiar(contato)}
                                    aria-label={copiado ? 'Copiado!' : `Copiar resposta para ${contato.nome}`}
                                    title={copiado ? 'Copiado!' : 'Copiar resposta'}
                                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors ${
                                      copiado
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'border-line text-mute hover:bg-raised hover:text-ink'
                                    }`}
                                  >
                                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span
                                    title="Analise com IA para gerar a mensagem"
                                    className="grid h-8 w-8 shrink-0 cursor-not-allowed place-items-center rounded-lg bg-raised text-mute opacity-60"
                                  >
                                    <WhatsAppIcon className="h-4 w-4" />
                                  </span>
                                  <span
                                    title="Analise com IA para gerar a mensagem"
                                    className="grid h-8 w-8 shrink-0 cursor-not-allowed place-items-center rounded-lg border border-line text-mute opacity-60"
                                  >
                                    <Copy size={16} />
                                  </span>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleAnalisarIA(contato)}
                                disabled={loadingId === contato.id}
                                className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-navy px-3 text-xs font-medium leading-none text-white transition-colors hover:bg-navy-soft disabled:opacity-60 dark:bg-gold dark:text-navy dark:hover:bg-gold-soft"
                              >
                                {loadingId === contato.id ? 'Analisando...' : 'Analisar com IA'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(contato.id)}
                                aria-label={`Excluir ${contato.nome}`}
                                title="Excluir"
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-mute transition-colors hover:bg-raised hover:text-rose-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
      {/* ---------------- Modal de detalhes ---------------- */}
      {selectedContactDetails && (() => {
        const c = selectedContactDetails;
        const ia = c.analiseIA;
        const prioModal = getPrio(c);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedContactDetails(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-contato-titulo"
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            >
              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-4 border-b border-line p-5">
                <div className="min-w-0">
                  <h2 id="modal-contato-titulo" className="truncate font-serif text-xl font-semibold">{c.nome}</h2>
                  <p className="text-xs text-mute tabular-nums">{c.whatsapp}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedContactDetails(null)}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium text-mute transition-colors hover:bg-raised hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <X size={16} />
                  Fechar
                </button>
              </div>

              {/* Conteúdo */}
              <div className="space-y-5 overflow-y-auto p-5 text-sm">
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-mute">Mensagem original</h3>
                  <p className="whitespace-pre-wrap break-words rounded-lg border border-line bg-canvas p-3 leading-relaxed">
                    {c.mensagem}
                  </p>
                </section>

                {ia ? (
                  <>
                    <section>
                      <h3 className="mb-1.5 text-xs font-medium text-mute">Retorno da IA</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${catBadge(ia.categoria)}`} title="Categoria">
                          {ia.categoria}
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium" title="Prioridade">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cor[prioModal] }} />
                          Prioridade {prioModal}
                        </span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium" title="Sentimento do cliente">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          {ia.sentimento}
                        </span>
                      </div>
                    </section>

                    {ia.resposta && (
                      <section>
                        <h3 className="mb-1.5 text-xs font-medium text-mute">Análise</h3>
                        <p className="whitespace-pre-wrap break-words rounded-lg border border-line bg-canvas p-3 italic leading-relaxed text-mute">
                          {ia.resposta}
                        </p>
                      </section>
                    )}

                    {ia.mensagem_vendedor && (
                      <section>
                        <h3 className="mb-1.5 text-xs font-medium text-mute">Mensagem do vendedor</h3>
                        <p className="whitespace-pre-wrap break-words rounded-lg border border-line bg-canvas p-3 leading-relaxed">
                          {ia.mensagem_vendedor}
                        </p>
                      </section>
                    )}
                  </>
                ) : (
                  <p className="rounded-lg border border-dashed border-line p-3 text-xs italic text-mute">
                    Este contato ainda não foi analisado. Use “Analisar com IA” na tabela.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <Toast mensagem={erroToast} onClose={() => setErroToast(null)} />
    </div>
  );
}