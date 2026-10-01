
/* Chart.js é carregado somente quando uma tela realmente precisa de gráficos. */
window.__chartJSReady = null;
function ensureChartJS(){
  if(typeof Chart !== "undefined") return Promise.resolve(true);
  if(window.__chartJSReady) return window.__chartJSReady;
  window.__chartJSReady = new Promise(resolve=>{
    const existing=document.querySelector('script[data-chartjs]');
    if(existing){ existing.addEventListener('load',()=>resolve(true),{once:true}); existing.addEventListener('error',()=>resolve(false),{once:true}); return; }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
    script.async=true; script.defer=true; script.dataset.chartjs='1';
    script.onload=()=>resolve(true); script.onerror=()=>resolve(false);
    document.head.appendChild(script);
  });
  return window.__chartJSReady;
}


/* ===== extracted script block ===== */

/* BANCO DE DADOS - COMPATIBILIDADE INTEGRAL PRESERVADA */
const STORAGE_KEY = "studio_pilates_louise_karla_v2";
const BACKUP_KEY = "studio_pilates_louise_karla_v2_backup";
const META_KEY = "studio_pilates_louise_karla_v2_meta";
const STUDENTS_STORAGE_KEY = "studio_pilates_louise_karla_students_v1";
const STORAGE_VERSION = 11;

const defaultData = {
  settings:{
    studioName:"Studio de Pilates LOUISE KARLA",
    owner:"LOUISE KARLA",
    whatsapp:"",
    instagram:"",
    email:"",
    address:"",
    capacity:4,
    duration:60,
    logo:"",
    pixType:"CPF/CNPJ",
    pixKey:"",
    pixName:"",
    darkMode:false,
    darkPalette:"ameixa",
    dashboardGradient:"violet",
    theme:{ p:"#556b2f", p2:"#8fbc8f", a:"#10b981", preset:"salvia" },
    interface:{ density:"standard", reducedEffects:false, tableWidth:720, tableDensity:"standard", backgroundOpacity:66, menuOpacity:72, bottomNavOpacity:72, menuPosition:"left" },
    system:{ confirmDelete:true, animations:true, hapticVisual:true, showBadges:true, keyboardShortcuts:true },
    messages:{
      billing: "Olá, {nome}! 😊\n\nPassando para lembrar da mensalidade do {studio}.\n\nPlano: {plano}\nValor: R$ {valor}\nVencimento: {vencimento}\n\nChave PIX ({pix_tipo}): {pix}\nBeneficiário: {pix_nome}\n\nQualquer dúvida, estamos à disposição!",
      reminder: "Olá, {nome}! 😊\n\nSua mensalidade do {studio} vence hoje ({vencimento}).\nValor: R$ {valor}\nChave PIX: {pix}\n\nCaso já tenha pago, por favor desconsidere!",
      welcome: "Seja muito bem-vindo(a) ao {studio}, {nome}! 🎉\n\nFicamos muito felizes em ter você conosco em nosso time de alunos no plano {plano}.\n\nSua aula está agendada para o horário das {horario}.\n\nQualquer dúvida é só nos chamar por aqui!",
      birthday: "Olá, {nome}! 🎂✨\n\nO Studio de Pilates {studio} deseja um feliz aniversário! Que seu novo ciclo seja cheio de saúde, movimento e conquistas. 💜",
      class: "Olá, {nome}! 😊\n\nPassando para confirmar sua aula de Pilates às {horario} no {studio}.\n\nAté lá!"
    }
  },
  plans:[
    { id:"pl1", name:"Plano 2X na semana", weekly:2, price:170 },
    { id:"pl2", name:"Plano 3X na semana", weekly:3, price:220 }
  ],
  hours:["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"],
  teachers:["LOUISE KARLA", "Professor 2", "Prof. Substituto"],
  payments:["PIX", "Cartão de Crédito", "Dinheiro", "Transferência"],
  hourDays:{},
  teacherClosings:{},
  alertDismissed:{},
  teacherFixedRates:{},
  teacherClassValues:{},
  students:[], classes:[], finance:[], makeups:[], waitlist:[], equipment:[
    {id:"eq_reformer",name:"Reformer",category:"Reformer",quantity:1,active:true,notes:"Aparelho principal."},
    {id:"eq_cadillac",name:"Cadillac",category:"Cadillac",quantity:1,active:true,notes:"Estrutura completa."},
    {id:"eq_chair",name:"Chair",category:"Chair",quantity:1,active:true,notes:"Cadeira de Pilates."},
    {id:"eq_barrel",name:"Ladder Barrel",category:"Barrel",quantity:1,active:true,notes:"Mobilidade e alongamento."},
    {id:"eq_spine",name:"Spine Corrector",category:"Acessório",quantity:1,active:true,notes:"Suporte para mobilidade da coluna."}
  ]
};

let db;
let charts = {};
let currentMonth = new Date();
let editingId = null;

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

function mergeDefaults(data){
  const result = clone(defaultData);
  if(!data || typeof data !== "object") return result;
  Object.assign(result, data);
  result.settings = { ...clone(defaultData.settings), ...(data.settings || {}) };
  result.settings.messages = { ...clone(defaultData.settings.messages), ...((data.settings || {}).messages || {}) };
  result.settings.theme = { ...clone(defaultData.settings.theme), ...((data.settings || {}).theme || {}) };
  result.settings.interface = { ...clone(defaultData.settings.interface), ...((data.settings || {}).interface || {}) };

  result.plans = Array.isArray(data.plans) ? data.plans : result.plans;
  result.hours = Array.isArray(data.hours) ? data.hours : result.hours;
  result.hourDays = (data.hourDays && typeof data.hourDays === "object") ? data.hourDays : {};
  result.teacherClosings = (data.teacherClosings && typeof data.teacherClosings === "object") ? data.teacherClosings : {};
  result.alertDismissed = (data.alertDismissed && typeof data.alertDismissed === "object") ? data.alertDismissed : {};
  result.teacherFixedRates = (data.teacherFixedRates && typeof data.teacherFixedRates === "object") ? data.teacherFixedRates : {};
  result.teacherClassValues = (data.teacherClassValues && typeof data.teacherClassValues === "object") ? data.teacherClassValues : {};
  result.teachers = Array.isArray(data.teachers) ? data.teachers : result.teachers;
  result.payments = Array.isArray(data.payments) ? data.payments : result.payments;
  result.students = Array.isArray(data.students) ? data.students : [];
  result.classes = Array.isArray(data.classes) ? data.classes : [];
  result.finance = Array.isArray(data.finance) ? data.finance : [];
  result.makeups = Array.isArray(data.makeups) ? data.makeups : [];
  result.waitlist = Array.isArray(data.waitlist) ? data.waitlist : [];
  result.equipment = Array.isArray(data.equipment) ? data.equipment : clone(defaultData.equipment);
  result.finance.forEach(f=>{ if(!f.type) f.type="Receita"; });
  return result;
}

function validateDB(data){
  if(!data || typeof data !== "object") return false;
  const keys = ["plans","hours","teachers","payments","students","classes","finance","makeups","waitlist","equipment"];
  for(const k of keys){ if(!Array.isArray(data[k])) return false; }
  return data.settings && typeof data.settings === "object";
}

/* Persistência redundante dos alunos.
   O cadastro de alunos é mantido também em uma chave própria para impedir que
   uma gravação/recarregamento parcial do banco principal faça alunos anteriores
   desaparecerem. O ID é a chave de reconciliação. */
function loadStudentVault(){
  try{
    const raw=localStorage.getItem(STUDENTS_STORAGE_KEY);
    if(!raw) return [];
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch(e){
    console.warn("Não foi possível ler o cofre de alunos:",e);
    return [];
  }
}

function saveStudentVault(students){
  try{
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(Array.isArray(students)?students:[]));
    return true;
  }catch(e){
    console.error("Não foi possível persistir os alunos:",e);
    return false;
  }
}

function mergeStudentRecords(primary, secondary){
  const map=new Map();
  [...(Array.isArray(primary)?primary:[]), ...(Array.isArray(secondary)?secondary:[])].forEach(s=>{
    if(!s || typeof s!=="object" || !s.id) return;
    const previous=map.get(String(s.id));
    // O registro mais recente vence quando ambos existem.
    const previousStamp=previous?.updatedAt||previous?.createdAt||"";
    const currentStamp=s.updatedAt||s.createdAt||"";
    if(!previous || String(currentStamp)>=String(previousStamp)) map.set(String(s.id),s);
  });
  return Array.from(map.values());
}

function hydrateStudentPersistence(data){
  const result=mergeDefaults(data);
  const vault=loadStudentVault();
  result.students=mergeStudentRecords(result.students,vault);
  return result;
}

function loadDB(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(validateDB(parsed)) return hydrateStudentPersistence(parsed);
    }
  }catch(e){ console.error("Erro ao carregar banco:", e); }

  try{
    const backupRaw = localStorage.getItem(BACKUP_KEY);
    if(backupRaw){
      const backup = JSON.parse(backupRaw);
      if(validateDB(backup)) return hydrateStudentPersistence(backup);
    }
  }catch(e){}

  const initial = hydrateStudentPersistence(defaultData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  localStorage.setItem(BACKUP_KEY, JSON.stringify(initial));
  saveStudentVault(initial.students);
  return initial;
}

function saveDB(){
  try{
    const serialized = JSON.stringify(db);
    localStorage.setItem(BACKUP_KEY, localStorage.getItem(STORAGE_KEY) || serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
    setStorageStatus("ok", "Dados protegidos");

    // Agenda uma confirmação somente se a ação atual não apresentar outra mensagem.
    // Isso evita o toast vazio/duplicado e também impede que “Alteração feita”
    // sobrescreva mensagens específicas como “Aluno atualizado com sucesso!”.
    if(window.__appReady){
      const saveStamp = Date.now();
      window.__lastSaveStamp = saveStamp;
      clearTimeout(window.__changeNoticeTimer);
      window.__changeNoticeTimer = setTimeout(() => {
        if(window.__lastToastAt && window.__lastToastAt >= saveStamp) return;
        toast("Alteração feita");
      }, 120);
    }
    return true;
  }catch(e){
    setStorageStatus("error", "Falha ao salvar");
    toast("⚠ Erro ao salvar dados locais.");
    return false;
  }
}

function setStorageStatus(type, msg){
  const targets=[
    [document.getElementById("storageDot"),document.getElementById("storageStatus")],
    [document.getElementById("backupStorageDot"),document.getElementById("backupStorageText")]
  ];
  targets.forEach(([dot,txt])=>{
    if(dot) dot.className = "storage-dot " + (type==="warning"?"warning":type==="error"?"error":"");
    if(txt) txt.textContent = msg;
  });
}

/* UTILITÁRIOS */
function uid(prefix="id"){ return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(v){ return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function money(v){ return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

function todayISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

function whatsappNumber(num){
  let n = String(num||"").replace(/\D/g,"");
  if(!n) return "";
  return n.startsWith("55") ? n : "55" + n;
}
function trashIcon(size=16){
  const n=Number(size)||16;
  return `<svg class="ios-trash-svg" width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4.8c0-.5.4-.8.9-.8h4.2c.5 0 .9.3.9.8V7M7.2 7l.7 12.1c.05.5.45.9.95.9h6.3c.5 0 .9-.4.95-.9L16.8 7M10 10.5v6M14 10.5v6"/></svg>`;
}
function waIcon(size=18){
  const n=Number(size)||18;
  return `<svg class="wa-svg" width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.8 11.8 0 0 0 12.12 0C5.5 0 .12 5.38.12 12c0 2.11.55 4.17 1.6 5.98L.05 24l6.17-1.62A11.9 11.9 0 0 0 12.12 24h.01c6.62 0 12-5.38 12-12 0-3.2-1.25-6.21-3.61-8.52zM12.13 21.9c-1.87 0-3.7-.5-5.29-1.45l-.38-.23-3.66.96.98-3.56-.25-.39a9.85 9.85 0 1 1 8.6 4.67zm5.42-7.39c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.69.15-.2.3-.79.97-.97 1.17-.18.2-.36.22-.66.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.36.45-.54.15-.18.2-.3.3-.51.1-.2.05-.38-.03-.53-.08-.15-.69-1.66-.94-2.27-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.53.08-.81.38-.28.3-1.06 1.03-1.06 2.5s1.09 2.9 1.24 3.1c.15.2 2.14 3.27 5.19 4.59.73.31 1.3.5 1.75.64.74.24 1.41.21 1.94.13.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35z"/></svg>`;
}

function openWhatsApp(num, msg){
  const phone = whatsappNumber(num);
  if(!phone){ toast("Nenhum WhatsApp válido cadastrado."); return; }
  window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg||""), "_blank");
}

function replaceVars(text, student={}, extra={}){
  const values = {
    nome: student.name || "",
    valor: Number(extra.value ?? student.monthly ?? 0).toFixed(2).replace(".",","),
    vencimento: extra.due || student.due || "",
    plano: student.plan || "",
    horario: student.time || "",
    studio: db.settings.studioName || "",
    pix: db.settings.pixKey || "Não configurada",
    pix_tipo: db.settings.pixType || "PIX",
    pix_nome: db.settings.pixName || db.settings.owner || ""
  };
  return String(text || "").replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
}

function toast(msg){
  clearTimeout(window.__changeNoticeTimer);
  window.__changeNoticeTimer = null;
  const el = document.getElementById("toast");
  if(!el) return;
  const text = String(msg ?? "").trim();
  // Nunca renderiza um toast vazio. Isso elimina notificações em branco.
  if(!text){
    el.classList.remove("show");
    el.textContent = "";
    clearTimeout(window.toastTimer);
    return;
  }
  window.__lastToastAt = Date.now();
  el.textContent = text;
  // Reforça o contraste no próprio elemento para evitar conflito com temas/paletas.
  const darkMode = document.documentElement.getAttribute("data-theme") === "dark";
  el.style.setProperty("color", darkMode ? "#f8fafc" : "#172033", "important");
  el.style.setProperty("-webkit-text-fill-color", darkMode ? "#f8fafc" : "#172033", "important");
  el.style.setProperty("visibility", "visible", "important");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    el.classList.remove("show");
    el.style.setProperty("visibility", "hidden", "important");
    // Limpa o conteúdo depois da animação para evitar qualquer estado visual vazio.
    setTimeout(() => { if(!el.classList.contains("show")){ el.textContent = ""; el.style.removeProperty("color"); el.style.removeProperty("-webkit-text-fill-color"); } }, 280);
  }, 3200);
}

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();focusGlobalSearch();return;}
  if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();focusGlobalSearch();return;}
  if(e.key==='Escape'){closeTransientUI();}
});

/* NAVEGAÇÃO & INTERFACE */
document.querySelectorAll(".nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    goPage(btn.dataset.page);
    document.getElementById("sidebar").classList.remove("open");
  });
});

function filterMenus(term){
  const q=String(term||'').trim().toLowerCase();
  let visible=0;
  document.querySelectorAll('.nav button[data-page]').forEach(btn=>{
    const show=!q || btn.textContent.toLowerCase().includes(q);
    btn.style.display=show?'flex':'none';
    if(show)visible++;
  });
  const empty=document.getElementById('navEmpty');
  if(empty)empty.style.display=visible?'none':'block';
}

function updateMenuBadges(){
  const set=(id,n)=>{const e=document.getElementById(id);if(e)e.textContent=n>99?'99+':String(Math.max(0,Number(n)||0));};
  set('navBillingBadge',Array.isArray(db.finance)?db.finance.filter(f=>f.status==='Pendente' && f.type!=='Despesa').length:0);
  const now=new Date(), md=String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const birthdays=Array.isArray(db.students)?db.students.filter(s=>{
    if(s.status && s.status!=='Ativo') return false;
    const raw=String(s.birth||s.birthDate||s.birthday||'');
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw.slice(5)===md : raw.slice(-5)===md;
  }).length:0;
  set('navBirthdayBadge',birthdays);
  set('navWaitlistBadge',Array.isArray(db.waitlist)?db.waitlist.filter(x=>x.status!=='Atendido' && x.status!=='Cancelado').length:0);
  set('navEquipmentBadge',Array.isArray(db.equipment)?db.equipment.filter(x=>x.active!==false).length:0);
  if(typeof getStudioAlerts==='function')set('navAlertsBadge',getStudioAlerts().filter(a=>!a.dismissed).length);
}

function goPage(page){
  const previousPage=window.currentPage || document.querySelector('.page.active')?.id?.replace('page-','') || '';
  if(previousPage===page){ document.getElementById('sidebar')?.classList.remove('open'); return; }
  const applyPage=()=>{
    window.currentPage=page;
    // Ao retornar para Configurações vindo de outra janela, sempre inicia em
    // Empresa & PIX. A subaba anterior não deve permanecer aberta entre janelas.
    if(page==='settings' && previousPage!=='settings'){
      document.querySelectorAll('[data-settings]').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.settings-section').forEach(x=>x.classList.remove('active'));
      document.querySelector('[data-settings="general"]')?.classList.add('active');
      document.querySelector('#settings-general')?.classList.add('active');
    }
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const nextPage=document.querySelector("#page-" + page);
    if(nextPage) nextPage.classList.add("active");
    document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.page === page));

    const titles = {
    dashboard:"Painel Principal", students:"Alunos", agenda:"Agenda", hours:"Horários",
    occupancy:"Ocupação", finance:"Financeiro", billing:"Cobranças", makeups:"Reposições",
    birthdays:"Aniversários", waitlist:"Lista de Espera", reports:"Relatórios", teacher:"Painel da Professora", teachers:"Gestão de Professores", alerts:"Alertas", equipment:"Equipamentos",evolution:"Evolução", settings:"Configurações"
  };
    document.getElementById("topTitle").textContent = titles[page] || "Painel";
    renderCurrentPage(page);
    updateMenuBadges();
    if(page==="dashboard" || page==="occupancy" || page==="settings") setTimeout(()=>refreshAdvancedPanels(false),0);
  };
  document.getElementById('sidebar')?.classList.remove('open');
  if(document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.reduceEffects!=='1'){
    document.startViewTransition(applyPage);
  }else{
    requestAnimationFrame(applyPage);
  }
}

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && document.getElementById("modalBackdrop")?.classList.contains("show")){
    e.preventDefault();
    closeModal();
  }
});

function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("open"); }

function goSettings(sec){
  goPage("settings");
  document.querySelectorAll("[data-settings]").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".settings-section").forEach(x => x.classList.remove("active"));
  document.querySelector(`[data-settings="${sec}"]`)?.classList.add("active");
  document.querySelector(`#settings-${sec}`)?.classList.add("active");
}

function openModal(title, body, onSave){
  const backdrop = document.getElementById("modalBackdrop");
  const modalBody = document.getElementById("modalBody");
  document.getElementById("modalTitle").textContent = title;
  modalBody.innerHTML = body;
  modalBody.scrollTop = 0;
  backdrop.classList.add("show");
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
  document.getElementById("modalSave").onclick = onSave || closeModal;
  requestAnimationFrame(() => {
    modalBody.scrollTop = 0;
    const first = modalBody.querySelector("input,select,textarea,button");
    if(first && first.autofocus) first.focus({preventScroll:true});
  });
}

function closeModal(){
  document.getElementById("modalBackdrop").classList.remove("show");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  editingId = null;
}

/* MODAL DE AÇÕES RÁPIDAS */
function openQuickActions(){
  const body = `
    <div style="display:grid;gap:10px">
      <button class="btn primary" onclick="closeModal();openStudentModal()">👤 Cadastrar Novo Aluno</button>
      <button class="btn primary" onclick="closeModal();openClassModal()">📅 Agendar Aula</button>
      <button class="btn primary" onclick="closeModal();openFinanceModal()">💰 Lançar Receita/Cobrança</button>
      <button class="btn whatsapp quick-wa-icon" title="WhatsApp em Lote (Cobranças)" aria-label="WhatsApp em Lote (Cobranças)" onclick="closeModal();openBatchWhatsAppModal()"><span class="wa-inline">${waIcon(20)}</span></button>
      <button class="btn" onclick="closeModal();generateCharges()">🔄 Gerar Mensalidades do Mês</button>
      <button class="btn" onclick="closeModal();generateRecurringClasses()">📅 Gerar Aulas Recorrentes do Mês</button>
      <button class="btn" onclick="closeModal();openWaitModal()">⌛ Adicionar à Lista de Espera</button>
    </div>
  `;
  openModal("Ações Rápidas do Sistema", body, null);
}

/* WHATSAPP EM LOTE / COBRANÇA */
function openBatchWhatsAppModal(){
  const pending = db.finance.filter(f => f.status === "Pendente");
  if(pending.length === 0){
    toast("Nenhuma cobrança pendente para envio.");
    return;
  }

  let rows = pending.map(f => {
    const s = db.students.find(x => x.id === f.studentId) || { name: f.studentName, whatsapp: f.whatsapp };
    const msg = replaceVars(db.settings.messages.billing, s, { value: f.value, due: f.dueDate });
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--line)">
        <div>
          <strong>${esc(f.studentName)}</strong>
          <div class="muted" style="font-size:11px">${money(f.value)} • Vence: ${f.dueDate}</div>
        </div>
        <button class="btn whatsapp small" onclick="openWhatsApp('${esc(s.whatsapp||'')}', \`${esc(msg)}\`)"><span class="wa-inline">${waIcon(16)}<span>Enviar</span></span></button>
      </div>
    `;
  }).join("");

  openModal("Envio de Cobranças via WhatsApp", `<div style="max-height:400px;overflow:auto">${rows}</div>`, closeModal);
}

/* V65 — PAINEL UNIFICADO: aluno + dia + horário + equipamento + status */
window.controlEquipmentDate=window.controlEquipmentDate||todayISO();
window.controlEquipmentTicker=window.controlEquipmentTicker||null;
function controlEquipmentWeekDates(anchor){
  const d=new Date(`${anchor}T12:00:00`); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day);
  return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;});
}
function controlEquipmentSlots(date){
  ensureEquipmentData(); ensureV7Data(); normalizeAllStudentDays();
  const rows=db.classes.filter(c=>c.date===date&&c.status!=='Cancelada').map(c=>({c,s:studentById(c.studentId),eq:c.equipmentId?equipmentById(c.equipmentId):null}));
  return rows.sort((a,b)=>(timeToMinutes(a.c.time)||0)-(timeToMinutes(b.c.time)||0));
}
function selectControlEquipmentDay(date){window.controlEquipmentDate=date;renderControlEquipment();}
function renderControlEquipment(){
  const daysEl=document.getElementById('controlEquipmentDays'),root=document.getElementById('dashboardEquipmentSchedule'),summary=document.getElementById('controlEquipmentSummary');
  if(!root)return; ensureEquipmentData(); ensureV7Data(); normalizeAllStudentDays();
  const date=window.controlEquipmentDate||todayISO(), today=todayISO();
  const days=controlEquipmentWeekDates(date); const names=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  if(daysEl) daysEl.innerHTML=days.map(d=>{const x=new Date(`${d}T12:00:00`),rows=controlEquipmentSlots(d),pending=rows.filter(r=>!r.eq).length;return `<button type="button" class="control-equipment-day ${d===date?'is-selected':''} ${d===today?'is-today':''}" aria-pressed="${d===date}" onclick="selectControlEquipmentDay('${d}')"><b>${names[(x.getDay()+6)%7]}</b><strong>${String(x.getDate()).padStart(2,'0')}</strong><small>${x.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small><em>${rows.length?rows.length+' aula'+(rows.length===1?'':'s'):'Sem aulas'}${pending?' · '+pending+' pend.':''}</em></button>`}).join('');
  const filter=document.getElementById('controlEquipmentFilter')?.value||'all', search=String(document.getElementById('controlEquipmentSearch')?.value||'').trim().toLowerCase();
  let rows=controlEquipmentSlots(date); const matches=r=>{const name=String(r.s?.name||r.c.studentName||'').toLowerCase(), eq=String(r.eq?.name||'').toLowerCase(); if(search&&!name.includes(search)&&!eq.includes(search))return false; if(filter==='scheduled'&&r.c.status!=='Agendada')return false; if(filter==='pending'&&r.eq)return false; if(filter==='done'&&r.c.status!=='Realizada')return false; return true;}; rows=rows.filter(matches);
  const allToday=controlEquipmentSlots(date), assigned=allToday.filter(r=>r.eq).length,pending=allToday.length-assigned,done=allToday.filter(r=>r.c.status==='Realizada').length,capacity=Number(db.settings.capacity||0),usedSlots=new Set(allToday.map(r=>r.c.time)).size,pct=allToday.length?Math.round(assigned/allToday.length*100):0;
  if(summary)summary.innerHTML=`<div><b>${allToday.length}</b><span>Aulas</span></div><div><b>${new Set(allToday.map(r=>r.s?.id||r.c.studentId)).size}</b><span>Alunos</span></div><div><b>${usedSlots}</b><span>Horários</span></div><div class="${pending?'attention':''}"><b>${pending}</b><span>Sem aparelho</span></div><div><b>${done}/${allToday.length||0}</b><span>Realizadas</span></div>`;
  const grouped=new Map(); rows.forEach(r=>{const t=r.c.time||'—';if(!grouped.has(t))grouped.set(t,[]);grouped.get(t).push(r);});
  const selectedLabel=new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  if(!rows.length){root.innerHTML=`<div class="control-equipment-empty">Nenhuma aula encontrada para <strong>${esc(selectedLabel)}</strong> com os filtros atuais.</div>`;return;}
  root.innerHTML=[...grouped.entries()].map(([time,items])=>{const cap=slotCapacity(date,time), p=cap.capacity?Math.min(100,Math.round(cap.used/cap.capacity*100)):0;return `<div class="control-equipment-time"><div class="control-equipment-time-head"><div><strong>${esc(formatTimeRange(time))}</strong><small> · ${items.length} aluno${items.length===1?'':'s'} · ocupação ${cap.capacity?cap.used+'/'+cap.capacity:'—'}</small></div><span class="badge ${cap.full?'bad':cap.percent>=80?'warning':'info'}">${cap.capacity?cap.used+'/'+cap.capacity:'Sem capacidade'}</span></div><div class="control-equipment-time-body">${items.map(r=>{const s=r.s,eq=r.eq,c=r.c, initials=String(s?.name||c.studentName||'?').trim().charAt(0).toUpperCase(),state=c.status==='Realizada'?'Realizada':eq?'Programada':'Aparelho pendente';const stateClass=c.status==='Realizada'?'ok':eq?'info':'warn';const hist=previousEquipmentForStudent(c.studentId,c.date,c.time,c.id),last=hist?.equipmentId?equipmentById(hist.equipmentId):null;return `<div class="control-equipment-row"><div class="control-equipment-student"><span class="control-equipment-avatar">${esc(initials)}</span><div><strong>${esc(s?.name||c.studentName||'Aluno')}</strong><small>${esc(c.teacher||s?.teacher||'Professor não definido')} · ${esc(s?.plan||'')}</small></div></div><div class="control-equipment-cell"><small>Último</small><strong>${esc(last?.name||'—')}</strong><small>${last?'Rodízio automático':'Sem histórico'}</small></div><div class="control-equipment-cell"><small>Equipamento da aula</small><div class="eq-inline">${eq?equipmentIconSVG(eq,34):'<span style="font-size:20px">⚠️</span>'}<strong>${esc(eq?.name||'Definir aparelho')}</strong></div></div><div class="control-equipment-cell"><small>Status</small><span class="badge ${stateClass}">${state}</span><div class="control-equipment-progress"><i style="width:${eq?100:0}%"></i></div></div><div class="control-equipment-action"><button class="btn small ${eq?'':'primary'}" type="button" onclick="openClassModal(null,'${esc(c.studentId||'')}','${esc(c.id||'')}')">${eq?'Editar':'Definir'}</button></div></div>`;}).join('')}</div></div>`;}).join('');
  const note=document.getElementById('controlEquipmentRefreshNote');if(note)note.textContent=`Atualizado ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · sincronizado com a agenda`;
  const count=document.getElementById('dashboardEquipmentCount');if(count)count.textContent=`${allToday.length} ${allToday.length===1?'aula':'aulas'}`;
}
function refreshControlEquipment(force=false){
  window.controlEquipmentDate=window.controlEquipmentDate||todayISO();
  renderControlEquipment();
  if(force)toast('Controle de equipamentos atualizado.');
}
function startControlEquipmentLive(){
}
startControlEquipmentLive();

/* V47 — PAINEL OPERACIONAL DE EQUIPAMENTOS */
function dashboardEquipmentStatus(c){
  if(c.status==='Cancelada') return '<span class="badge gray">Cancelada</span>';
  const now=new Date(), today=todayISO();
  if(c.date!==today) return `<span class="badge info">${esc(c.status||'Agendada')}</span>`;
  const start=timeToMinutes(c.time), current=now.getHours()*60+now.getMinutes();
  const duration=Math.max(1,Number(c.duration||db.settings.duration||60));
  if(start!=null && current>=start && current<start+duration) return '<span class="badge ok">Agora</span>';
  if(start!=null && current<start) return '<span class="badge info">Próxima</span>';
  return `<span class="badge gray">${esc(c.status||'Realizada')}</span>`;
}
function renderDashboardEquipmentSchedule(){
  const wrap=document.getElementById('dashboardEquipmentSchedule');
  const countEl=document.getElementById('dashboardEquipmentCount');
  if(!wrap)return;
  ensureEquipmentData();
  const today=todayISO();
  const now=new Date();
  const current=now.getHours()*60+now.getMinutes();
  const rows=db.classes.filter(c=>c.date===today && c.status!=='Cancelada').sort((a,b)=>(timeToMinutes(a.time)||0)-(timeToMinutes(b.time)||0));
  const upcoming=rows.filter(c=>{
    const start=timeToMinutes(c.time);
    const duration=Math.max(1,Number(c.duration||db.settings.duration||60));
    return start==null || start+duration>=current;
  });
  if(countEl)countEl.textContent=`${upcoming.length} ${upcoming.length===1?'aula':'aulas'}`;
  if(!upcoming.length){
    wrap.innerHTML=`<div class="empty">Nenhuma aula restante para hoje. O painel será atualizado automaticamente quando a agenda mudar.</div>`;
    return;
  }
  wrap.innerHTML=`<div class="dashboard-equipment-list">${upcoming.map(c=>{
    const s=studentById(c.studentId);
    const eq=c.equipmentId?equipmentById(c.equipmentId):null;
    const eqLabel=eq?eq.name:'Equipamento a definir';
    const missing=!eq;
    const statusHtml=dashboardEquipmentStatus(c);
    return `<div class="dashboard-equipment-row ${statusHtml.includes('Agora')?'is-now':''}">
      <div class="dashboard-equipment-time"><span class="dashboard-equipment-label">Horário</span>${esc(formatTimeRange(c.time))}</div>
      <div class="dashboard-equipment-person"><span class="dashboard-equipment-label">Aluno</span><strong>${esc(s?.name||c.studentName||'Aluno não identificado')}</strong></div>
      <div class="dashboard-equipment-eq"><span class="dashboard-equipment-label">Equipamento</span><strong>${missing?'⚠️ ': '🧘 '}${esc(eqLabel)}</strong></div>
      <div class="dashboard-equipment-teacher"><span class="dashboard-equipment-label">Professor</span><strong>${esc(c.teacher||s?.teacher||'—')}</strong></div>
      <div class="dashboard-equipment-status">${statusHtml}</div>
    </div>`;
  }).join('')}</div>`;
}

/* RENDERS & DASHBOARD DINÂMICO */
function renderDashboard(){
  syncDeviceDateTime();
  // Saudação Dinâmica
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Bom dia" : hr < 18 ? "Boa tarde" : "Boa noite";
  document.getElementById("heroGreeting").textContent = db.settings.dashboardGreeting || `${greeting}, ${db.settings.owner || "Louise Karla"}!`;
  document.getElementById("heroSub").textContent = `Painel de controle do ${db.settings.studioName}.`;
  applyDashboardHero();

  // Métricas KPI
  const activeStudents = db.students.filter(s => s.status === "Ativo");
  document.getElementById("kpiStudents").textContent = activeStudents.length;

  const currentMonthStr = todayISO().slice(0,7);
  const monthFinance = db.finance.filter(f => f.dueDate && f.dueDate.startsWith(currentMonthStr));
  const monthIncome = monthFinance.filter(f => f.type !== "Despesa");
  
  const totalRev = monthIncome.reduce((acc, f) => acc + Number(f.value||0), 0);
  const totalRec = monthIncome.filter(f => f.status === "Pago").reduce((acc, f) => acc + Number(f.value||0), 0);
  
  document.getElementById("kpiRevenue").textContent = money(totalRev);
  document.getElementById("kpiReceived").textContent = money(totalRec);

  // Alertas Rápidos no Painel
  const alertsDiv = document.getElementById("dashboardAlerts");
  const pendingFinance = db.finance.filter(f => f.status === "Pendente");
  
  let alertHtml = "";
  if(pendingFinance.length > 0){
    alertHtml += `
      <div style="background:var(--surface-2);border:1px solid var(--warn);padding:12px 16px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">⚠️</span>
          <div><strong>${pendingFinance.length} mensalidades pendentes</strong> este mês.</div>
        </div>
        <button class="btn whatsapp small" onclick="openBatchWhatsAppModal()"><span class="wa-inline">${waIcon(17)}<span>Enviar Cobranças</span></span></button>
      </div>
    `;
  }
  alertsDiv.innerHTML = alertHtml;
  window.controlEquipmentDate=window.controlEquipmentDate||todayISO();
  renderControlEquipment();

  // O painel de equipamentos já exibe horário, aluno, professor e equipamento.
  // Aqui mostramos apenas exceções, evitando repetir a mesma agenda em dois cards.
  const today = todayISO();
  const dashClassesDiv = document.getElementById("dashboardClasses");
  if(dashClassesDiv){
    const pendingEquipment=db.classes.filter(c=>c.date===today&&c.status!=='Cancelada'&&!c.equipmentId)
      .sort((a,b)=>(timeToMinutes(a.time)||0)-(timeToMinutes(b.time)||0));
    dashClassesDiv.innerHTML=pendingEquipment.length
      ? pendingEquipment.map(c=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--line);gap:10px"><div><strong>${esc(c.time||'—')}</strong> — ${esc(c.studentName||studentById(c.studentId)?.name||'Aluno')}</div><span class="badge warning">⚠️ Equipamento a definir</span></div>`).join('')
      : `<div class="empty">Nenhuma aula de hoje está sem equipamento definido. A agenda completa está no painel acima.</div>`;
  }

  // Cobranças Pendentes no Painel
  const dashBillingDiv = document.getElementById("dashboardBilling");
  if(pendingFinance.length === 0){
    dashBillingDiv.innerHTML = `<div class="empty">Todas as mensalidades do mês estão pagas! 🎉</div>`;
  } else {
    dashBillingDiv.innerHTML = pendingFinance.slice(0, 5).map(f => {
      const s = db.students.find(x => x.id === f.studentId) || { name: f.studentName, whatsapp: f.whatsapp };
      const msg = replaceVars(db.settings.messages.billing, s, { value: f.value, due: f.dueDate });
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid var(--line)">
          <div>
            <strong>${esc(f.studentName)}</strong>
            <div class="muted" style="font-size:11px">${money(f.value)} • Vence: ${f.dueDate}</div>
          </div>
          <button class="btn whatsapp small" onclick="openWhatsApp('${esc(s.whatsapp||'')}', \`${esc(msg)}\`)"><span class="wa-inline">${waIcon(16)}<span>Cobrar</span></span></button>
        </div>
      `;
    }).join("");
  }

  renderCharts();
}

/* RENDERS DE OUTRAS ABAS (Mantendo compatibilidade) */
function renderStudentsLegacy(){
  const search = (document.getElementById("studentSearch")?.value || "").toLowerCase();
  const filter = document.getElementById("studentStatusFilter")?.value || "";

  const list = db.students.filter(s => {
    const matchSearch = (s.name||"").toLowerCase().includes(search) || (s.plan||"").toLowerCase().includes(search);
    const matchStatus = !filter || s.status === filter;
    return matchSearch && matchStatus;
  });

  const tbody = document.getElementById("studentsTable");
  if(!tbody) return;

  if(list.length === 0){
    tbody.innerHTML = `<tr><td colspan="7" class="empty">Nenhum aluno encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const msg = replaceVars(db.settings.messages.welcome, s);
    return `
      <tr>
        <td><strong>${esc(s.name)}</strong><br><small class="muted">${esc(s.whatsapp||'Sem Wpp')}</small></td>
        <td><span class="badge gray">${esc(s.plan||'Sem plano')}</span></td>
        <td>${esc(formatTimeRange(s.time||'-'))} (${esc(daysLabel(s.days||[]))})</td>
        <td>${esc(s.teacher||'-')}</td>
        <td><strong>${money(s.monthly)}</strong></td>
        <td><span class="badge ${s.status==='Ativo'?'ok':'bad'}">${s.status}</span></td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn whatsapp small icon" title="Enviar Boas-Vindas" aria-label="Enviar mensagem pelo WhatsApp" onclick="openWhatsApp('${esc(s.whatsapp||'')}', \`${esc(msg)}\`)">${waIcon(18)}</button>
            <button class="btn small icon" title="Ficha / Histórico" onclick="openStudentTimeline('${s.id}')">📋</button>
            <button class="btn small icon" title="Editar" onclick="openStudentModal('${s.id}')">✏️</button>
            <button class="btn danger small icon ios-delete-button" type="button" title="Excluir aluno" aria-label="Excluir aluno" onclick="deleteStudent('${s.id}')">${trashIcon(18)}</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function deleteStudent(id){
  const student = db.students.find(s => s.id === id);
  if(!student) return;
  const name = String(student.name || "este aluno");
  const confirmed = await iosConfirm(`Deseja realmente excluir o aluno “${name}”?\n\nO cadastro do aluno será removido. Registros financeiros e histórico já existentes serão preservados.`, {title:'Excluir aluno', okLabel:'Excluir', danger:true});
  if(!confirmed) return;
  const previousStudents = db.students.slice();
  db.students = db.students.filter(s => s.id !== id);
  if(!saveStudentVault(db.students) || !saveDB()){
    db.students = previousStudents;
    saveStudentVault(previousStudents);
    renderStudents();
    toast("Não foi possível excluir o aluno. Os dados foram preservados.");
    return;
  }
  renderAll();
  toast("Aluno excluído com sucesso.");
}

/* ALUNOS - SALVAR */
function openStudentModal(id=null){
  editingId = id;
  const s = db.students.find(x => x.id === id) || {};

  const planOptions = db.plans.map(p => `<option value="${esc(p.name)}" ${s.plan===p.name?"selected":""}>${esc(p.name)} — ${money(p.price)}</option>`).join("");
  const teacherOptions = db.teachers.map(t => `<option ${s.teacher===t?"selected":""}>${esc(t)}</option>`).join("");
  const hourOptions = db.hours.map(h => `<option ${s.time===h?"selected":""}>${h}</option>`).join("");

  const body = `
    <div class="form-grid">
      <div class="field full"><label>Nome Completo *</label><input id="fName" required autocomplete="name" value="${esc(s.name)}"></div>
      <div class="field"><label><span class="wa-label">${waIcon(14)} WhatsApp</span></label><input id="fWhatsapp" inputmode="tel" autocomplete="tel" placeholder="(81) 99999-9999" value="${esc(s.whatsapp)}"></div>
      <div class="field"><label>Data de Nascimento</label><input id="fBirth" type="date" value="${esc(s.birth)}"></div>
      <div class="field"><label>Data de Início</label><input id="fStart" type="date" value="${esc(s.startDate||"")}"></div>
      <div class="field"><label>Objetivo do Aluno</label><input id="fGoal" value="${esc(s.goal||"")}" placeholder="Ex.: fortalecimento, postura, reabilitação"></div>
      <div class="field full"><label>Plano</label><select id="fPlan"><option value="">Selecione</option>${planOptions}</select><div id="fPlanPrice" class="muted student-plan-price" aria-live="polite">${s.plan && db.plans.find(p=>p.name===s.plan) ? 'Mensalidade: ' + money(db.plans.find(p=>p.name===s.plan).price) : 'O valor da mensalidade é definido pelo plano.'}</div></div>
      <div class="field"><label>Dia de Vencimento</label><input id="fDue" type="number" min="1" max="31" value="${s.due??10}"></div>
      <div class="field"><label>Professor Responsável</label><select id="fTeacher"><option value="">Selecione</option>${teacherOptions}</select></div>
      <div class="field"><label>Horário Principal</label><select id="fTime"><option value="">Selecione</option>${hourOptions}</select></div>
      <div class="field full"><label>Dias da Semana <span class="required-mark">*</span></label><div class="student-days-picker" role="group" aria-label="Selecione os dias da semana em que o aluno irá frequentar as aulas">${[['1','SEG','Segunda'],['2','TER','Terça'],['3','QUA','Quarta'],['4','QUI','Quinta'],['5','SEX','Sexta'],['6','SÁB','Sábado'],['0','DOM','Domingo']].map(([v,l,a])=>`<label class="ios-day-chip"><input type="checkbox" class="fDay" value="${v}" ${normalizeStudentDays(s.days).includes(v)?'checked':''} aria-label="${a}"><span class="ios-day-check" aria-hidden="true">✓</span><span class="ios-day-label">${l}</span></label>`).join('')}</div><small class="muted" style="display:block;margin-top:7px">Selecione um ou mais dias em que o aluno irá frequentar as aulas.</small></div>
      <div class="field"><label>Status</label>
        <select id="fStatus">
          <option ${s.status==="Ativo"?"selected":""}>Ativo</option>
          <option ${s.status==="Inativo"?"selected":""}>Inativo</option>
          <option ${s.status==="Trancado"?"selected":""}>Trancado</option>
        </select>
      </div>
      <div class="field full"><label>Observações / Histórico de Saúde</label><textarea id="fNotes">${esc(s.notes)}</textarea></div>
    </div>
  `;
  openModal(id ? "Editar Aluno" : "Cadastrar Novo Aluno", body, saveStudent);
  const studentSaveButton=document.getElementById("modalSave");
  if(studentSaveButton){
    studentSaveButton.innerHTML = '<span class="ios-save-icon" aria-hidden="true">✓</span> ' + (id ? 'Salvar alterações' : 'Salvar aluno');
    studentSaveButton.setAttribute('aria-label', id ? 'Salvar alterações do aluno' : 'Salvar aluno');
  }
  const planSelect=document.getElementById("fPlan");
  const planPrice=document.getElementById("fPlanPrice");
  if(planSelect && planPrice){
    const updatePlanPrice=()=>{
      const selected=db.plans.find(p=>String(p?.name||"")===String(planSelect.value||""));
      planPrice.textContent=selected ? `Mensalidade definida pelo plano: ${money(selected.price)}` : "O valor da mensalidade é definido pelo plano.";
    };
    planSelect.addEventListener("change",updatePlanPrice);
    updatePlanPrice();
  }
}

function saveStudent(){
  const get = id => document.getElementById(id);
  const value = id => String(get(id)?.value ?? "").trim();
  try{
    if(!window.db || !Array.isArray(db.students)) db.students = [];
    if(!Array.isArray(db.plans)) db.plans = [];
    if(!Array.isArray(db.teachers)) db.teachers = [];
    if(!Array.isArray(db.hours)) db.hours = [];

    // Recupera imediatamente os alunos já persistidos antes de adicionar outro.
    // Isso evita que uma instância parcial do banco substitua cadastros anteriores.
    const persistedStudents=loadStudentVault();
    db.students=mergeStudentRecords(db.students,persistedStudents);

    const name=value("fName");
    if(!name){get("fName")?.focus();toast("Informe o nome completo do aluno.");return false;}
    const currentId=editingId||null;
    const existing=currentId?db.students.find(x=>x.id===currentId):null;
    const planName=value("fPlan");
    const selectedPlan=db.plans.find(p=>String(p?.name||"")===planName);
    const monthly=Number(selectedPlan?.price||0);
    if(!planName || !selectedPlan){get("fPlan")?.focus();toast("Selecione um plano para definir a mensalidade.");return false;}
    if(!Number.isFinite(monthly)||monthly<0){get("fPlan")?.focus();toast("O plano selecionado não possui um valor de mensalidade válido.");return false;}
    const selectedDays=normalizeStudentDays(Array.from(document.querySelectorAll("#modalBody .fDay:checked")).map(x=>x.value));
    if(!selectedDays.length){document.querySelector("#modalBody .fDay")?.focus();toast("Selecione pelo menos um dia da semana.");return false;}
    const dueRaw=value("fDue");
    const due=dueRaw===""?10:Number(dueRaw);
    if(!Number.isInteger(due)||due<1||due>31){get("fDue")?.focus();toast("O vencimento deve estar entre 1 e 31.");return false;}
    const birth=value("fBirth"), startDate=value("fStart");
    if(birth&&startDate&&startDate<birth){get("fStart")?.focus();toast("A data de início não pode ser anterior ao nascimento.");return false;}

    const student={
      id:currentId||uid("stu"),name,whatsapp:value("fWhatsapp"),
      email:existing?.email||"",birth,startDate,
      goal:value("fGoal"),address:existing?.address||"",emergency:existing?.emergency||"",plan:planName,
      monthly,due,teacher:value("fTeacher"),time:value("fTime"),
      days:selectedDays,
      status:value("fStatus")||"Ativo",notes:String(get("fNotes")?.value??""),
      clinical:existing?.clinical||{}, evolution:Array.isArray(existing?.evolution)?existing.evolution:[],
      createdAt:existing?.createdAt||new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };

    if(currentId){
      const idx=db.students.findIndex(x=>x.id===currentId);
      if(idx===-1){toast("Não foi possível localizar o aluno para edição.");return false;}
      db.students[idx]=student;
    }else{
      // Novo cadastro: nunca substitui os existentes; sempre acrescenta.
      db.students.push(student);
    }

    const studentsSnapshot=mergeStudentRecords([],db.students);
    if(!saveStudentVault(studentsSnapshot)){
      toast("Não foi possível salvar o cadastro dos alunos. Verifique o armazenamento do navegador.");
      return false;
    }

    if(!saveDB()){
      // Mantém o cadastro no cofre redundante, mas sinaliza a falha do banco principal.
      toast("Aluno salvo na proteção local, mas houve falha no banco principal. Reabra o sistema para sincronizar.");
      return false;
    }

    db.students=studentsSnapshot;
    try{renderAll();}catch(renderError){console.error("Aluno salvo, mas houve erro ao atualizar a interface:",renderError);}
    closeModal();
    toast(currentId?"Aluno atualizado com sucesso!":"Aluno cadastrado com sucesso!");
    return true;
  }catch(error){
    console.error("Erro ao salvar aluno:",error);
    toast("Ocorreu um erro ao salvar o aluno. Os dados permanecem no formulário.");
    return false;
  }
}

/* CONFIGURAÇÕES DE EMPRESA & PIX */
function loadGeneralSettingsInputs(){
  const set = db.settings;
  document.getElementById("setStudioName").value = set.studioName || "";
  document.getElementById("setOwner").value = set.owner || "";
  document.getElementById("setWhatsapp").value = set.whatsapp || "";
  document.getElementById("setInstagram").value = set.instagram || "";
  document.getElementById("setEmail").value = set.email || "";
  document.getElementById("setAddress").value = set.address || "";
  document.getElementById("setCapacity").value = set.capacity || 4;
  document.getElementById("setDuration").value = set.duration || 60;
  
  document.getElementById("setPixType").value = set.pixType || "CPF/CNPJ";
  document.getElementById("setPixKey").value = set.pixKey || "";
  document.getElementById("setPixName").value = set.pixName || "";

  const logoPreview = document.getElementById("logoPreview");
  const brandLogo = document.getElementById("brandLogo");
  if(logoPreview){
    logoPreview.innerHTML = set.logo
      ? `<img src="${set.logo}" alt="Logo">`
      : "Sem logo";
  }
  if(brandLogo){
    brandLogo.innerHTML = set.logo
      ? `<img src="${set.logo}" alt="Logo">`
      : "LK";
  }

  document.getElementById("msgBilling").value = set.messages.billing || "";
  document.getElementById("msgReminder").value = set.messages.reminder || "";
  document.getElementById("msgWelcome").value = set.messages.welcome || "";
  document.getElementById("msgBirthday").value = set.messages.birthday || "";
  document.getElementById("msgClass").value = set.messages.class || "";
}

function saveGeneralSettings(){
  db.settings.studioName = document.getElementById("setStudioName").value.trim();
  db.settings.owner = document.getElementById("setOwner").value.trim();
  db.settings.whatsapp = document.getElementById("setWhatsapp").value.trim();
  db.settings.instagram = document.getElementById("setInstagram").value.trim();
  db.settings.email = document.getElementById("setEmail").value.trim();
  db.settings.address = document.getElementById("setAddress").value.trim();
  db.settings.capacity = Number(document.getElementById("setCapacity").value || 4);
  db.settings.duration = Number(document.getElementById("setDuration").value || 60);

  db.settings.pixType = document.getElementById("setPixType").value;
  db.settings.pixKey = document.getElementById("setPixKey").value.trim();
  db.settings.pixName = document.getElementById("setPixName").value.trim();

  saveDB();
  renderAll();
  toast("Configurações do Studio atualizadas!");
}

function uploadDashboardHero(event){
  const file=event?.target?.files?.[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){toast('Selecione um arquivo de imagem válido.');return;}
  if(file.size>3*1024*1024){toast('Escolha uma imagem de até 3 MB.');return;}
  const reader=new FileReader();
  reader.onerror=()=>toast('Não foi possível ler a imagem. Tente novamente.');
  reader.onload=()=>{
    const dataUrl=String(reader.result||'');
    const probe=new Image();
    probe.onload=()=>{
      db.settings.dashboardHeroImage=dataUrl;
      saveDB();
      renderDashboard();
      requestAnimationFrame(()=>{
        applyDashboardHero();
        loadDashboardAppearance();
      });
      toast('Imagem carregada e aplicada ao painel.');
    };
    probe.onerror=()=>toast('A imagem foi selecionada, mas não pôde ser carregada.');
    probe.src=dataUrl;
  };
  reader.readAsDataURL(file);
}
function removeDashboardHeroImage(){
  db.settings.dashboardHeroImage='';
  const input=document.getElementById('dashboardHeroImageInput');if(input)input.value='';
  saveDB();renderDashboard();loadDashboardAppearance();toast('Imagem removida. O fundo padrão do sistema foi restaurado.');
}
function applyDashboardHero(){
  const hero=document.querySelector('#page-dashboard .hero');if(!hero)return;
  const image=String(db.settings.dashboardHeroImage||'');
  const key=db.settings.dashboardGradient||'violet';
  const gradients={
    violeta:'linear-gradient(135deg,#241047 0%,#4c1d95 55%,#7c3aed 100%)',
    rose:'linear-gradient(135deg,#3b102b 0%,#9d174d 55%,#ec4899 100%)',
    oceano:'linear-gradient(135deg,#06202b 0%,#075985 55%,#0891b2 100%)',
    menta:'linear-gradient(135deg,#06352d 0%,#047857 55%,#10b981 100%)',
    dourado:'linear-gradient(135deg,#3b2305 0%,#a16207 55%,#f59e0b 100%)',
    grafite:'linear-gradient(135deg,#111827 0%,#334155 55%,#64748b 100%)'
  };
  const grad=gradients[key]||gradients.violeta;
  const opacity=Math.max(35,Math.min(100,Number(db.settings?.interface?.backgroundOpacity??86)))/100;
  const overlayA=(0.82-opacity*0.55).toFixed(2);
  const overlayB=(0.34-opacity*0.22).toFixed(2);
  hero.style.backgroundImage=image?`linear-gradient(135deg,rgba(8,5,15,${overlayA}),rgba(8,5,15,${overlayB})),url("${image}")`:grad;
  hero.style.backgroundSize='cover';hero.style.backgroundPosition='center';
  document.querySelectorAll('.dashboard-palette').forEach(b=>b.classList.toggle('active',b.dataset.dashboardPalette===key));
}
function applyDashboardPalette(key){
  const allowed=['violeta','rose','oceano','menta','dourado','grafite'];
  if(!allowed.includes(key))key='violeta';
  db.settings.dashboardGradient=key;saveDB();applyDashboardHero();toast('Fundo do painel atualizado.');
}
function applyDashboardGradientLegacy(){applyDashboardHero();}

function loadDashboardAppearance(){
  applyAdvancedInterfaceSettings();
  const g=document.getElementById('dashboardGreetingText');if(g)g.value=db.settings.dashboardGreeting||'';
  const preview=document.getElementById('dashboardHeroPreview');
  const removeBtn=document.querySelector('.ios-delete-button[onclick*="removeDashboardHeroImage"]');
  const image=String(db.settings.dashboardHeroImage||'');
  if(preview){
    if(image){
      preview.innerHTML='';
      const img=document.createElement('img');
      img.alt='Fundo do painel';
      img.loading='eager';
      img.onload=()=>{preview.dataset.loaded='true';};
      img.onerror=()=>{preview.dataset.loaded='false';preview.textContent='Imagem não pôde ser carregada';};
      img.src=image;
      preview.appendChild(img);
    }else{
      preview.dataset.loaded='false';
      preview.textContent='Sem imagem';
    }
  }
  if(removeBtn)removeBtn.disabled=!image;
}
function saveDashboardAppearance(){
  db.settings.dashboardGreeting=document.getElementById('dashboardGreetingText')?.value.trim()||'';
  saveDB();renderDashboard();loadDashboardAppearance();toast('Painel principal atualizado.');
}
function resetDashboardAppearance(){
  db.settings.dashboardGreeting='';db.settings.dashboardHeroImage='';
  const input=document.getElementById('dashboardHeroImageInput');if(input)input.value='';
  saveDB();renderDashboard();loadDashboardAppearance();toast('Painel principal restaurado.');
}
function uploadLogo(event){
  const file=event?.target?.files?.[0];
  if(!file) return;
  if(!file.type.startsWith("image/")){ toast("Selecione uma imagem válida."); return; }
  const reader=new FileReader();
  reader.onload=()=>{
    db.settings.logo=reader.result;
    saveDB();
    loadGeneralSettingsInputs();
    toast("Logo atualizado com sucesso.");
  };
  reader.readAsDataURL(file);
}
async function removeLogo(){
  if(!db.settings.logo){ toast("Nenhum logo está cadastrado."); return; }
  const confirmed=await iosConfirm("O logo atual será removido da personalização do Studio.", {title:'Remover logo', okLabel:'Remover', danger:true});
  if(!confirmed) return;
  db.settings.logo="";
  const input=document.getElementById("logoInput");
  if(input) input.value="";
  saveDB();
  loadGeneralSettingsInputs();
  toast("Logo removido.");
}

const MESSAGE_TEMPLATES = {
  billing: {
    profissional: "Olá, {nome}.\n\nInformamos que a mensalidade do {studio} está disponível para pagamento.\n\nPlano: {plano}\nValor: R$ {valor}\nVencimento: {vencimento}\n\nPIX ({pix_tipo}): {pix}\nBeneficiário: {pix_nome}\n\nAgradecemos a atenção.",
    humanizada: "Olá, {nome}! 💜\n\nTudo bem? Passando para lembrar com carinho da sua mensalidade do {studio}.\n\nPlano: {plano}\nValor: R$ {valor}\nVencimento: {vencimento}\n\nPIX: {pix}\nBeneficiário: {pix_nome}\n\nSe precisar de qualquer coisa, estamos à disposição! 😊"
  },
  reminder: {
    express: "Olá, {nome}! 😊 Sua mensalidade do {studio}, no valor de R$ {valor}, vence em {vencimento}. PIX: {pix}. Se já realizou o pagamento, desconsidere esta mensagem. 💜"
  },
  welcome: {
    premium: "✨ Seja muito bem-vindo(a), {nome}!\n\nÉ uma alegria receber você no {studio}.\n\nPlano: {plano}\nHorário: {horario}\n\nPrepare-se para uma experiência de cuidado, movimento e bem-estar. Conte conosco! 💜"
  },
  class: {
    objetiva: "📅 Confirmação de aula\n\nOlá, {nome}! Sua aula no {studio} está confirmada para {horario}.\n\nAté lá! 😊"
  }
};
function applyMessageTemplate(field, templateKey){
  const template=MESSAGE_TEMPLATES[field]?.[templateKey];
  const target=document.getElementById("msg"+field.charAt(0).toUpperCase()+field.slice(1));
  if(!template || !target) return;
  target.value=template;
  target.focus();
  toast("Novo template aplicado. Revise e salve quando quiser.");
}

function saveMessages(){
  db.settings.messages.billing = document.getElementById("msgBilling").value;
  db.settings.messages.reminder = document.getElementById("msgReminder").value;
  db.settings.messages.welcome = document.getElementById("msgWelcome").value;
  db.settings.messages.birthday = document.getElementById("msgBirthday").value;
  db.settings.messages.class = document.getElementById("msgClass").value;

  saveDB();
  toast("Templates de mensagem salvos!");
}

/* TEMAS E PALETAS PROFISSIONAIS */
function toggleDarkModePro(){
  db.settings.darkMode = !db.settings.darkMode;
  saveDB();
  if(db.settings.darkMode) applyDarkPalette(db.settings.darkPalette||'ameixa');
  else applyThemeStyles();
}

function applyProfessionalPalette(presetKey, persist=true, notify=true, refresh=true){
  /* Paletas completas: cada preset define fundo, superfícies, texto, linhas e acentos.
     Isso evita que a troca de apenas --p deixe resíduos visuais da paleta anterior. */
  const presets = {
    lavanda:{bg:'#f4f2f8',card:'#ffffff',surface:'#f8f6fb',surface3:'#eeeaf4',ink:'#262231',muted:'#6f687a',line:'#e1dce9',input:'#ffffff',p:'#7b679d',p2:'#b9a7cf',a:'#9b86b3',focus:'rgba(123,103,157,.20)',gradient:'linear-gradient(135deg,#f4f2f8 0%,#eee8f5 55%,#e4dced 100%)'},
    salvia:{bg:'#f2f5f2',card:'#ffffff',surface:'#f7f9f7',surface3:'#e8eee8',ink:'#243029',muted:'#657169',line:'#dce5de',input:'#ffffff',p:'#5f7f68',p2:'#9bb7a0',a:'#76957d',focus:'rgba(95,127,104,.20)',gradient:'linear-gradient(135deg,#f2f5f2 0%,#e7eee8 55%,#dce8de 100%)'},
    oceano:{bg:'#f1f7fa',card:'#ffffff',surface:'#f7fafb',surface3:'#e4f0f4',ink:'#20313a',muted:'#647781',line:'#d9e7ed',input:'#ffffff',p:'#347c99',p2:'#71b3ca',a:'#4d9ab4',focus:'rgba(52,124,153,.20)',gradient:'linear-gradient(135deg,#f1f7fa 0%,#e5f1f5 55%,#d7ebf1 100%)'},
    rosegold:{bg:'#faf5f6',card:'#ffffff',surface:'#fcf8f9',surface3:'#f2e6e9',ink:'#33262b',muted:'#796b70',line:'#eadcdf',input:'#ffffff',p:'#ad647c',p2:'#d69aaa',a:'#bd7b91',focus:'rgba(173,100,124,.20)',gradient:'linear-gradient(135deg,#faf5f6 0%,#f5e9ed 55%,#f0dfe5 100%)'}
  };
  const t=presets[presetKey]||presets.lavanda;
  db.settings.darkMode=false;
  db.settings.theme={...t,preset:presetKey};
  const html=document.documentElement;
  html.removeAttribute('data-theme');
  [['--bg',t.bg],['--card',t.card],['--surface-2',t.surface],['--surface-3',t.surface3],['--input-bg',t.input],['--ink',t.ink],['--muted',t.muted],['--line',t.line],['--p',t.p],['--p2',t.p2],['--a',t.a],['--focus',t.focus],['--dashboard-gradient',t.gradient],['--hero-overlay-1','rgba(255,255,255,.08)'],['--hero-overlay-2','rgba(255,255,255,.025)']].forEach(([k,v])=>html.style.setProperty(k,v));
  if(persist) saveDB();
  document.getElementById('themeTogglePro')?.classList.remove('on');
  const label=document.getElementById('themeModeLabel'); if(label) label.textContent='Modo claro — '+presetKey.charAt(0).toUpperCase()+presetKey.slice(1);
  updatePaletteButtons();
  updateDarkPaletteButtons();
  if(refresh) renderDashboard();
  if(notify) toast(`Paleta ${presetKey.toUpperCase()} aplicada!`);
}

function updatePaletteButtons(){
  const key=db.settings?.theme?.preset||'lavanda';
  document.querySelectorAll('.palette-pro').forEach(b=>b.classList.toggle('active',b.dataset.palette===key));
}

function applyDarkPalette(key, persist=true, notify=true, refresh=true){
  const palettes={
    ameixa:{bg:'#111018',card:'#1a1822',surface:'#211e2b',surface3:'#2d2839',line:'#4a4355',ink:'#f7f4fb',muted:'#c5bdcf',input:'#17151e',p:'#a88bc9',p2:'#c6addf',a:'#d7bddf',focus:'rgba(168,139,201,.28)',gradient:'linear-gradient(135deg,#111018 0%,#29223a 58%,#403353 100%)'},
    grafite:{bg:'#0e1217',card:'#171c23',surface:'#202731',surface3:'#2b3541',line:'#46515e',ink:'#f2f5f8',muted:'#b9c2cc',input:'#12171d',p:'#8da0b3',p2:'#aebbc8',a:'#c7d1db',focus:'rgba(141,160,179,.28)',gradient:'linear-gradient(135deg,#0e1217 0%,#202a35 58%,#354250 100%)'}
  };
  const t=palettes[key]||palettes.ameixa;
  db.settings.darkPalette=key; db.settings.darkMode=true;
  db.settings.theme={...(db.settings.theme||{}),preset:key,p:t.p,p2:t.p2,a:t.a};
  const html=document.documentElement; html.setAttribute('data-theme','dark');
  [['--bg',t.bg],['--card',t.card],['--surface-2',t.surface],['--surface-3',t.surface3],['--input-bg',t.input],['--ink',t.ink],['--muted',t.muted],['--line',t.line],['--p',t.p],['--p2',t.p2],['--a',t.a],['--focus',t.focus],['--dashboard-gradient',t.gradient],['--hero-overlay-1','rgba(0,0,0,.12)'],['--hero-overlay-2','rgba(0,0,0,.035)']].forEach(([k,v])=>html.style.setProperty(k,v));
  if(persist) saveDB(); updatePaletteButtons(); updateDarkPaletteButtons();
  const label=document.getElementById('themeModeLabel'); if(label) label.textContent='Modo escuro — '+key.charAt(0).toUpperCase()+key.slice(1);
  document.getElementById('themeTogglePro')?.classList.add('on');
  if(refresh) renderDashboard();
  if(notify) toast(`Paleta ${key.toUpperCase()} aplicada — modo escuro.`);
}
function updateDarkPaletteButtons(){
  const key=db.settings.darkPalette||'ameixa';
  document.querySelectorAll('.dark-palette').forEach(b=>b.classList.toggle('active',b.dataset.darkPalette===key));
}

function applyDashboardGradient(){
  const gradients={
    violet:'linear-gradient(135deg,#241047 0%,#4c1d95 55%,#7c3aed 100%)',
    rose:'linear-gradient(135deg,#3b102b 0%,#9d174d 55%,#ec4899 100%)',
    ocean:'linear-gradient(135deg,#06202b 0%,#075985 55%,#0891b2 100%)',
    sage:'linear-gradient(135deg,#172313 0%,#365314 55%,#65a30d 100%)'
  };
  const key=db.settings.dashboardGradient||'violet';
  document.documentElement.style.setProperty('--dashboard-gradient',gradients[key]||gradients.violet);
}

function applyThemeStyles(){
  /* Aplicação visual silenciosa: renderizações/navegação não são alterações do usuário.
     Persistência e notificações acontecem somente na ação explícita de trocar a paleta. */
  if(db.settings.darkMode) applyDarkPalette(db.settings.darkPalette||'ameixa',false,false,false);
  else applyProfessionalPalette(db.settings.theme?.preset||'lavanda',false,false,false);
}

/* GRÁFICOS CHART.JS — paleta única derivada do tema ativo */
function hexToRgb(hex){
  const h=String(hex||'').replace('#','').trim();
  if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
}
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function mixHex(a,b,t){ const A=hexToRgb(a),B=hexToRgb(b); if(!A||!B)return a||b||'#7c3aed'; return rgbToHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t); }
function chartPalette(count=6){
  const t=db?.settings?.theme||{};
  const p=t.p||'#7c3aed', p2=t.p2||'#a78bfa', a=t.a||'#ec4899';
  const anchors=[p,p2,a], out=[];
  for(let i=0;i<count;i++){ const pos=count===1?0:i/(count-1), seg=pos*2, idx=Math.min(1,Math.floor(seg)), local=seg-idx; out.push(mixHex(anchors[idx],anchors[idx+1],local)); }
  return out;
}
function chartGridColor(){ return document.documentElement.getAttribute('data-theme')==='dark'?'rgba(255,255,255,.08)':'rgba(15,23,42,.07)'; }
function chartTextColor(){ return getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()||'#667085'; }

function renderCharts(){
  // Chart.js é opcional e carregado sob demanda para acelerar a abertura inicial.
  if(typeof Chart === "undefined"){
    ensureChartJS().then(ok=>{ if(ok) requestAnimationFrame(()=>renderCharts()); });
    return;
  }

  // Gráfico Faturamento vs Recebimento
  const ctxRev = document.getElementById("revenueChart");
  if(ctxRev){
    if(charts.revenue) charts.revenue.destroy();
    charts.revenue = new Chart(ctxRev, {
      type:"bar",
      data:{
        labels:["Previsto", "Recebido"],
        datasets:[{
          data:[
            parseFloat(document.getElementById("kpiRevenue").textContent.replace(/\D/g,"")/100||0),
            parseFloat(document.getElementById("kpiReceived").textContent.replace(/\D/g,"")/100||0)
          ],
          backgroundColor:[chartPalette(3)[0], chartPalette(3)[2]],
          borderRadius:8
        }]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }
    });
  }

  // Gráfico de Planos
  const ctxPlan = document.getElementById("planChart");
  if(ctxPlan){
    if(charts.plan) charts.plan.destroy();
    const plansCount = {};
    db.students.forEach(s => { if(s.plan) plansCount[s.plan] = (plansCount[s.plan]||0) + 1; });

    charts.plan = new Chart(ctxPlan, {
      type:"doughnut",
      data:{
        labels:Object.keys(plansCount),
        datasets:[{
          data:Object.values(plansCount),
          backgroundColor:chartPalette(Math.max(3,Object.keys(plansCount).length))
        }]
      },
      options:{ responsive:true, maintainAspectRatio:false }
    });
  }

  // Vagas Preenchidas por Horário — quantidade de alunos ativos x capacidade
  const ctxOcc = document.getElementById("dashboardOccupancyChart");
  if(ctxOcc){
    if(charts.dashboardOccupancy) charts.dashboardOccupancy.destroy();
    const hours = Array.isArray(db.hours) ? db.hours : [];
    const active = activeStudents();
    const values = hours.map(h => active.filter(s => String(s.time||s.horario||'')===String(h)).length);
    const cap = Number(db.settings.capacity||0);
    const totalCap = hours.length * cap;
    const totalUsed = values.reduce((a,b)=>a+b,0);
    const pct = totalCap ? Math.min(100,totalUsed/totalCap*100) : 0;
    const lab=document.getElementById('dashboardOccupancyLabel');if(lab)lab.textContent=pct.toFixed(0)+'%';
    charts.dashboardOccupancy = new Chart(ctxOcc,{type:'bar',data:{labels:hours,datasets:[{label:'Alunos',data:values,backgroundColor:chartPalette(5)[0],borderRadius:8,maxBarThickness:42}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} aluno(s)${cap?` de ${cap} vagas`:''}`}}},scales:{y:{beginAtZero:true,ticks:{precision:0},suggestedMax:cap||undefined}}}});
  }
}

/* COMPATIBILIDADE E INICIALIZAÇÃO */
function generateCharges(){
  const today = todayISO();
  const currentMonthStr = today.slice(0,7);

  db.students.filter(s => s.status === "Ativo").forEach(s => {
    const exists = db.finance.some(f => f.studentId === s.id && f.dueDate && f.dueDate.startsWith(currentMonthStr) && f.type !== 'Despesa');
    if(!exists){
      db.finance.push({
        id: uid("fin"),
        studentId: s.id,
        studentName: s.name,
        description: `Mensalidade — ${s.plan || 'Pilates'}`,
        value: s.monthly || 0,
        dueDate: `${currentMonthStr}-${String(s.due||10).padStart(2,'0')}`,
        status: "Pendente",
        paymentMethod: "PIX"
      });
    }
  });

  saveDB();
  renderAll();
  toast("Mensalidades do mês geradas com sucesso!");
}

const V9_BACKUP_HISTORY_KEY = "studio_pilates_louise_karla_v9_backup_history";

function getV9BackupHistory(){
  try{ const raw=localStorage.getItem(V9_BACKUP_HISTORY_KEY); const arr=raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch(e){ return []; }
}
function setV9BackupHistory(arr){ localStorage.setItem(V9_BACKUP_HISTORY_KEY, JSON.stringify(arr.slice(0,5))); }
function createManualBackup(){
  try{
    const snapshot={version:9,createdAt:new Date().toISOString(),data:clone(db)};
    const history=getV9BackupHistory(); history.unshift(snapshot); setV9BackupHistory(history);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(db));
    renderV9BackupStatus(); setStorageStatus('ok','Backup local criado'); toast('Cópia de segurança local criada.');
  }catch(e){ setStorageStatus('error','Falha no backup'); toast('Não foi possível criar o backup local.'); }
}
async function restoreLastLocalBackup(){
  const history=getV9BackupHistory();
  if(!history.length){toast('Nenhuma cópia local manual disponível.');return;}
  const confirmed=await iosConfirm('Restaurar a última cópia local? Os dados atuais serão substituídos.', {title:'Restaurar cópia', okLabel:'Restaurar', danger:false, icon:'restore'});
  if(!confirmed) return;
  const snap=history[0];
  if(!snap || !validateDB(snap.data)){toast('A última cópia local está inválida.');return;}
  db=mergeDefaults(snap.data); saveDB(); renderAll(); renderV9BackupStatus(); toast('Última cópia local restaurada.');
}
async function restoreV9BackupByIndex(index){
  const history=getV9BackupHistory(), snap=history[index];
  if(!snap || !validateDB(snap.data)) return toast('Cópia inválida.');
  const confirmed=await iosConfirm('Restaurar esta cópia de segurança? Os dados atuais serão substituídos.', {title:'Restaurar cópia', okLabel:'Restaurar', danger:false, icon:'restore'});
  if(!confirmed) return;
  db=mergeDefaults(snap.data); saveDB(); renderAll(); renderV9BackupStatus(); toast('Backup restaurado com sucesso.');
}
async function deleteV9BackupByIndex(index){
  const history=getV9BackupHistory();
  if(index<0 || index>=history.length) return;
  const confirmed=await iosConfirm("Excluir esta cópia de segurança local? Esta ação não apaga os dados atuais do sistema.", {title:'Excluir cópia', okLabel:'Excluir', danger:true});
  if(!confirmed) return;
  history.splice(index,1);
  setV9BackupHistory(history);
  renderV9BackupStatus();
  toast("Cópia de segurança excluída.");
}
async function deleteAllLocalBackups(){
  const history=getV9BackupHistory();
  if(!history.length){ toast("Não há cópias locais para excluir."); return; }
  const confirmed=await iosConfirm("Excluir todas as cópias de segurança locais? Os dados atuais do sistema não serão apagados.", {title:'Excluir todas as cópias', okLabel:'Excluir todas', danger:true});
  if(!confirmed) return;
  localStorage.removeItem(V9_BACKUP_HISTORY_KEY);
  renderV9BackupStatus();
  toast("Todas as cópias locais foram excluídas.");
}

function formatBytes(bytes){
  const n=Number(bytes||0);
  if(n<1024) return `${n} B`;
  if(n<1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(2)} MB`;
}
function getDatabaseRecordCount(){
  const collections=[db.plans,db.hours,db.teachers,db.payments,db.students,db.classes,db.finance,db.makeups,db.waitlist,db.equipment];
  return collections.reduce((sum,a)=>sum+(Array.isArray(a)?a.length:0),0);
}
function getDatabaseSizeBytes(){
  try{return new Blob([JSON.stringify(db)]).size;}catch(e){return JSON.stringify(db).length;}
}
function runDatabaseDiagnostics(showToast=true){
  const valid=validateDB(db);
  const size=getDatabaseSizeBytes();
  const records=getDatabaseRecordCount();
  const structure=document.getElementById('dbDiagStructure');
  const recordsEl=document.getElementById('dbDiagRecords');
  const storage=document.getElementById('dbDiagStorage');
  const time=document.getElementById('dbDiagTime');
  const current=document.getElementById('v9CurrentDBSize');
  if(structure){structure.textContent=valid?'✓ Íntegra':'⚠ Verificar'; structure.style.color=valid?'var(--success,#15803d)':'var(--danger,#d92d20)';}
  if(recordsEl) recordsEl.textContent=records.toLocaleString('pt-BR');
  if(storage) storage.textContent=formatBytes(size);
  if(current) current.textContent=formatBytes(size);
  if(time) time.textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  if(showToast) toast(valid?'Diagnóstico concluído: banco íntegro.':'Diagnóstico encontrou inconsistências no banco.');
  return valid;
}
function renderV9BackupStatus(){
  const history=getV9BackupHistory();
  const last=history[0];
  const date=last?.createdAt?new Date(last.createdAt).toLocaleString('pt-BR'): '—';
  const e=document.getElementById('v9LastBackup'); if(e)e.textContent=date;
  const c=document.getElementById('v9BackupCount'); if(c)c.textContent=history.length;
  const i=document.getElementById('v9BackupIntegrity'); if(i)i.textContent=last&&validateDB(last.data)?'✓ JSON válido':'—';
  runDatabaseDiagnostics(false);
  const h=document.getElementById('v9BackupHistory'); if(!h)return;
  h.innerHTML=history.length?`<div class="panel-title" style="margin-bottom:8px">Histórico das últimas 5 cópias</div><div class="table-wrap"><table style="min-width:620px"><thead><tr><th>Data</th><th>Versão</th><th>Integridade</th><th>Ação</th></tr></thead><tbody>${history.map((x,i)=>`<tr><td>${new Date(x.createdAt).toLocaleString('pt-BR')}</td><td>V${x.version||9}</td><td>${validateDB(x.data)?'✓ Válida':'⚠ Inválida'}</td><td><div class="row-actions"><button class="btn small" onclick="restoreV9BackupByIndex(${i})">Restaurar</button><button class="btn danger small icon ios-delete-button" onclick="deleteV9BackupByIndex(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Nenhuma cópia manual criada ainda.</div>';
}

function renderV9Alerts(){
  const el=document.getElementById('dashboardAlerts'); if(!el)return;
  const alerts=[]; const today=todayISO(); const now=new Date();
  const overdue=db.finance.filter(f=>f.status==='Pendente'&&f.dueDate&&f.dueDate<today);
  const pending=db.finance.filter(f=>f.status==='Pendente');
  const makeups=db.makeups.filter(m=>m.status==='Pendente');
  const wait=db.waitlist.filter(w=>w.status==='Aguardando'||w.status==='Contactar');
  const birthdays=db.students.filter(s=>s.birth).filter(s=>{const [y,m,d]=String(s.birth).split('-').map(Number); const target=new Date(now.getFullYear(),m-1,d); const start=new Date(now.getFullYear(),now.getMonth(),now.getDate()); const end=new Date(start); end.setDate(end.getDate()+7); return target>=start&&target<=end;});
  if(overdue.length) alerts.push({type:'bad',icon:'🔴',title:`${overdue.length} cobrança(s) vencida(s)`,sub:`${money(overdue.reduce((a,f)=>a+Number(f.value||0),0))} em aberto.`,action:`goPage('billing')`,label:'Ver cobranças'});
  else if(pending.length) alerts.push({type:'warn',icon:'⚠️',title:`${pending.length} cobrança(s) pendente(s)`,sub:`${money(pending.reduce((a,f)=>a+Number(f.value||0),0))} aguardando pagamento.`,action:`goPage('billing')`,label:'Abrir cobranças'});
  if(makeups.length) alerts.push({type:'info',icon:'🔄',title:`${makeups.length} reposição(ões) pendente(s)`,sub:'Há reposições aguardando agendamento.',action:`goPage('makeups')`,label:'Ver reposições'});
  if(wait.length) alerts.push({type:'info',icon:'⌛',title:`${wait.length} contato(s) na lista de espera`,sub:'Há pessoas aguardando vaga ou contato.',action:`goPage('waitlist')`,label:'Ver lista'});
  if(birthdays.length) alerts.push({type:'ok',icon:'🎂',title:`${birthdays.length} aniversário(s) nos próximos 7 dias`,sub:birthdays.slice(0,3).map(s=>s.name.split(' ')[0]).join(', '),action:`goPage('birthdays')`,label:'Ver aniversários'});
  el.innerHTML=alerts.length?`<div class="v9-alerts">${alerts.map(a=>`<div class="v9-alert ${a.type}"><div class="v9-alert-main"><span class="v9-alert-icon">${a.icon}</span><div class="v9-alert-text"><strong>${esc(a.title)}</strong><span>${esc(a.sub)}</span></div></div><button class="btn small" onclick="${a.action}">${a.label}</button></div>`).join('')}</div>`:'<div class="v9-alert ok"><div class="v9-alert-main"><span class="v9-alert-icon">✅</span><div class="v9-alert-text"><strong>Sistema em dia</strong><span>Nenhum alerta operacional crítico no momento.</span></div></div></div>';
}

function generateRecurringClasses(){
  const key=monthKey(currentMonth), [y,m]=key.split('-').map(Number); const last=new Date(y,m,0).getDate(); let created=0;
  const students=activeStudents().filter(s=>s.time&&Array.isArray(s.days)&&s.days.length);
  for(let day=1;day<=last;day++){
    const iso=`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`; const dow=new Date(iso+'T12:00:00').getDay();
    students.filter(s=>normalizeStudentDays(s.days).map(Number).includes(dow)).forEach(s=>{
      const exists=db.classes.some(c=>c.date===iso&&c.time===s.time&&c.studentId===s.id&&c.status!=='Cancelada');
      if(!exists){db.classes.push({id:uid('cls'),date:iso,time:s.time,studentId:s.id,studentName:s.name,teacher:s.teacher||'',status:'Agendada',notes:'Aula recorrente'});created++;}
    });
  }
  saveDB();renderAll();toast(created?`${created} aula(s) recorrente(s) gerada(s) para ${monthLabel(currentMonth)}.`:'Nenhuma nova aula recorrente foi necessária.');
}

function exportData(){
  const exportPayload = { schemaVersion: 9, exportedAt: new Date().toISOString(), data: db };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `backup_studio_pilates_${todayISO()}.json`;
  a.click();
}

function downloadBlobFile(content, type, filename){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}
function backupMetrics(){
  const students=Array.isArray(db.students)?db.students:[];
  const active=students.filter(s=>(s.status||'Ativo')==='Ativo');
  const plans={}; active.forEach(s=>{const k=s.plan||'Sem plano';plans[k]=(plans[k]||0)+1;});
  const hours={}; active.forEach(s=>{const k=s.time||'Sem horário';hours[k]=(hours[k]||0)+1;});
  const days={Seg:0,Ter:0,Qua:0,Qui:0,Sex:0,Sáb:0,Dom:0};
  const dn={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'};
  active.forEach(s=>(Array.isArray(s.days)?s.days:[]).forEach(d=>{const k=dn[String(d)];if(k)days[k]++;}));
  const finance=Array.isArray(db.finance)?db.finance:[];
  const revenue=finance.filter(f=>(f.type||'Receita')!=='Despesa'&&f.status!=='Cancelado').reduce((a,f)=>a+Number(f.value||0),0);
  const received=finance.filter(f=>(f.type||'Receita')!=='Despesa'&&f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  const expenses=finance.filter(f=>f.type==='Despesa'&&f.status!=='Cancelado').reduce((a,f)=>a+Number(f.value||0),0);
  const paidExpenses=finance.filter(f=>f.type==='Despesa'&&f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  return {students,active,plans,hours,days,finance,revenue,received,expenses,paidExpenses,net:received-paidExpenses,pending:Math.max(0,revenue-received),classes:Array.isArray(db.classes)?db.classes:[]};
}
function svgBarChart(title, data, unit=''){
  const entries=Object.entries(data).filter(x=>Number(x[1])>=0).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const max=Math.max(1,...entries.map(x=>Number(x[1]))); const w=720,h=220,left=155,row=28;
  const bars=entries.map(([label,val],i)=>{const y=35+i*row;const bw=Math.max(2,(Number(val)/max)*(w-left-35));return `<text x="8" y="${y+14}" font-size="11" fill="#334155">${esc(label).slice(0,25)}</text><rect x="${left}" y="${y}" width="${bw}" height="18" rx="5" fill="#7c3aed"/><text x="${left+bw+7}" y="${y+14}" font-size="11" fill="#334155">${esc(String(val))}${unit}</text>`;}).join('');
  return `<div class="pdf-chart"><h3>${esc(title)}</h3><svg viewBox="0 0 ${w} ${Math.max(h,50+entries.length*row)}" role="img" aria-label="${esc(title)}">${bars||'<text x="10" y="30" fill="#64748b">Sem dados disponíveis</text>'}</svg></div>`;
}
function svgDonut(title,data){
  const entries=Object.entries(data); const total=entries.reduce((a,x)=>a+Number(x[1]),0)||1; let angle=-Math.PI/2;
  const colors=['#7c3aed','#ec4899','#0891b2','#059669','#f59e0b','#64748b'];
  const paths=entries.slice(0,6).map(([label,val],i)=>{const frac=Number(val)/total,a1=angle,a2=angle+frac*Math.PI*2;angle=a2;const large=frac>.5?1:0;const x1=100+70*Math.cos(a1),y1=100+70*Math.sin(a1),x2=100+70*Math.cos(a2),y2=100+70*Math.sin(a2);return `<path d="M100 100 L${x1} ${y1} A70 70 0 ${large} 1 ${x2} ${y2} Z" fill="${colors[i%colors.length]}"/>`;}).join('');
  const legend=entries.slice(0,6).map(([l,v],i)=>`<span><i style="background:${colors[i%colors.length]}"></i>${esc(l)}: ${v}</span>`).join('');
  return `<div class="pdf-chart donut"><h3>${esc(title)}</h3><div class="donut-wrap"><svg viewBox="0 0 200 200">${paths}<circle cx="100" cy="100" r="38" fill="white"/><text x="100" y="105" text-anchor="middle" font-size="18" font-weight="800" fill="#1e293b">${total}</text></svg><div class="legend">${legend||'Sem dados'}</div></div></div>`;
}
function exportBackupPDF(){
  const m=backupMetrics(), now=new Date();
  const planData=m.plans, hourData=m.hours, dayData=m.days;
  const occupancy=m.active.length?Math.round(m.active.length/Math.max(1,Number(db.settings.capacity||4))*100):0;
  const studentRows=m.students.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR')).map(s=>`<tr><td>${esc(s.name||'')}</td><td>${esc(s.plan||'—')}</td><td>${esc(s.status||'Ativo')}</td><td>${esc(formatTimeRange(s.time||''))}</td><td>${esc(daysLabel(s.days||[]))}</td><td>${esc(s.teacher||'—')}</td></tr>`).join('');
  const financeRows=m.finance.slice().sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))).slice(0,60).map(f=>`<tr><td>${esc(dateBR(f.dueDate))}</td><td>${esc(f.description||'')}</td><td>${esc(f.type||'Receita')}</td><td>${esc(f.status||'')}</td><td>R$ ${Number(f.value||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>`).join('');
  const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Gerencial — ${esc(db.settings.studioName||'Studio de Pilates')}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;background:#fff;font-size:11px}h1{font-size:24px;margin:0 0 4px;color:#3b1a70}h2{font-size:16px;color:#3b1a70;margin:22px 0 8px}h3{font-size:12px;margin:0 0 8px;color:#334155}.sub{color:#64748b}.cover{border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:15px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kpi{border:1px solid #ddd6fe;border-radius:10px;padding:10px;background:#faf9ff}.kpi b{display:block;font-size:18px;color:#3b1a70;margin-top:3px}.charts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pdf-chart{border:1px solid #e2e8f0;border-radius:10px;padding:10px;break-inside:avoid}.pdf-chart svg{width:100%;height:auto}.donut-wrap{display:flex;align-items:center;gap:12px}.donut-wrap svg{max-width:180px}.legend{display:grid;gap:5px}.legend span{display:block}.legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{padding:6px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f1f5f9;font-size:10px}.note{padding:9px;border-left:4px solid #7c3aed;background:#f8f7ff;border-radius:5px;margin:8px 0;line-height:1.45}.pagebreak{break-before:page}.small{font-size:9px;color:#64748b}@media print{.no-print{display:none}.pagebreak{break-before:page}}
/* V11 — refinamentos de desempenho, acessibilidade e experiência */
html{scroll-padding-top:82px;overscroll-behavior-y:none}
body{overscroll-behavior-x:hidden;-webkit-tap-highlight-color:transparent}
button,.btn,.nav button,.settings-nav button,.mobile-bottom-nav button{touch-action:manipulation}
.page:not(.active){content-visibility:auto;contain:layout style paint}
.card,.panel,.kpi,.table-wrap,.modal{contain:layout style}
img{content-visibility:auto}
:focus-visible{outline:3px solid color-mix(in srgb,var(--p) 34%,transparent);outline-offset:2px}
html[data-ui-density="compact"] .content{padding:18px}
html[data-ui-density="compact"] .grid{gap:11px}
html[data-ui-density="compact"] .panel{padding:14px}
html[data-ui-density="compact"] .kpi{padding:14px}
html[data-ui-density="compact"] td{padding:8px}
html[data-ui-density="compact"] th{padding:8px}
html[data-ui-density="compact"] .page-head{margin-bottom:14px}
html[data-ui-density="compact"] .section{margin-top:13px}
html[data-ui-density="compact"] .page-title{font-size:25px}
html[data-ui-density="compact"] .topbar{height:64px}
html[data-reduce-effects="1"] *,html[data-reduce-effects="1"] *::before,html[data-reduce-effects="1"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
html[data-reduce-effects="1"] .sidebar,html[data-reduce-effects="1"] .topbar,html[data-reduce-effects="1"] .modal,html[data-reduce-effects="1"] .mobile-bottom-nav,html[data-reduce-effects="1"] .btn,html[data-reduce-effects="1"] .card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-reduce-effects="1"] .btn:hover{transform:none}
.v11-preference-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.v11-preference-btn{border:1px solid var(--line);background:var(--surface-2);color:var(--ink);border-radius:15px;padding:12px;text-align:left;min-height:72px}
.v11-preference-btn strong{display:block;font-size:13px}.v11-preference-btn small{display:block;color:var(--muted);margin-top:3px;line-height:1.35}
.v11-preference-btn.active{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 12%,transparent);background:color-mix(in srgb,var(--p) 8%,var(--surface-2))}
.v11-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--line)}
.v11-switch{width:48px;height:28px;border:0;border-radius:999px;background:var(--surface-3);position:relative;flex:none}
.v11-switch::after{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.18);transition:.18s}
.v11-switch.on{background:var(--p)}.v11-switch.on::after{transform:translateX(20px)}
.v11-shortcut{font-size:10px;color:var(--muted);border:1px solid var(--line);border-radius:7px;padding:2px 6px;background:var(--surface-2)}
@media(max-width:760px){
  html[data-ui-density="compact"] .content{padding:12px 10px 88px}
  .v11-preference-grid{grid-template-columns:1fr}
  .page-title{font-size:24px}
  .page-head{align-items:flex-start;flex-direction:column}
  .actions{width:100%}.actions .btn{flex:1}
  .topbar{padding:0 12px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
</style>
<style id="student-settings-ios18-fix">
#modalBody .fDay{accent-color:var(--p);width:18px!important;height:18px!important;margin:0;flex:0 0 auto}
#modalBody .schedule-chip{cursor:pointer;user-select:none;min-height:38px;padding:8px 11px!important;display:inline-flex;align-items:center;gap:7px;transition:transform .18s cubic-bezier(.2,.8,.2,1),background .18s ease,border-color .18s ease,box-shadow .18s ease}
#modalBody .schedule-chip:has(.fDay:checked){background:color-mix(in srgb,var(--p) 18%,transparent)!important;border-color:color-mix(in srgb,var(--p) 38%,var(--line))!important;box-shadow:0 5px 16px color-mix(in srgb,var(--p) 14%,transparent)}
#modalBody .schedule-chip:active{transform:scale(.96)}
@media(max-width:600px){#modalBody .schedule-chip{min-height:40px;padding:8px 10px!important;flex:1 1 calc(25% - 8px);justify-content:center}}
#modalBody input:invalid,#modalBody select:invalid{border-color:var(--bad)!important}
@media(max-width:600px){
 #modalBackdrop{padding:8px}#modalBackdrop .modal{width:100%;max-height:calc(100dvh - 16px);border-radius:28px}
 #modalBackdrop .modal-body{padding:14px}.modal-foot{padding:10px 12px calc(10px + env(safe-area-inset-bottom))}
 #modalBackdrop .modal-foot .btn{min-height:44px;flex:1}
}
#page-settings.active{display:grid;grid-template-columns:260px minmax(0,1fr);column-gap:18px;align-items:start}
#page-settings>.page-head{grid-column:1/-1;width:100%}
#page-settings>.settings-nav{grid-column:1;grid-row:2;display:grid;gap:6px;padding:8px;margin:0;border:1px solid var(--ios-border);border-radius:22px;background:var(--ios-glass);backdrop-filter:var(--ios-blur);-webkit-backdrop-filter:var(--ios-blur);box-shadow:var(--ios-shadow-soft);overflow:visible;position:sticky;top:94px}
#page-settings>.settings-nav button{position:relative;display:flex;align-items:center;min-height:48px;width:100%;padding:9px 32px 9px 43px;text-align:left;border:0;border-radius:14px;color:var(--ink);background:transparent;font-size:12px;font-weight:650;box-shadow:none;transition:background .16s,color .16s}
#page-settings>.settings-nav button::before{position:absolute;left:10px;width:25px;height:25px;display:grid;place-items:center;border-radius:8px;color:#fff;font-size:13px;font-weight:800}
#page-settings>.settings-nav button::after{content:"›";position:absolute;right:12px;color:var(--muted);font-size:20px;font-weight:300;line-height:1}
#page-settings>.settings-nav button:nth-child(1)::before{content:"⌂";background:#8b5cf6}
#page-settings>.settings-nav button:nth-child(2)::before{content:"$";background:#10b981}
#page-settings>.settings-nav button:nth-child(3)::before{content:"◷";background:#0ea5e9}
#page-settings>.settings-nav button:nth-child(4)::before{content:"♙";background:#f59e0b}
#page-settings>.settings-nav button:nth-child(5)::before{content:"▣";background:#14b8a6}
#page-settings>.settings-nav button:nth-child(6)::before{content:"✉";background:#ec4899}
#page-settings>.settings-nav button:nth-child(7)::before{content:"✦";background:#6366f1}
#page-settings>.settings-nav button:nth-child(8)::before{content:"⌾";background:#64748b}
#page-settings>.settings-nav button:hover{background:rgba(120,100,160,.08);color:var(--ink)}
#page-settings>.settings-nav button.active{background:var(--ios-glass-strong);color:var(--p);box-shadow:0 4px 14px rgba(50,40,80,.08)}
#page-settings>.settings-nav button.active::after{color:var(--p)}
#page-settings>.settings-section{grid-column:2;grid-row:2;min-width:0}
#page-settings>.settings-section .card{border-radius:24px}
#page-settings>.settings-section .section-title,#page-settings>.settings-section .panel-title{letter-spacing:-.2px}
#page-settings>.settings-section .section-title{font-size:15px}
#page-settings>.settings-section .field label{color:var(--muted)}
#page-settings>.settings-section .field input,#page-settings>.settings-section .field select,#page-settings>.settings-section .field textarea{min-height:43px}
#page-settings>.settings-section .theme-toggle-pro{border:1px solid var(--ios-line);border-radius:18px;background:rgba(255,255,255,.35)}
html[data-theme="dark"] #page-settings>.settings-section .theme-toggle-pro{background:rgba(255,255,255,.045)}
@media(max-width:900px){
 #page-settings.active{display:block}#page-settings>.page-head{margin-bottom:10px}
 #page-settings>.settings-nav{position:sticky;top:78px;z-index:20;display:flex;gap:6px;padding:6px;margin-bottom:12px;border-radius:18px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
 #page-settings>.settings-nav::-webkit-scrollbar{display:none}
 #page-settings>.settings-nav button{flex:0 0 auto;width:auto;min-width:142px;min-height:43px;padding:8px 26px 8px 38px;border-radius:13px;white-space:nowrap}
 #page-settings>.settings-nav button::after{right:8px}#page-settings>.settings-section{width:100%}
}
@media(max-width:600px){#page-settings>.settings-nav{top:72px}#page-settings>.settings-nav button{min-width:150px}#page-settings>.settings-section .card{border-radius:21px}}
/* V84 — page isolation: Configurações só pode renderizar quando sua página está ativa. */
.page#page-settings:not(.active){display:none!important;}
</style>

<style id="student-form-v27-fix">
#modalBody .student-plan-price{margin-top:7px;font-size:12px;font-weight:700;letter-spacing:.01em;color:var(--muted)}
#modalBody .student-days-picker{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:5px}
#modalBody .student-days-picker .schedule-chip{min-width:0;justify-content:center;text-align:center}
#modalBody .required-mark{color:var(--bad);font-weight:900}
@media(max-width:600px){#modalBody .student-days-picker{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}#modalBody .student-days-picker .schedule-chip{min-height:42px}}
</style>

<style id="ios27-v70-final-2">
/* v70 — paleta enxuta + Liquid Glass refinado + desempenho */
:root{--ios27-accent-soft:color-mix(in srgb,var(--p) 10%,transparent);--ios27-surface-tint:color-mix(in srgb,var(--p) 3%,white);}
.palette-grid-pro{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.palette-pro{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.42))!important}.palette-swatches{gap:4px}.palette-swatches span{height:24px;border-radius:7px}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dark-palette{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(40,40,50,.82),rgba(24,24,31,.66))!important}.dark-swatches{gap:4px}.dark-swatches span{height:22px;border-radius:7px}
html[data-theme="dark"] .palette-pro{background:rgba(255,255,255,.045)!important}
html[data-theme="dark"] .dark-palette.active,html[data-theme="dark"] .palette-pro.active{box-shadow:0 0 0 2px color-mix(in srgb,var(--p) 32%,transparent),0 12px 30px rgba(0,0,0,.22)!important}
/* Material hierarchy: blur fica concentrado nos elementos estruturais, evitando excesso de composição. */
.card,.panel,.kpi,.dashboard-equipment-row,.equipment-card-v40,.equipment-inventory-card,.rotation-block-v41,.rotation-center-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:blur(26px) saturate(165%)!important;-webkit-backdrop-filter:blur(26px) saturate(165%)!important}
@media(max-width:900px){.palette-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr))}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sidebar{backdrop-filter:blur(22px) saturate(155%)!important;-webkit-backdrop-filter:blur(22px) saturate(155%)!important}}
@media(prefers-reduced-transparency:reduce),(prefers-reduced-motion:reduce){.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.palette-pro:hover,.dark-palette:hover{transform:none!important}}
</style>
</head><body>
  <div class="cover"><h1>${esc(db.settings.studioName||'Studio de Pilates')}</h1><div class="sub">Relatório gerencial dinâmico • gerado em ${now.toLocaleString('pt-BR')}</div></div>
  <div class="kpis"><div class="kpi">Alunos ativos<b>${m.active.length}</b></div><div class="kpi">Receita prevista<b>R$ ${m.revenue.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Recebido<b>R$ ${m.received.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Ocupação estimada<b>${occupancy}%</b></div></div>
  <div class="note"><b>Como interpretar:</b> o PDF é uma fotografia dos dados atuais. Receita prevista considera receitas não canceladas; recebido considera lançamentos pagos; despesas pagas reduzem o resultado líquido. A ocupação é uma referência baseada na capacidade configurada do Studio.</div>
  <h2>1. Visão dos alunos e planos</h2><div class="charts">${svgDonut('Distribuição de alunos por plano',planData)}${svgBarChart('Alunos por horário',hourData)}</div>
  <h2>2. Distribuição semanal</h2>${svgBarChart('Alunos vinculados por dia da semana',dayData,' aluno(s)')}
  <h2>3. Indicadores financeiros</h2><div class="kpis"><div class="kpi">Pendente<b>R$ ${m.pending.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Despesas<b>R$ ${m.expenses.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Despesas pagas<b>R$ ${m.paidExpenses.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div><div class="kpi">Resultado recebido<b>R$ ${m.net.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></div></div>
  <div class="note"><b>Leitura gerencial:</b> use a diferença entre previsto e recebido para acompanhar cobranças; compare o resultado recebido com as despesas pagas para visualizar o caixa líquido registrado.</div>
  <div class="pagebreak"></div><h2>4. Cadastro detalhado dos alunos</h2><table><thead><tr><th>Aluno</th><th>Plano</th><th>Status</th><th>Horário</th><th>Dias</th><th>Professor</th></tr></thead><tbody>${studentRows||'<tr><td colspan="6">Nenhum aluno cadastrado.</td></tr>'}</tbody></table>
  <h2>5. Lançamentos financeiros</h2><table><thead><tr><th>Vencimento</th><th>Descrição</th><th>Tipo</th><th>Status</th><th>Valor</th></tr></thead><tbody>${financeRows||'<tr><td colspan="5">Nenhum lançamento.</td></tr>'}</tbody></table>
  <div class="small">Relatório gerado pelo sistema local do Studio. Os dados permanecem no dispositivo; este documento é uma exportação para análise e impressão.</div>
  <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),350));<\/script>

<style id="v35-unified-delete-actions">
/* Todas as ações destrutivas usam o mesmo padrão de ícone iOS. */
.ios-delete-button{
  display:inline-grid!important;place-items:center!important;
  width:40px!important;min-width:40px!important;height:40px!important;
  padding:0!important;margin:0!important;gap:0!important;
  border-radius:13px!important;font-size:0!important;line-height:0!important;
  color:var(--ink)!important;background:var(--ios-glass,rgba(255,255,255,.72))!important;
  border:1px solid rgba(120,120,128,.18)!important;
  box-shadow:0 2px 10px rgba(0,0,0,.05)!important;
  transition:transform .18s cubic-bezier(.22,1,.36,1),background-color .18s ease,color .18s ease,box-shadow .18s ease!important;
}
.ios-delete-button .ios-trash-svg{display:grid!important;place-items:center!important;width:19px!important;height:19px!important}
.ios-delete-button .ios-trash-svg svg{display:block!important;width:18px!important;height:18px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important}
.ios-delete-button:hover{color:#d92d20!important;background:rgba(217,45,32,.08)!important;box-shadow:0 5px 16px rgba(217,45,32,.12)!important}
.ios-delete-button:active{transform:scale(.90)!important}
@media (max-width:600px){.ios-delete-button{width:42px!important;min-width:42px!important;height:42px!important;border-radius:14px!important}.ios-delete-button .ios-trash-svg svg{width:18px!important;height:18px!important}}
html[data-theme="dark"] .ios-delete-button{color:var(--ink)!important;background:var(--ios-glass,rgba(28,28,30,.72))!important;border-color:rgba(255,255,255,.12)!important}
</style>
<style id="v47-final-layout-overrides">
#page-students .table-wrap{overflow-x:auto!important;scrollbar-width:auto!important}
#page-students .table-wrap::-webkit-scrollbar{height:12px}
#page-students .table-wrap::-webkit-scrollbar-thumb{background:rgba(120,120,140,.5);border-radius:999px;border:3px solid transparent;background-clip:padding-box}
</style>



</body></html>`;
  const w=window.open('','_blank'); if(!w){toast('Permita pop-ups para gerar o PDF.');return;} w.document.open();w.document.write(html);w.document.close(); toast('Relatório PDF preparado. Na janela aberta, escolha “Salvar como PDF”.');
}
function exportBackupCSV(){
  const m=backupMetrics(); const rows=[];
  rows.push(['RELATÓRIO GERAL DO STUDIO']); rows.push(['Gerado em',new Date().toLocaleString('pt-BR')]); rows.push([]);
  rows.push(['INDICADORES','VALOR']); rows.push(['Alunos ativos',m.active.length],['Alunos cadastrados',m.students.length],['Receita prevista',m.revenue.toFixed(2)],['Recebido',m.received.toFixed(2)],['Pendente',m.pending.toFixed(2)],['Despesas',m.expenses.toFixed(2)],['Despesas pagas',m.paidExpenses.toFixed(2)],['Resultado recebido',m.net.toFixed(2)]); rows.push([]);
  rows.push(['ALUNOS','PLANO','STATUS','HORÁRIO','DIAS','PROFESSOR']); m.students.forEach(s=>rows.push([s.name||'',s.plan||'',s.status||'Ativo',formatTimeRange(s.time||''),daysLabel(s.days||[]),s.teacher||''])); rows.push([]);
  rows.push(['PLANOS','ALUNOS']); Object.entries(m.plans).forEach(x=>rows.push(x)); rows.push([]);
  rows.push(['HORÁRIOS','ALUNOS']); Object.entries(m.hours).sort().forEach(([h,v])=>rows.push([formatTimeRange(h),v])); rows.push([]);
  rows.push(['DIA','ALUNOS VINCULADOS']); Object.entries(m.days).forEach(x=>rows.push(x)); rows.push([]);
  rows.push(['FINANCEIRO','DESCRIÇÃO','TIPO','STATUS','VENCIMENTO','VALOR']); m.finance.forEach(f=>rows.push([f.studentName||'',f.description||'',f.type||'Receita',f.status||'',dateBR(f.dueDate),Number(f.value||0).toFixed(2)]));
  const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\n'); downloadBlobFile('\uFEFF'+csv,'text/csv;charset=utf-8;',`backup_detalhado_studio_${todayISO()}.csv`); toast('CSV detalhado gerado.');
}

async function importData(evt){
  const file = evt.target.files[0];
  evt.target.value = '';
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      const payload = parsed && parsed.data ? parsed.data : parsed;
      if(!validateDB(payload)){
        toast("Arquivo JSON inválido ou incompatível com este sistema.");
        return;
      }
      const incoming=mergeDefaults(payload);
      const confirmed=await iosConfirm('Importar este banco? Os dados atuais serão substituídos. Recomenda-se criar um backup antes.', {title:'Importar banco', okLabel:'Importar', danger:true, icon:'warning'});
      if(!confirmed) return;
      db=incoming;
      if(!saveDB()) return;
      saveStudentVault(db.students);
      renderAll();
      renderV9BackupStatus();
      setStorageStatus('ok','Banco importado e validado');
      toast("Backup importado e validado com sucesso!");
    }catch(err){
      console.error('Erro ao importar banco:',err);
      setStorageStatus('error','Falha ao importar banco');
      toast("Erro ao ler o arquivo JSON.");
    }
  };
  reader.readAsText(file);
}

async function resetData(){
  const confirmed=await iosConfirm("Essa ação apaga os cadastros locais e restaura o sistema aos dados de fábrica.", {title:'Restaurar dados de fábrica', okLabel:'Restaurar', danger:true, icon:'warning'});
  if(!confirmed) return;
  db = clone(defaultData);
  if(!saveDB()) return;
  saveStudentVault(db.students);
  localStorage.removeItem(V9_BACKUP_HISTORY_KEY);
  renderAll();
  renderV9BackupStatus();
  setStorageStatus('ok','Dados de fábrica restaurados');
  toast("Sistema restaurado aos dados originais.");
}


/* V7 — MÓDULOS OPERACIONAIS COMPLETOS */
function ensureV7Data(){
  ensurePatientEvolutionData();
  ensureEquipmentData();
  db.students.forEach(s=>{ s.days=normalizeStudentDays(s.days); });
  db.classes.forEach(c=>{ if(!c.status) c.status='Agendada'; });
  db.makeups.forEach(m=>{ if(!m.status) m.status='Pendente'; });
  db.waitlist.forEach(w=>{ if(!w.status) w.status='Aguardando'; if(!w.createdAt) w.createdAt=new Date().toISOString(); });
  if(!db.settings.teacherRates) db.settings.teacherRates={};
}
function dateBR(v){ if(!v) return '-'; const [y,m,d]=String(v).slice(0,10).split('-'); return d&&m&&y?`${d}/${m}/${y}`:v; }
function dateTimeSort(a,b){ return String(a.date||'').localeCompare(String(b.date||'')) || String(a.time||'').localeCompare(String(b.time||'')); }
function monthKey(d=new Date()){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function monthLabel(d=new Date()){ return d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); }
function sameMonth(date,key){ return String(date||'').slice(0,7)===key; }
function studentById(id){ return db.students.find(s=>s.id===id); }
function normalizeAllStudentDays(){ if(!Array.isArray(db.students)) db.students=[]; db.students.forEach(s=>{ s.days=normalizeStudentDays(s.days); }); }
function classById(id){ return db.classes.find(c=>c.id===id); }
function classStatusBadge(st){ const map={Realizada:'ok',Agendada:'info','Cancelada':'bad','Falta':'warn','Reposição':'info'}; return `<span class="badge ${map[st]||'gray'}">${esc(st||'Agendada')}</span>`; }
function studentStatusBadge(st){ const map={Ativo:'ok',Inativo:'gray',Trancado:'warn'}; return `<span class="badge ${map[st]||'gray'}">${esc(st||'')}</span>`; }
function teacherRateLegacy(t){ return Number((db.settings.teacherRates||{})[t]||0); }
function normalizeStudentDays(days){
  const valid=['0','1','2','3','4','5','6'];
  const aliases={dom:'0',domingo:'0',seg:'1',segunda:'1','segunda-feira':'1',ter:'2','terça':'2',terca:'2','terça-feira':'2','terca-feira':'2',qua:'3',quarta:'3','quarta-feira':'3',qui:'4',quinta:'4','quinta-feira':'4',sex:'5',sexta:'5','sexta-feira':'5','sáb':'6',sab:'6','sábado':'6',sabado:'6'};
  const raw=Array.isArray(days)?days:(days==null||days===''?[]:String(days).split(/[,;|\s]+/));
  const out=[];
  raw.forEach(x=>{
    const k=String(x).trim().toLowerCase();
    if(valid.includes(k)) out.push(k); else if(aliases[k]) out.push(aliases[k]);
  });
  const order={1:0,2:1,3:2,4:3,5:4,6:5,0:6};
  return [...new Set(out)].sort((a,b)=>order[a]-order[b]);
}
function daysLabel(days){ const names={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'}; return normalizeStudentDays(days).map(x=>names[x]).join(', ') || '—'; }
function isoDayOfWeek(date){ return new Date(date+'T12:00:00').getDay(); }
function activeStudents(){ return db.students.filter(s=>s.status==='Ativo'); }
function classesForMonth(key){ return db.classes.filter(c=>sameMonth(c.date,key)).sort(dateTimeSort); }
function actualClassCount(key){ return classesForMonth(key).filter(c=>c.status==='Realizada').length; }


function evolutionDefaultEntry(s){return{id:uid('evo'),date:todayISO(),title:'Evolução',complaint:s?.clinical?.complaint||'',objective:s?.clinical?.objective||s?.goal||'',assessment:'',pain:s?.clinical?.pain||'',intervention:'',response:'',nextSteps:s?.clinical?.plan||'',professional:s?.teacher||''};}
function evolutionSummary(s){return(Array.isArray(s?.evolution)?s.evolution:[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));}function openClinicalProfile(id){
  const s=studentById(id);if(!s)return;const c=s.clinical||{};
  const b=`<div class="evolution-grid-v40"><div class="evolution-section-v40"><h3>Identificação clínica</h3>
  <div class="field"><label>Queixa principal</label><textarea id="cpComplaint">${esc(c.complaint||'')}</textarea></div>
  <div class="field"><label>Objetivo terapêutico/funcional</label><textarea id="cpObjective">${esc(c.objective||s.goal||'')}</textarea></div>
  <div class="field"><label>Diagnóstico / condição informada</label><textarea id="cpDiagnosis">${esc(c.diagnosis||'')}</textarea></div>
  <div class="field"><label>Histórico relevante</label><textarea id="cpMedical">${esc(c.medicalHistory||'')}</textarea></div>
  <div class="field"><label>Medicamentos / informações relevantes</label><textarea id="cpMeds">${esc(c.medications||'')}</textarea></div>
  <div class="field"><label>Contraindicações / cuidados</label><textarea id="cpContra">${esc(c.contraindications||'')}</textarea></div></div>
  <div class="evolution-section-v40"><h3>Avaliação funcional</h3>
  <div class="field"><label>Dor / escala e localização</label><textarea id="cpPain">${esc(c.pain||'')}</textarea></div>
  <div class="field"><label>Postura</label><textarea id="cpPosture">${esc(c.posture||'')}</textarea></div>
  <div class="field"><label>Mobilidade / amplitude</label><textarea id="cpMobility">${esc(c.mobility||'')}</textarea></div>
  <div class="field"><label>Força / resistência</label><textarea id="cpStrength">${esc(c.strength||'')}</textarea></div>
  <div class="field"><label>Equilíbrio / coordenação</label><textarea id="cpBalance">${esc(c.balance||'')}</textarea></div>
  <div class="field"><label>Respiração / controle motor</label><textarea id="cpBreathing">${esc(c.breathing||'')}</textarea></div>
  <div class="field"><label>Medidas / testes / referências</label><textarea id="cpMeasurements">${esc(c.measurements||'')}</textarea></div></div>
  <div class="evolution-section-v40"><h3>Planejamento</h3>
  <div class="field"><label>Frequência planejada</label><input id="cpFrequency" value="${esc(c.frequency||'')}"></div>
  <div class="field"><label>Plano de intervenção</label><textarea id="cpPlan">${esc(c.plan||'')}</textarea></div>
  <div class="field"><label>Orientações para casa</label><textarea id="cpHome">${esc(c.homecare||'')}</textarea></div>
  <div class="field"><label>Próxima reavaliação</label><input id="cpNext" type="date" value="${esc(c.nextReview||'')}"></div>
  <div class="field"><label>Alertas / pontos de atenção</label><textarea id="cpAlerts">${esc(c.alerts||'')}</textarea></div></div></div>`;
  openModal(`Ficha clínica — ${esc(s.name)}`,b,()=>{s.clinical={complaint:cpComplaint.value.trim(),objective:cpObjective.value.trim(),diagnosis:cpDiagnosis.value.trim(),medicalHistory:cpMedical.value.trim(),medications:cpMeds.value.trim(),contraindications:cpContra.value.trim(),pain:cpPain.value.trim(),posture:cpPosture.value.trim(),mobility:cpMobility.value.trim(),strength:cpStrength.value.trim(),balance:cpBalance.value.trim(),breathing:cpBreathing.value.trim(),measurements:cpMeasurements.value.trim(),frequency:cpFrequency.value.trim(),plan:cpPlan.value.trim(),homecare:cpHome.value.trim(),nextReview:cpNext.value,alerts:cpAlerts.value.trim()};s.goal=s.clinical.objective||s.goal||'';s.updatedAt=new Date().toISOString();saveDB();renderAll();toast('Ficha clínica atualizada.');return true;});
}function studentEquipmentHistory7(studentId,date,time,ignoreId=''){
  const targetDate=date||todayISO(), targetTime=time||'23:59';
  const target=new Date(`${targetDate}T${targetTime}`).getTime();
  return db.classes.filter(c=>c.studentId===studentId&&c.equipmentId&&c.status!=='Cancelada'&&c.id!==ignoreId).filter(c=>{
    const t=new Date(`${c.date}T${c.time||'00:00'}`).getTime();
    return Number.isFinite(t)&&t<target;
  }).sort((a,b)=>{
    const ta=new Date(`${a.date}T${a.time||'00:00'}`).getTime(),tb=new Date(`${b.date}T${b.time||'00:00'}`).getTime();
    return tb-ta;
  }).slice(0,7);
}
function studentRotationUI(s){
  ensureEquipmentData();
  const date=todayISO(), time=s.time||'23:59';
  const last=previousEquipmentForStudent(s.id,date,time,'');
  const lastEq=last?.equipmentId?equipmentById(last.equipmentId):null;
  const suggested=recommendEquipment(s.id,date,time,'');
  const persisted=String(s.nextEquipmentId||'');
  const persistedEq=persisted?activeEquipment().find(e=>String(e.id)===persisted):null;
  const persistedValid=!!(persistedEq && String(persistedEq.id)!==String(last?.equipmentId||'') && equipmentAvailable(persistedEq,date,time,''));
  const selected=persistedValid?persisted:(suggested?.id||'');
  const candidates=equipmentRotationCandidates(s.id,date,time,'');
  const all=activeEquipment();
  const ordered=[...candidates,...all.filter(e=>!candidates.some(x=>String(x.id)===String(e.id)))];
  const options=ordered.map(e=>{
    const available=equipmentAvailable(e,date,time,'');
    const repeated=lastEq&&String(e.id)===String(lastEq.id);
    const disabled=!available||repeated;
    const label=`${e.name}${repeated?' · último usado':(!available?' · indisponível':'')}`;
    return `<option value="${esc(e.id)}" ${String(selected)===String(e.id)?'selected':''} ${disabled?'disabled':''}>${esc(label)}</option>`;
  }).join('');
  const history=studentEquipmentHistory7(s.id,date,time,'');
  const historyHtml=history.length?`<div class="student-rotation-history-title"><span>Histórico recente</span><span>últimos ${history.length} de 7</span></div><div class="student-rotation-history">${history.map((c,i)=>{
    const eq=c.equipmentId?equipmentById(c.equipmentId):null;
    const labelDate=String(c.date||'').split('-').reverse().join('/');
    return `<div class="student-rotation-history-item" data-index="${i+1}" title="${esc(`${labelDate} · ${c.time||''}`)}"><strong>${esc(eq?.name||'Equipamento')}</strong><small>${esc(labelDate)} · ${esc(c.time||'—')}</small></div>`;
  }).join('')}</div>`:`<div class="student-rotation-history-title"><span>Histórico recente</span><span>0 de 7</span></div><div class="student-rotation-empty">Nenhum equipamento utilizado anteriormente. O histórico será preenchido automaticamente após as aulas.</div>`;
  const stateClass=suggested?'':' warn';
  const stateText=suggested?'Rodízio disponível':'Sem equipamento disponível';
  return `<div class="student-rotation-card">
    <div class="student-rotation-head">
      <div class="student-rotation-heading">
        <div class="student-rotation-heading-icon" aria-hidden="true">🧘</div>
        <div class="student-rotation-heading-text"><div class="student-rotation-heading-title">Rodízio de equipamento</div><div class="student-rotation-heading-sub">Seleção automática baseada no histórico e disponibilidade</div></div>
      </div>
      <span class="student-rotation-state${stateClass}">${stateText}</span>
    </div>
    <div class="student-rotation-main">
      <div class="student-rotation-metric last"><div class="student-rotation-metric-label">↩ Último usado</div><strong>${lastEq?esc(lastEq.name):'Nenhum registro'}</strong></div>
      <div class="student-rotation-metric next"><div class="student-rotation-metric-label">→ Próximo sugerido</div><strong>${suggested?esc(suggested.name):'Sem disponibilidade'}</strong></div>
    </div>
    <div class="student-rotation-control">
      <select class="student-rotation-select" aria-label="Próximo equipamento de ${esc(s.name)}" onchange="setStudentNextEquipment('${s.id}',this.value)"><option value="">Automático — Rodízio</option>${options}</select>
      <button class="btn small primary student-rotation-book" type="button" onclick="openClassModal(null,'${s.id}',null,'${esc(selected)}')">＋ Aula</button>
    </div>
    <div class="student-rotation-history-wrap">${historyHtml}</div>
    <div class="student-rotation-foot">
      <span class="student-rotation-note">${lastEq?'🔒 '+esc(lastEq.name)+' não será repetido imediatamente.':'🔄 Rodízio automático ativo.'}</span>
      <span class="student-rotation-note">Horário: <strong>${esc(s.time||'—')}</strong></span>
    </div>
  </div>`;
}
function setStudentNextEquipment(studentId,equipmentId){
  const s=studentById(studentId);if(!s)return;
  const id=String(equipmentId||'');
  const date=todayISO(),time=s.time||'23:59';
  const last=previousEquipmentForStudent(studentId,date,time,'');
  if(id){
    const eq=activeEquipment().find(e=>String(e.id)===id);
    if(!eq){toast('Esse equipamento não está ativo no rodízio.');renderStudents();return;}
    if(last?.equipmentId && String(last.equipmentId)===id){
      toast('O equipamento usado na última aula não pode ser repetido imediatamente.');
      renderStudents();return;
    }
    if(!equipmentAvailable(eq,date,time,'')){
      toast('Esse equipamento está indisponível para o horário do aluno.');
      renderStudents();return;
    }
  }
  s.nextEquipmentId=id;
  s.updatedAt=new Date().toISOString();
  if(!saveDB())return;
  renderStudents();
  toast(id?'Próximo equipamento salvo.':'Rodízio automático restaurado.');
}
function renderStudents(){
  ensureV7Data();
  normalizeAllStudentDays();
  ensureEquipmentData();
  const q=(document.getElementById('studentSearch')?.value||'').toLowerCase().trim();
  const status=document.getElementById('studentStatusFilter')?.value||'';
  const list=db.students.filter(s=>{
    const text=[s.name,s.whatsapp,s.plan,s.teacher].join(' ').toLowerCase();
    return (!q||text.includes(q))&&(!status||s.status===status);
  }).sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'));
  const el=document.getElementById('studentsTable');if(!el)return;
  if(!list.length){el.innerHTML='<tr><td colspan="7"><div class="empty">Nenhum aluno encontrado.</div></td></tr>';return;}
  el.innerHTML=list.map(s=>`<tr>
    <td><strong>${esc(s.name)}</strong><div class="muted" style="font-size:11px">${esc(s.whatsapp||'Sem WhatsApp')}</div></td>
    <td>${esc(s.plan||'—')}<div class="muted" style="font-size:11px">${s.days?.length?daysLabel(s.days):'Dias não definidos'}</div></td>
    <td><strong>${esc(s.time||'—')}</strong><div>${s.days?.length?daysLabel(s.days):'—'}</div></td>
    <td>${esc(s.teacher||'—')}</td>
    <td><strong>${money(s.monthly)}</strong><div class="muted" style="font-size:11px">Venc. dia ${s.due||10}</div></td>
    <td>${studentStatusBadge(s.status)}</td>
    <td><div class="row-actions student-quick-actions">
      <button class="btn small" onclick="openStudentModal('${s.id}')">Editar</button>
      ${s.whatsapp?`<button class="btn whatsapp small icon student-wa-action" type="button" title="Enviar WhatsApp" aria-label="Enviar WhatsApp para ${esc(s.name)}" onclick="openStudentWhatsApp('${s.id}')"><span class="wa-inline" aria-hidden="true">${waIcon(18)}</span></button>`:''}
      <button class="btn small" onclick="openStudentFinancial('${s.id}')">Financeiro</button><button class="btn small" onclick="openEvolutionModal('${s.id}')">Evolução</button>
      <button class="btn small" onclick="openClassModal(null,'${s.id}')">＋ Aula</button>
      <button class="btn danger small icon ios-delete-button" type="button" title="Excluir aluno" aria-label="Excluir aluno ${esc(s.name)}" onclick="deleteStudent('${s.id}')">${trashIcon(16)}</button>
    </div></td>
  </tr>`).join('');
}

function openStudentWhatsApp(id){ const s=studentById(id); if(!s)return; openWhatsApp(s.whatsapp,replaceVars(db.settings.messages.welcome,s)); }
function openStudentFinancial(id){
  const s=studentById(id); if(!s)return;
  const rows=db.finance.filter(f=>f.studentId===id).sort((a,b)=>String(b.dueDate).localeCompare(String(a.dueDate)));
  const total=rows.reduce((a,f)=>a+Number(f.value||0),0), paid=rows.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  openModal(`Financeiro — ${esc(s.name)}`,`<div class="module-kpis"><div class="module-kpi"><div class="label">Lançado</div><div class="value">${money(total)}</div></div><div class="module-kpi"><div class="label">Pago</div><div class="value">${money(paid)}</div></div><div class="module-kpi"><div class="label">Pendente</div><div class="value">${money(total-paid)}</div></div><div class="module-kpi"><div class="label">Plano</div><div class="value" style="font-size:15px">${esc(s.plan||'—')}</div></div></div><div class="table-wrap"><table><thead><tr><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>${rows.map(f=>`<tr><td>${dateBR(f.dueDate)}</td><td>${money(f.value)}</td><td>${f.status==='Pago'?'<span class="badge ok">Pago</span>':'<span class="badge warn">Pendente</span>'}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">Nenhum lançamento.</div></td></tr>'}</tbody></table></div>`,closeModal);
}

function renderAgenda(){
  ensureV7Data();
  const y=currentMonth.getFullYear(), m=currentMonth.getMonth();
  const key=`${y}-${String(m+1).padStart(2,'0')}`;
  const title=document.getElementById('calendarMonth'); if(title) title.textContent=monthLabel(currentMonth);
  const cal=document.getElementById('calendar');
  if(cal){
    const first=new Date(y,m,1), start=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();
    let html=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<div class="calendar-week">${x}</div>`).join('');
    const total=Math.ceil((start+days)/7)*7;
    for(let i=0;i<total;i++){
      const n=i-start+1; let d=n, other=false;
      if(n<1){d=prevDays+n;other=true;} else if(n>days){d=n-days;other=true;}
      const date=other?(n<1?new Date(y,m-1,d):new Date(y,m+1,d)):new Date(y,m,d);
      const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const events=db.classes.filter(c=>c.date===iso).sort(dateTimeSort).slice(0,3);
      html+=`<div class="day-cell ${other?'other':''} ${iso===todayISO()?'today':''}" onclick="openClassModal('${iso}')"><div class="day-number">${d}</div>${events.map(c=>`<div class="event" title="${esc(c.studentName||'')}">${esc(formatTimeRange(c.time||''))} · ${esc(c.studentName||'')}</div>`).join('')}${db.classes.filter(c=>c.date===iso).length>3?`<div class="event">+${db.classes.filter(c=>c.date===iso).length-3} aulas</div>`:''}</div>`;
    }
    cal.innerHTML=html;
  }
  const monthClasses=classesForMonth(key), table=document.getElementById('classesTable');
  if(document.getElementById('classCount')) document.getElementById('classCount').textContent=`${monthClasses.length} aula${monthClasses.length===1?'':'s'}`;
  if(table) table.innerHTML=monthClasses.map(c=>`<tr><td>${dateBR(c.date)}</td><td><strong>${esc(formatTimeRange(c.time||''))}</strong></td><td>${esc(c.studentName||studentById(c.studentId)?.name||'—')}</td><td>${esc(c.teacher||'—')}</td><td>${classStatusBadge(c.status)}</td><td><div class="row-actions">${c.status==='Agendada'?`<button class="btn success small" onclick="setClassStatus('${c.id}','Realizada')">Concluir</button><button class="btn small" onclick="setClassStatus('${c.id}','Cancelada')">Cancelar</button>`:''}<button class="btn small" onclick="openClassModal(null,null,'${c.id}')">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteClass('${c.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Nenhuma aula cadastrada neste mês.</div></td></tr>';
}
function changeMonth(delta){ currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+delta,1); renderAgenda(); renderOccupancy(); }

/* V41 — Miniaturas dos equipamentos */
function equipmentIconSVG(eq,size=42){
  const key=String(eq?.id||'')+'|'+String(eq?.name||'')+'|'+String(eq?.category||'')+'|'+size;
  equipmentIconSVG.cache=equipmentIconSVG.cache||new Map();
  if(equipmentIconSVG.cache.has(key)) return equipmentIconSVG.cache.get(key);
  const n=String(eq?.name||'').toLowerCase(), c=String(eq?.category||'').toLowerCase();
  const t=n.includes('reformer')||c.includes('reformer')?'reformer':n.includes('cadillac')||c.includes('cadillac')?'cadillac':n.includes('chair')||c.includes('chair')?'chair':n.includes('barrel')||c.includes('barrel')?'barrel':n.includes('spine')||n.includes('corrector')?'spine':'generic';
  const s=Math.max(32,Number(size)||42), S='stroke-linecap="round" stroke-linejoin="round"'; let b='';
  if(t==='reformer') b=`<defs><linearGradient id="rg${s}" x1="8" y1="8" x2="56" y2="56"><stop stop-color="#6d7886"/><stop offset=".45" stop-color="#f0f2f5"/><stop offset="1" stop-color="#59636f"/></linearGradient><linearGradient id="rc${s}" x1="10" y1="25" x2="52" y2="44"><stop stop-color="#303844"/><stop offset="1" stop-color="#9ba4b0"/></linearGradient></defs><rect x="7" y="38" width="50" height="7" rx="3" fill="url(#rg${s})" stroke="#525c68" stroke-width="1.4" ${S}/><rect x="14" y="28" width="31" height="9" rx="3" fill="url(#rc${s})" stroke="#4d5662" stroke-width="1.3" ${S}/><path d="M12 45 8 54M52 45l4 9M17 28V13M47 28V13M17 14h30" fill="none" stroke="#626c79" stroke-width="2" ${S}/><path d="M20 46h24" stroke="#d0d4da" stroke-width="1.5" ${S}/><circle cx="19" cy="49" r="3" fill="#444d59"/><circle cx="45" cy="49" r="3" fill="#444d59"/><circle cx="32" cy="32" r="2" fill="#cbd0d6"/>`;
  else if(t==='cadillac') b=`<defs><linearGradient id="cg${s}" x1="10" y1="8" x2="54" y2="52"><stop stop-color="#555f6c"/><stop offset=".5" stop-color="#eef0f3"/><stop offset="1" stop-color="#697381"/></linearGradient></defs><rect x="9" y="40" width="46" height="7" rx="3" fill="#3f4854"/><path d="M13 40V8M51 40V8M13 9h38M20 17h24M20 26h24M20 17v18M44 17v18" fill="none" stroke="url(#cg${s})" stroke-width="3" ${S}/><path d="M27 27c3 3 7 3 10 0" fill="none" stroke="#2f3741" stroke-width="2" ${S}/><circle cx="32" cy="35" r="3" fill="#b6bdc6"/>`;
  else if(t==='chair') b=`<defs><linearGradient id="ch${s}" x1="18" y1="14" x2="47" y2="54"><stop stop-color="#59636f"/><stop offset=".5" stop-color="#e1e5e9"/><stop offset="1" stop-color="#66707c"/></linearGradient></defs><path d="M18 47h29M21 47V21h22v26" fill="none" stroke="url(#ch${s})" stroke-width="4" ${S}/><rect x="21" y="21" width="22" height="10" rx="2" fill="#444d59"/><path d="M27 21V13h10v8M17 53h8M39 53h8M24 35h16M24 40h16" fill="none" stroke="#6b7582" stroke-width="2" ${S}/><rect x="27" y="31" width="10" height="7" rx="2" fill="#c5cbd1"/>`;
  else if(t==='barrel'||t==='spine') b=`<defs><linearGradient id="bg${s}" x1="12" y1="17" x2="52" y2="53"><stop stop-color="#a96d40"/><stop offset=".45" stop-color="#e2ad78"/><stop offset="1" stop-color="#81502f"/></linearGradient></defs><path d="M10 47h44" stroke="#555e69" stroke-width="3" ${S}/><path d="M15 47c1-18 7-29 17-29s16 11 17 29" fill="url(#bg${s})" stroke="#70472f" stroke-width="1.5" ${S}/><path d="M19 40h26M21 33h22M25 26h14M14 47v7M50 47v7" fill="none" stroke="#795039" stroke-width="1.7" ${S}/><path d="M17 47h30" stroke="#d8dce1" stroke-width="1.3" ${S}/>`;
  else b=`<defs><linearGradient id="gg${s}" x1="10" y1="10" x2="54" y2="54"><stop stop-color="#5c6673"/><stop offset=".5" stop-color="#e2e6ea"/><stop offset="1" stop-color="#727c89"/></linearGradient></defs><rect x="9" y="13" width="46" height="37" rx="9" fill="url(#gg${s})" stroke="#4e5865" stroke-width="1.5"/><circle cx="32" cy="31" r="9" fill="#343d48" stroke="#c4cad0" stroke-width="2"/><path d="M32 22v18M23 31h18" stroke="#e2e5e8" stroke-width="1.5" ${S}/>`;
  const out=`<span class="equipment-real-thumb" style="--icon-size:${s}px" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">${b}</svg></span>`;
  equipmentIconSVG.cache.set(key,out); return out;
}

/* V11 — Central de equipamentos e rodízio automático */
function ensurePatientEvolutionData(){
  if(!Array.isArray(db.students)) db.students=[];
  db.students.forEach(s=>{
    if(!Array.isArray(s.evolution)) s.evolution=[];
    if(!s.clinical || typeof s.clinical!=='object') s.clinical={};
    const c=s.clinical;
    ['complaint','objective','diagnosis','pain','limitations','contraindications','medicalHistory','medications','posture','mobility','strength','balance','breathing','measurements','frequency','plan','homecare','nextReview','alerts'].forEach(k=>{if(c[k]==null)c[k]='';});
    if(!c.objective)c.objective=s.goal||'';
    if(!c.medicalHistory)c.medicalHistory=s.notes||'';
  });
}
function ensureEquipmentData(){
  if(!Array.isArray(db.equipment)) db.equipment=clone(defaultData.equipment||[]);
  db.equipment.forEach(e=>{
    if(!e.id)e.id=uid('eq');
    e.name=String(e.name||'Equipamento').trim();
    e.category=String(e.category||'Pilates').trim();
    e.quantity=Math.max(1,Number(e.quantity||1));
    e.active=e.active!==false;
    e.notes=String(e.notes||'');
  });
}
function equipmentById(id){ensureEquipmentData();return db.equipment.find(e=>e.id===id);}
function activeEquipment(){ensureEquipmentData();return db.equipment.filter(e=>e.active!==false&&e.name);}
function equipmentUsageCount(id){return db.classes.filter(c=>c.equipmentId===id&&c.status!=='Cancelada').length;}
function equipmentClassesAt(date,time,ignoreId=null){
  return db.classes.filter(c=>c.date===date&&c.time===time&&c.status!=='Cancelada'&&c.equipmentId&&c.id!==ignoreId);
}
function timeToMinutes(value){
  const m=String(value||'').match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  const h=Number(m[1]),min=Number(m[2]);
  if(h>23||min>59)return null;
  return h*60+min;
}
function intervalsOverlap(startA,endA,startB,endB){return startA<endB&&startB<endA;}
function equipmentAvailable(e,date,time,ignoreId=null,duration=null){
  if(!e||!date||!time)return false;
  const targetStart=timeToMinutes(time);
  if(targetStart==null)return false;
  const targetDuration=Math.max(1,Number(duration||db?.settings?.duration||60));
  const targetEnd=targetStart+targetDuration;
  const overlaps=db.classes.filter(c=>c.date===date&&c.status!=='Cancelada'&&c.equipmentId===e.id&&c.id!==ignoreId).filter(c=>{
    const start=timeToMinutes(c.time);
    if(start==null)return false;
    const dur=Math.max(1,Number(c.duration||db?.settings?.duration||60));
    return intervalsOverlap(targetStart,targetEnd,start,start+dur);
  }).length;
  return overlaps<Math.max(1,Number(e.quantity||1));
}
function previousEquipmentForStudent(studentId,date,time,ignoreId=null){
  const classes=db.classes.filter(c=>c.studentId===studentId && c.equipmentId && c.status!=='Cancelada' && c.id!==ignoreId);
  const target=new Date(`${date}T${time||'23:59'}`).getTime();
  return classes.filter(c=>{
    const t=new Date(`${c.date}T${c.time||'00:00'}`).getTime();
    return Number.isFinite(t)&&t<target;
  }).sort((a,b)=>{
    const ta=new Date(`${a.date}T${a.time||'00:00'}`).getTime(),tb=new Date(`${b.date}T${b.time||'00:00'}`).getTime();
    return tb-ta;
  })[0]||null;
}
function equipmentRotationCandidates(studentId,date,time,ignoreId=null){
  const last=previousEquipmentForStudent(studentId,date,time,ignoreId);
  const studentUseCount={};
  db.classes.filter(c=>c.studentId===studentId&&c.equipmentId&&c.status!=='Cancelada'&&c.id!==ignoreId).forEach(c=>{studentUseCount[c.equipmentId]=(studentUseCount[c.equipmentId]||0)+1;});
  return activeEquipment().filter(e=>equipmentAvailable(e,date,time,ignoreId)).sort((a,b)=>{
    const ar=last&&String(a.id)===String(last.id)?1:0,br=last&&String(b.id)===String(last.id)?1:0;
    if(ar!==br)return ar-br;
    const au=studentUseCount[a.id]||0,bu=studentUseCount[b.id]||0;
    return au-bu||equipmentUsageCount(a.id)-equipmentUsageCount(b.id)||String(a.name).localeCompare(String(b.name),'pt-BR');
  });
}
function recommendEquipment(studentId,date,time,ignoreId=null){
  return equipmentRotationCandidates(studentId,date,time,ignoreId)[0]||null;
}
function equipmentSelectOptions(studentId,date,time,selected='',ignoreId=null){
  const list=equipmentRotationCandidates(studentId,date,time,ignoreId);
  const all=activeEquipment();
  const ordered=[...list,...all.filter(e=>!list.some(x=>x.id===e.id))];
  const last=previousEquipmentForStudent(studentId,date,time,ignoreId);
  return '<option value="">Automático — Rodízio</option>'+ordered.map(e=>{
    const available=equipmentAvailable(e,date,time,ignoreId);
    const repeated=last&&String(last.id)===String(e.id);
    const disabled=!available||repeated;
    const label=`${e.name} · ${e.category} · ${repeated?'último usado':(available?'disponível':'indisponível')}`;
    return `<option value="${esc(e.id)}" ${selected===e.id?'selected':''} ${disabled?'disabled':''}>${esc(label)}</option>`;
  }).join('');
}
function refreshClassEquipmentOptions(){
  const student=document.getElementById('cStudent')?.value;
  const date=document.getElementById('cDate')?.value;
  const time=document.getElementById('cTime')?.value;
  const sel=document.getElementById('cEquipment')?.value||'';
  const el=document.getElementById('cEquipment');
  if(!el||!student||!date||!time)return;
  el.innerHTML=equipmentSelectOptions(student,date,time,sel,editingId);
  const selectedOption=sel?[...el.options].find(o=>String(o.value)===String(sel)&&!o.disabled):null;
  if(selectedOption) el.value=sel;
  else el.value=recommendEquipment(student,date,time,editingId)?.id||'';
  updateEquipmentRecommendation();
}
function updateEquipmentRecommendation(){
  const student=document.getElementById('cStudent')?.value;
  const date=document.getElementById('cDate')?.value;
  const time=document.getElementById('cTime')?.value;
  const selected=document.getElementById('cEquipment')?.value||'';
  const note=document.getElementById('equipmentRecommendation');
  if(!note)return;
  if(!student||!date||!time){note.textContent='Selecione aluno, data e horário para aplicar o rodízio automático.';return;}
  const last=previousEquipmentForStudent(student,date,time,editingId);
  const rec=recommendEquipment(student,date,time,editingId);
  if(selected){
    const e=equipmentById(selected);
    note.innerHTML=`<span class="equipment-chip">Manual</span> Equipamento selecionado: <strong>${esc(e?.name||'')}</strong>${last?` · último usado: ${esc(last.name)}`:''}.`;
    return;
  }
  note.innerHTML=rec
    ? `<span class="equipment-chip">🧘 Rodízio</span> Sugestão: <strong>${esc(rec.name)}</strong>${last?` · evitando repetição de <strong>${esc(last.name)}</strong>`:''}.`
    : `<span class="badge warn">Sem equipamento disponível</span> Cadastre/ative outro aparelho ou aumente a quantidade.`;

  const hs=document.getElementById('studentEquipmentHistory'),sid=document.getElementById('cStudent')?.value;
  if(hs&&sid){hs.style.display='block';hs.innerHTML='<h4>📋 Histórico deste cliente</h4>'+renderStudentEquipmentHistory(sid,6);}
}
function studentEquipmentHistory(studentId,limit=8){
  const s=studentById(studentId);
  return db.classes.filter(c=>c.studentId===studentId&&c.equipmentId).sort((a,b)=>{
    const ta=new Date(`${a.date}T${a.time||'00:00'}`).getTime(),tb=new Date(`${b.date}T${b.time||'00:00'}`).getTime();return tb-ta;
  }).slice(0,limit);
}
function renderStudentEquipmentHistory(studentId,limit=8){
  const rows=studentEquipmentHistory(studentId,limit);
  if(!rows.length)return '<div class="muted">Ainda não há aulas com equipamento registradas para este cliente.</div>';
  return `<div class="rotation-history-v41">${rows.map(c=>{const eq=equipmentById(c.equipmentId);return `<div class="rotation-row-v41">${equipmentIconSVG(eq||{name:'Equipamento'},38)}<div><div class="date">${dateBR(c.date)}${c.time?' · '+esc(c.time):''}</div><div class="name">${esc(eq?.name||'Equipamento removido')}</div><div class="eq">${esc(c.title||'Aula')} · ${esc(c.status||'Agendada')}</div></div><span class="badge ok">Usado</span></div>`}).join('')}</div>`;
}
function rotationNextLabel(studentId,date,time,ignoreId=null){
  const prev=previousEquipmentForStudent(studentId,date,time,ignoreId), eq=prev?.equipmentId?equipmentById(prev.equipmentId):null;
  return eq?`<div class="rotation-block-v41"><h4>🔄 Rodízio deste cliente</h4><div style="display:flex;align-items:center;gap:9px">${equipmentIconSVG(eq,38)}<div>Último equipamento: <strong>${esc(eq.name)}</strong><br><span class="muted">Ele ficará bloqueado nesta próxima aula.</span></div></div></div>`:'';
}
function equipmentDayKey(date){return new Date(`${date}T12:00:00`).getDay();}
function studentScheduledOnDate(s,date){const d=equipmentDayKey(date),names=['domingo','segunda','terça','quarta','quinta','sexta','sábado'],a=[String(d),names[d],names[d].slice(0,3)],days=Array.isArray(s.days)?s.days.map(x=>String(x).toLowerCase().trim()):[];return days.some(x=>a.includes(x));}
function rotationScheduleForStudent(s,date){const cs=db.classes.filter(c=>c.studentId===s.id&&c.date===date&&c.status!=='Cancelada').sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));if(cs.length)return cs.map(c=>({date,time:c.time||s.time||'',classId:c.id,equipmentId:c.equipmentId||'',status:c.status||'Agendada'}));return studentScheduledOnDate(s,date)&&s.time?[{date,time:s.time,classId:'',equipmentId:s.nextEquipmentId||'',status:'Programada'}]:[];}
function rotationWeekStart(date){const d=new Date(`${date||todayISO()}T12:00:00`);const day=d.getDay();const diff=day===0?-6:1-day;d.setDate(d.getDate()+diff);return d.toISOString().slice(0,10);}
function rotationWeekDates(anchor){const start=new Date(`${rotationWeekStart(anchor)}T12:00:00`);return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d.toISOString().slice(0,10);});}
function shiftEquipmentRotationWeek(delta){const input=document.getElementById('equipmentRotationDate');const base=input?.value||todayISO();const d=new Date(`${rotationWeekStart(base)}T12:00:00`);d.setDate(d.getDate()+Number(delta||0)*7);if(input)input.value=d.toISOString().slice(0,10);renderEquipmentRotationCenter();}
function rotationWeekLabel(date){return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).replace(/^./,m=>m.toUpperCase());}
function rotationCompactStudentRow(s,date,slot){const time=slot.time||s.time||'23:59',last=previousEquipmentForStudent(s.id,date,time,slot.classId||''),lastEq=last?.equipmentId?equipmentById(last.equipmentId):null,rec=recommendEquipment(s.id,date,time,slot.classId||''),current=slot.equipmentId?equipmentById(slot.equipmentId):null,persisted=s.nextEquipmentId?equipmentById(s.nextEquipmentId):null,validPersisted=persisted&&(!lastEq||persisted.id!==lastEq.id)&&equipmentAvailable(persisted,date,time,slot.classId||''),next=current||(validPersisted?persisted:rec),options=activeEquipment().map(e=>{const unavailable=!equipmentAvailable(e,date,time,slot.classId||''),repeated=!!lastEq&&String(e.id)===String(lastEq.id);return `<option value="${esc(e.id)}" ${next&&String(next.id)===String(e.id)?'selected':''} ${unavailable||repeated?'disabled':''}>${esc(e.name)}${repeated?' · último usado':unavailable?' · indisponível':''}</option>`}).join(''),state=current?'Confirmado':next?'Sugestão':'Aguardando aparelho',stateClass=current?'ok':next?'info':'warn',teacher=String(s.teacher||'').trim(),plan=String(s.plan||'').trim(),meta=[teacher,plan].filter(Boolean).join(' · ');return `<div class="rotation-student-compact"><div class="rotation-student-main"><div class="rotation-student-avatar">${esc(String(s.name||'?').trim().charAt(0).toUpperCase())}</div><div class="rotation-student-name"><strong>${esc(s.name)}</strong>${meta?`<small>${esc(meta)}</small>`:''}</div></div><div class="rotation-student-last"><span>Último</span><strong>${esc(lastEq?.name||'—')}</strong></div><div class="rotation-student-next"><span>Próximo</span><select aria-label="Próximo equipamento de ${esc(s.name)} às ${esc(time)}" onchange="setRotationForSchedule('${s.id}','${esc(date)}','${esc(time)}','${esc(slot.classId||'')}',this.value)"><option value="">Automático</option>${options}</select></div><span class="badge ${stateClass}">${state}</span><div class="rotation-student-action">${slot.classId?`<button class="btn small" onclick="openClassModal(null,'${s.id}','${slot.classId}')">Editar</button>`:`<button class="btn small primary" onclick="openClassModal('${date}','${s.id}',null,'${esc(next?.id||'')}')">＋ Aula</button>`}</div></div>`;}
function renderRotationTimeGroup(date,time,items){
  const duration=Math.max(...items.map(x=>Number(x.slot.duration||classById(x.slot.classId)?.duration||db?.settings?.duration||60)),60);
  const assigned=items.filter(x=>x.slot.equipmentId).length;
  const pct=items.length?Math.round((assigned/items.length)*100):0;
  const statuses=[...new Set(items.map(x=>x.slot.status||'Programada'))];
  return `<div class="rotation-time-group">
    <div class="rotation-time-head-v55">
      <div class="rotation-time-main-v55"><div class="rotation-time-clock-v55">${esc(time)}</div><div><strong>${items.length} aluno${items.length===1?'':'s'}</strong><small>${duration} min · ${assigned===items.length?'todos os aparelhos definidos':`${items.length-assigned} aparelho${items.length-assigned===1?'':'s'} pendente${items.length-assigned===1?'':'s'}`}</small></div></div><div class="rotation-occupancy-v59"><span>Ocupação</span><b>${slotCapacity(date,time).used}/${slotCapacity(date,time).capacity||'—'}</b></div>
      <div class="rotation-time-side-v55"><strong>${pct}%</strong><small>${statuses.length===1?esc(statuses[0]):'Aula'}</small><div class="rotation-time-progress-v55"><i style="width:${pct}%"></i></div></div>
    </div>
    <div class="rotation-students-header-v56"><span>Aluno</span><span>Último</span><span>Próximo aparelho</span><span>Status</span><span>Ação</span></div><div class="rotation-students-list">${items.map(x=>rotationCompactStudentRowV55(x.s,date,x.slot)).join('')}</div>
  </div>`;
}
function rotationCompactStudentRowV55(s,date,slot){
  const time=slot.time||s.time||'23:59',capacity=slotCapacity(date,time,slot.classId||''),last=previousEquipmentForStudent(s.id,date,time,slot.classId||''),lastEq=last?.equipmentId?equipmentById(last.equipmentId):null,rec=recommendEquipment(s.id,date,time,slot.classId||''),current=slot.equipmentId?equipmentById(slot.equipmentId):null,persisted=s.nextEquipmentId?equipmentById(s.nextEquipmentId):null,validPersisted=persisted&&(!lastEq||persisted.id!==lastEq.id)&&equipmentAvailable(persisted,date,time,slot.classId||''),next=current||(validPersisted?persisted:rec);
  const options=activeEquipment().map(e=>{const unavailable=!equipmentAvailable(e,date,time,slot.classId||''),repeated=!!lastEq&&String(e.id)===String(lastEq.id);return `<option value="${esc(e.id)}" ${next&&String(next.id)===String(e.id)?'selected':''} ${unavailable||repeated?'disabled':''}>${esc(e.name)}${repeated?' · último':unavailable?' · indisponível':''}</option>`}).join('');
  const state=current?'Confirmado':next?'Sugestão':'Pendente',stateClass=current?'ok':next?'info':'warn';
  const teacher=String(s.teacher||'').trim(),plan=String(s.plan||'').trim(),meta=[teacher,plan].filter(Boolean).join(' · ');
  const action=slot.classId?`<button class="btn small" onclick="openClassModal(null,'${s.id}','${slot.classId}')">Editar aula</button>`:(capacity.full?`<button class="btn small primary" disabled title="Horário lotado">Lotado</button>`:`<button class="btn small primary" onclick="openClassModal('${date}','${s.id}',null,'${esc(next?.id||'')}')">＋ Aula</button>`);
  return `<div class="rotation-student-compact-v55">
    <div class="rotation-student-main-v55"><div class="rotation-student-avatar-v55">${esc(String(s.name||'?').trim().charAt(0).toUpperCase())}</div><div class="rotation-student-name-v55"><strong>${esc(s.name)}</strong><small>${esc(meta||'Aluno ativo')}</small></div></div>
    <div class="rotation-last-v55"><span>Último</span><strong>${esc(lastEq?.name||'—')}</strong></div>
    <div class="rotation-next-v55"><span>Próximo aparelho</span><select aria-label="Próximo equipamento de ${esc(s.name)} às ${esc(time)}" onchange="setRotationForSchedule('${s.id}','${esc(date)}','${esc(time)}','${esc(slot.classId||'')}',this.value)"><option value="">Automático${next?' · '+esc(next.name):''}</option>${options}</select></div>
    <span class="badge ${stateClass} rotation-state-v55">${state}</span>
    <div class="rotation-action-v55">${action}</div>
  </div>`;
}
function selectEquipmentRotationDay(date){const input=document.getElementById('equipmentRotationDate');if(input)input.value=date;renderEquipmentRotationCenter();requestAnimationFrame(()=>document.getElementById(`rotation-day-${date}`)?.scrollIntoView({behavior:'smooth',block:'start'}));}
function renderEquipmentRotationCenter(){
  const root=document.getElementById('equipmentRotationControl');if(!root)return;
  ensureEquipmentData();ensureV7Data();normalizeAllStudentDays();
  const input=document.getElementById('equipmentRotationDate'),anchor=input?.value||todayISO();if(input&&!input.value)input.value=anchor;
  const filter=document.getElementById('equipmentRotationFilter')?.value||'all';
  const search=String(document.getElementById('equipmentRotationSearch')?.value||'').trim().toLowerCase();
  const dates=rotationWeekDates(anchor),today=todayISO(),all=[];
  dates.forEach(date=>db.students.filter(s=>s.status==='Ativo').forEach(s=>rotationScheduleForStudent(s,date).forEach(slot=>all.push({s,slot,date}))));
  const matches=x=>(!search||String(x.s.name||'').toLowerCase().includes(search))&&(filter==='all'||filter==='scheduled'&&x.slot.classId||filter==='pending'&&!x.slot.equipmentId);
  const filtered=all.filter(matches);
  const dayItems=filtered.filter(x=>x.date===anchor);
  const grouped=new Map();dayItems.forEach(x=>{const key=x.slot.time||'23:59';if(!grouped.has(key))grouped.set(key,{date:anchor,time:key,items:[]});grouped.get(key).items.push(x);});
  const pending=all.filter(x=>!x.slot.equipmentId).length,studentsCount=new Set(all.map(x=>x.s.id)).size,slotCount=new Set(all.map(x=>`${x.date}|${x.slot.time||''}`)).size,assigned=all.filter(x=>x.slot.equipmentId).length,total=all.length,pct=total?Math.round((assigned/total)*100):0,start=rotationWeekStart(anchor);
  const selectedAssigned=dayItems.filter(x=>x.slot.equipmentId).length,selectedPending=dayItems.length-selectedAssigned,selectedTimes=new Set(dayItems.map(x=>x.slot.time||'')).size,selectedPct=dayItems.length?Math.round((selectedAssigned/dayItems.length)*100):0;
  const dayShort=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  const weekStrip=dates.map(date=>{const d=new Date(`${date}T12:00:00`),count=all.filter(x=>x.date===date).length,p=all.filter(x=>x.date===date&&!x.slot.equipmentId).length,isToday=date===today,isSel=date===anchor;return `<button type="button" class="rotation-v55-day ${isSel?'is-selected':''} ${isToday?'is-today':''}" aria-pressed="${isSel}" onclick="selectEquipmentRotationDay('${date}')"><b>${dayShort[(d.getDay()+6)%7]}</b><span>${String(d.getDate()).padStart(2,'0')}</span><small>${d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small><em>${count?`${count} aluno${count===1?'':'s'}${p?' · '+p+' pend.':''}`:'Sem aulas'}</em></button>`}).join('');
  const summary=`<div class="rotation-v55-hero"><div class="rotation-v55-title"><div class="rotation-v55-icon">↻</div><div><strong>Rodízio de Pilates</strong><small>Semana de ${esc(dateBR(start))} · selecione um dia para controlar os aparelhos das aulas.</small></div></div><div class="rotation-v55-progress"><div class="rotation-v55-progress-head"><span>Organização da semana</span><b>${pct}%</b></div><div class="rotation-v55-bar"><i style="width:${pct}%"></i></div></div></div><div class="rotation-v55-days">${weekStrip}</div><div class="rotation-v55-summary"><div class="rotation-v55-stat"><b>${studentsCount}</b><span>Alunos</span></div><div class="rotation-v55-stat"><b>${slotCount}</b><span>Horários</span></div><div class="rotation-v55-stat"><b>${assigned}</b><span>Definidos</span></div><div class="rotation-v55-stat ${pending?'attention':''}"><b>${pending}</b><span>Pendentes</span></div></div>`;
  const selectedDateLabel=rotationWeekLabel(anchor);
  const selected=`<div class="rotation-v56-selected"><div class="rotation-v56-selected-main"><strong>${esc(selectedDateLabel)}</strong><span>Controle do dia selecionado</span></div><div class="rotation-v56-selected-kpis"><span><b>${dayItems.length}</b> alunos</span><span><b>${selectedTimes}</b> horários</span><span><b>${selectedAssigned}</b> definidos</span><span><b>${selectedPending}</b> pendentes</span><span><b>${selectedPct}%</b> organizado</span></div></div>`;
  const content=grouped.size?[...grouped.values()].sort((a,b)=>String(a.time).localeCompare(String(b.time))).map(g=>renderRotationTimeGroup(anchor,g.time,g.items)).join(''):`<div class="rotation-v55-empty">Nenhuma aula encontrada para <strong>${esc(selectedDateLabel)}</strong> com os filtros atuais.<br><small>Selecione outro dia, altere o filtro ou limpe a busca.</small></div>`;
  root.innerHTML=summary+selected+`<div class="rotation-v56-hint"><b>Como usar:</b> cada linha representa um aluno naquele horário. Escolha o próximo aparelho e o sistema valida o rodízio automaticamente.</div>`+content;
}

function setRotationForSchedule(studentId,date,time,classId,equipmentId){const s=studentById(studentId);if(!s)return;const id=String(equipmentId||''),last=previousEquipmentForStudent(studentId,date,time,classId||'');if(id){const e=equipmentById(id);if(!e||!e.active){toast('Equipamento não está ativo.');renderEquipmentRotationCenter();return;}if(last?.equipmentId===id){toast('Não é permitido repetir o último equipamento.');renderEquipmentRotationCenter();return;}if(!equipmentAvailable(e,date,time,classId||'')){toast('Equipamento indisponível neste horário.');renderEquipmentRotationCenter();return;}}if(classId){const c=classById(classId);if(c){c.equipmentId=id;c.updatedAt=new Date().toISOString();}}else{s.nextEquipmentId=id;s.updatedAt=new Date().toISOString();}if(!saveDB())return;renderEquipmentRotationCenter();renderStudents();toast(id?'Rodízio atualizado.':'Rodízio automático restaurado.');}

function renderEquipment(){
  ensureEquipmentData();
  const active=activeEquipment();
  const total=db.equipment.length;
  const uses=db.classes.filter(c=>c.equipmentId&&c.status!=='Cancelada').length;
  const units=active.reduce((a,e)=>a+Number(e.quantity||1),0);
  const k=document.getElementById('equipmentKpis');
  if(k)k.innerHTML=`
    <div class="module-kpi"><div class="label">Aparelhos</div><div class="value">${total}</div><div class="foot">Cadastrados</div></div>
    <div class="module-kpi"><div class="label">Ativos</div><div class="value">${active.length}</div><div class="foot">No rodízio</div></div>
    <div class="module-kpi"><div class="label">Unidades</div><div class="value">${units}</div><div class="foot">Cadastradas</div></div>
    <div class="module-kpi"><div class="label">Aulas com aparelho</div><div class="value">${uses}</div><div class="foot">Histórico</div></div>`;

  const vg=document.getElementById('equipmentVisualGrid');
  if(vg){
    vg.innerHTML=db.equipment.length?db.equipment.map(e=>{
      const count=equipmentUsageCount(e.id);
      return `<article class="equipment-inventory-card ${e.active?'':'is-off'}">
        <div>${equipmentIconSVG(equipmentById(e.id),42)}</div>
        <div class="eq-info"><div class="eq-name">${esc(e.name)}</div><div class="eq-meta">${esc(e.category||'Aparelho')} · ${Number(e.quantity||1)} un. · ${count} aula${count===1?'':'s'}</div></div>
        <div class="equipment-inventory-actions">
          <button class="btn small" type="button" onclick="openEquipmentModal('${e.id}')" title="Editar">Editar</button>
          <button class="btn small" type="button" onclick="toggleEquipment('${e.id}')">${e.active?'Desativar':'Ativar'}</button>
          <button class="btn danger small icon ios-delete-button" type="button" onclick="deleteEquipment('${e.id}')" title="Excluir" aria-label="Excluir">${trashIcon(14)}</button>
        </div>
      </article>`;
    }).join(''):'<div class="equipment-inventory-empty">Nenhum aparelho cadastrado. Use <strong>＋ Novo</strong> para começar.</div>';
  }

  const el=document.getElementById('equipmentTable');
  if(el)el.innerHTML='';
  const rs=document.getElementById('equipmentRotationSummary');
  if(rs)rs.innerHTML='';
  renderEquipmentRotationCenter();
}
if(!window.__rotationCenterTicker){window.__rotationCenterTicker=setInterval(()=>{if(document.getElementById('page-equipment')?.classList.contains('active'))renderEquipmentRotationCenter();},30000);}
function openEquipmentModal(id=null){
  ensureEquipmentData();
  const e=equipmentById(id)||{name:'',category:'Reformer',quantity:1,active:true,notes:''};
  const cats=['Reformer','Cadillac','Chair','Barrel','Acessório','Outro'];
  const body=`<div class="form-grid">
    <div class="field"><label>Nome do equipamento *</label><input id="eqName" value="${esc(e.name)}" placeholder="Ex.: Reformer 01"></div>
    <div class="field"><label>Categoria</label><select id="eqCategory">${cats.map(c=>`<option ${e.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label>Quantidade de unidades *</label><input id="eqQuantity" type="number" min="1" max="99" value="${Number(e.quantity||1)}"></div>
    <div class="field"><label>Status no rodízio</label><select id="eqActive"><option value="1" ${e.active?'selected':''}>Ativo — participar do rodízio</option><option value="0" ${!e.active?'selected':''}>Inativo — não sugerir</option></select></div>
    <div class="field full"><label>Observações</label><textarea id="eqNotes" placeholder="Localização, estado, cuidados...">${esc(e.notes||'')}</textarea></div>
  </div>`;
  openModal(id?'Editar Equipamento':'Adicionar Equipamento',body,()=>saveEquipment(id));
}
function saveEquipment(id=null){
  ensureEquipmentData();
  const name=document.getElementById('eqName')?.value.trim();
  if(!name){toast('Informe o nome do equipamento.');return;}
  const obj={
    id:id||uid('eq'),name,
    category:document.getElementById('eqCategory')?.value||'Outro',
    quantity:Math.max(1,Number(document.getElementById('eqQuantity')?.value||1)),
    active:document.getElementById('eqActive')?.value!=='0',
    notes:document.getElementById('eqNotes')?.value.trim()||''
  };
  const i=db.equipment.findIndex(e=>e.id===id);
  if(i>=0)db.equipment[i]=obj;else db.equipment.push(obj);
  saveDB();closeModal();renderAll();toast(id?'Equipamento atualizado.':'Equipamento adicionado ao rodízio.');
}
function toggleEquipment(id){
  const e=equipmentById(id);if(!e)return;
  e.active=!e.active;saveDB();renderEquipment();updateMenuBadges();
  toast(`${e.name}: ${e.active?'ativo no rodízio':'retirado do rodízio'}.`);
}
async function deleteEquipment(id){
  const e=equipmentById(id);if(!e)return;
  const used=db.classes.some(c=>c.equipmentId===id);
  const ok=await iosConfirm(
    used?'O equipamento será removido do cadastro, mas o histórico das aulas será preservado.':'O equipamento será removido do cadastro.',
    {title:'Excluir equipamento',okLabel:'Excluir',danger:true}
  );
  if(!ok)return;
  db.equipment=db.equipment.filter(x=>x.id!==id);
  saveDB();renderAll();toast('Equipamento excluído.');
}

function openClassModal(date=null,studentId=null,classId=null,preselectedEquipmentId=null){
  const c=classById(classId)||{}; editingId=classId;
  const selected=studentId||c.studentId||'';
  const rotationEquipmentId=preselectedEquipmentId||c.equipmentId||studentById(selected)?.nextEquipmentId||'';
  const students=activeStudents().map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${esc(s.name)} — ${esc(s.time||'sem horário')}</option>`).join('');
  const teachers=db.teachers.map(t=>`<option ${c.teacher===t?'selected':''}>${esc(t)}</option>`).join('');
  const hours=db.hours.map(h=>hourOption(h,c.time)).join('');
  const body=`<div class="form-grid"><div class="field"><label>Data *</label><input id="cDate" type="date" value="${esc(c.date||date||todayISO())}"></div><div class="field"><label>Horário *</label><select id="cTime"><option value="">Selecione</option>${hours}</select><div id="classCapacityIndicator"></div></div><div class="field full"><label>Aluno *</label><select id="cStudent"><option value="">Selecione</option>${students}</select></div><div class="field"><label>Professor</label><select id="cTeacher"><option value="">Selecione</option>${teachers}</select></div><div class="field"><label>Duração (min)</label><input id="cDuration" type="number" min="15" value="${c.duration||db.settings.duration||60}"></div><div class="field"><label>Status</label><select id="cStatus"><option ${c.status==='Agendada'?'selected':''}>Agendada</option><option ${c.status==='Realizada'?'selected':''}>Realizada</option><option ${c.status==='Cancelada'?'selected':''}>Cancelada</option><option ${c.status==='Falta'?'selected':''}>Falta</option></select></div><div class="field"><label>Tipo de aula</label><label class="ios-switch-field"><input id="cExperimental" type="checkbox" ${c.experimental?'checked':''}> Aula experimental</label></div><div class="field full"><label>Equipamento de Pilates</label><select id="cEquipment" onchange="updateEquipmentRecommendation()">${equipmentSelectOptions(selected,c.date||date||todayISO(),c.time||'',rotationEquipmentId,classId)}</select><div class="equipment-auto" id="equipmentRecommendation">Selecione aluno, data e horário para aplicar o rodízio automático.</div><div id="studentEquipmentHistory" class="rotation-block-v41" style="display:none"></div></div><div class="field full"><label>Observação</label><textarea id="cNotes">${esc(c.notes||'')}</textarea></div></div>`;
  openModal(classId?'Editar Aula':'Agendar Aula',body,saveClass);
  ['cStudent','cDate','cTime'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>{refreshClassEquipmentOptions();refreshClassCapacityIndicator();}));
  refreshClassEquipmentOptions();refreshClassCapacityIndicator();
}
function activeClassesAtSlot(date,time,ignoreId=null){
  return db.classes.filter(c=>c.date===date&&c.time===time&&c.status!=='Cancelada'&&c.id!==ignoreId);
}
function slotCapacity(date,time,ignoreId=null){
  const capacity=Math.max(0,Number(db?.settings?.capacity||0));
  const used=activeClassesAtSlot(date,time,ignoreId).length;
  return {capacity,used,remaining:Math.max(0,capacity-used),full:capacity>0&&used>=capacity,percent:capacity?Math.min(100,Math.round(used/capacity*100)):0};
}
function slotCapacityMessage(date,time,ignoreId=null){
  const x=slotCapacity(date,time,ignoreId);
  if(!x.capacity)return 'Capacidade não configurada';
  if(x.full)return `Lotado · ${x.used}/${x.capacity} alunos`;
  return `${x.used}/${x.capacity} alunos · ${x.remaining} vaga${x.remaining===1?'':'s'} disponível${x.remaining===1?'':'eis'}`;
}
function refreshClassCapacityIndicator(){
  const el=document.getElementById('classCapacityIndicator');
  const date=document.getElementById('cDate')?.value,time=document.getElementById('cTime')?.value;
  if(!el||!date||!time){if(el)el.innerHTML='';return;}
  const x=slotCapacity(date,time,editingId);
  el.innerHTML=x.capacity?`<div class="class-capacity-live ${x.full?'is-full':x.percent>=80?'is-high':''}"><span>Ocupação do horário</span><strong>${x.used}/${x.capacity}</strong><small>${x.full?'Horário lotado':`${x.remaining} vaga${x.remaining===1?'':'s'} disponível${x.remaining===1?'':'eis'}`}</small><i><b style="width:${x.percent}%"></b></i></div>`:'<div class="class-capacity-live"><span>Ocupação do horário</span><small>Defina a capacidade máxima em Configurações.</small></div>';
}

function saveClass(){
  const studentId=document.getElementById('cStudent').value, date=document.getElementById('cDate').value, time=document.getElementById('cTime').value;
  if(!studentId||!date||!time){toast('Informe aluno, data e horário.');return;}
  const s=studentById(studentId), existing=classById(editingId);
  const selectedEquipment=document.getElementById('cEquipment')?.value||'';
  const duration=Math.max(1,Number(document.getElementById('cDuration').value||db.settings.duration||60));
  const capacityState=slotCapacity(date,time,editingId);
  if(capacityState.capacity>0 && capacityState.full){toast(`Horário lotado: ${capacityState.used}/${capacityState.capacity} alunos.`);refreshClassCapacityIndicator();return;}
  const autoEquipment=recommendEquipment(studentId,date,time,editingId);
  const equipmentId=selectedEquipment||autoEquipment?.id||'';
  if(!equipmentId){toast('Não há equipamento disponível para o rodízio neste horário.');return;}
  const eq=equipmentById(equipmentId);
  if(!eq||!eq.active){toast('O equipamento selecionado não está ativo no rodízio.');refreshClassEquipmentOptions();return;}
  const last=previousEquipmentForStudent(studentId,date,time,editingId);
  if(last?.equipmentId&&String(last.equipmentId)===String(equipmentId)){toast('O equipamento usado na última aula não pode ser repetido imediatamente.');refreshClassEquipmentOptions();return;}
  if(!equipmentAvailable(eq,date,time,editingId,duration)){toast('O equipamento selecionado ficou indisponível nesse horário. Escolha outro equipamento.');refreshClassEquipmentOptions();return;}
  const obj={id:editingId||uid('cls'),studentId,studentName:s?.name||'',teacher:document.getElementById('cTeacher').value||s?.teacher||'',date,time,duration,status:document.getElementById('cStatus').value,experimental:!!document.getElementById('cExperimental')?.checked,equipmentId,notes:document.getElementById('cNotes').value,createdAt:existing?.createdAt||new Date().toISOString()};
  if(editingId){const i=db.classes.findIndex(x=>x.id===editingId);if(i>=0)db.classes[i]=obj;}else db.classes.push(obj);
  if(s&&String(s.nextEquipmentId||'')===String(equipmentId))s.nextEquipmentId='';
  s.updatedAt=new Date().toISOString();
  if(!saveDB())return;
  closeModal();renderAll();if(typeof renderControlEquipment==='function'){window.controlEquipmentDate=date;renderControlEquipment();}toast('Aula salva com sucesso.');
}
function setClassStatus(id,status){const c=classById(id);if(!c)return;c.status=status;c.updatedAt=new Date().toISOString();saveDB();renderAll();if(typeof renderControlEquipment==='function'){window.controlEquipmentDate=c.date||todayISO();renderControlEquipment();}toast(`Aula marcada como ${status.toLowerCase()}.`);}
async function deleteClass(id){const confirmed=await iosConfirm('A aula será removida do agendamento.',{title:'Excluir aula',okLabel:'Excluir',danger:true});if(!confirmed)return;db.classes=db.classes.filter(c=>c.id!==id);saveDB();renderAll();toast('Aula excluída.');}

function formatTime12(value){
  const m=String(value||'').match(/^(\d{1,2}):(\d{2})$/); if(!m)return String(value||'');
  return `${String(Number(m[1])).padStart(2,'0')}:${m[2]}`;
}
function formatTimeRange(value){
  const m=String(value||'').match(/^(\d{1,2}):(\d{2})$/); if(!m)return String(value||'');
  const h=Number(m[1]), min=Number(m[2]), duration=Number(db?.settings?.duration||60);
  const end=new Date(2000,0,1,h,min); end.setMinutes(end.getMinutes()+duration);
  const pad=n=>String(n).padStart(2,'0');
  return `${formatTime12(value)} às ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}
function hourOption(value, selected=''){return `<option value="${esc(value)}" ${String(selected)===String(value)?'selected':''}>${esc(formatTimeRange(value))}</option>`;}

function getHourDays(hour){
  db.hourDays=db.hourDays||{};
  const v=db.hourDays[hour];
  return Array.isArray(v)&&v.length?v.map(String):['1','2','3','4','5'];
}
function hourDaysLabel(hour){
  const names={1:'Seg',2:'Ter',3:'Qua',4:'Qui',5:'Sex',6:'Sáb',0:'Dom'};
  return getHourDays(hour).map(d=>names[String(d)]||d).join(', ');
}
function renderHours(){
  const el=document.getElementById('hoursGrid'); if(!el)return;
  const active=activeStudents();
  const counts={}; db.hours.forEach(h=>counts[h]=active.filter(s=>s.time===h).length);
  el.innerHTML=`<div class="module-kpis"><div class="module-kpi"><div class="label">Horários cadastrados</div><div class="value">${db.hours.length}</div><div class="foot">Grade configurada</div></div><div class="module-kpi"><div class="label">Alunos ativos</div><div class="value">${active.length}</div><div class="foot">Com cadastro ativo</div></div><div class="module-kpi"><div class="label">Horário mais ocupado</div><div class="value" style="font-size:18px">${formatTimeRange(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'')}</div><div class="foot">${Math.max(0,...Object.values(counts))} aluno(s)</div></div><div class="module-kpi"><div class="label">Capacidade</div><div class="value">${db.settings.capacity||0}</div><div class="foot">Por horário</div></div></div><div class="table-wrap"><table><thead><tr><th>Horário</th><th>Dias</th><th>Alunos</th><th>Ocupação</th><th>Disponibilidade</th><th>Ações</th></tr></thead><tbody>${db.hours.map((h,i)=>{const n=counts[h]||0,cap=Number(db.settings.capacity||0),pct=cap?Math.min(100,n/cap*100):0;return `<tr><td><strong>${esc(formatTimeRange(h))}</strong></td><td><span class="badge info">${esc(hourDaysLabel(h))}</span></td><td>${n}</td><td><div class="occupancy-meter"><small>${pct.toFixed(0)}%</small><div class="progress"><span style="width:${pct}%"></span></div></div></td><td>${Math.max(0,cap-n)} vaga(s)</td><td><div class="row-actions"><button class="btn small" type="button" onclick="addHour(${i})">Editar</button><button class="btn danger small icon ios-delete-button" type="button" onclick="deleteHour(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`}).join('')}</tbody></table></div>`;
}

function renderOccupancy(){
  const key=monthKey(currentMonth), cap=Number(db.settings.capacity||0), active=activeStudents();
  const slots=db.hours.length*6, capacity=slots*cap;
  const used=active.reduce((n,s)=>n+(Array.isArray(s.days)&&s.days.length?s.days.length:1),0);
  const free=Math.max(0,capacity-used), pct=capacity?used/capacity*100:0;
  [['occCapacity',capacity],['occOccupied',used],['occFree',free],['occPercent',pct.toFixed(0)+'%']].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const lab=document.getElementById('occupancyChartLabel');if(lab)lab.textContent=pct.toFixed(0)+'% da capacidade semanal';
  const grid=document.getElementById('occupancyGrid');if(!grid)return;
  const names=['Seg','Ter','Qua','Qui','Sex','Sáb'];
  let html='<div class="occ-cell occ-head">Hora</div>'+names.map(n=>`<div class="occ-cell occ-head">${n}</div>`).join('');
  db.hours.forEach(h=>{html+=`<div class="occ-cell occ-time">${esc(formatTimeRange(h))}</div>`;for(let d=1;d<=6;d++){const list=active.filter(s=>s.time===h&&(Array.isArray(s.days)?s.days:[]).includes(String(d)));const n=list.length,p=cap?Math.min(100,n/cap*100):0;html+=`<div class="occ-cell"><strong>${n}/${cap}</strong><div class="progress" style="margin:6px 0"><span style="width:${p}%"></span></div><div class="muted" style="font-size:9px">${list.slice(0,2).map(s=>esc(s.name.split(' ')[0])).join(', ')}</div></div>`;}});grid.innerHTML=html;
  if(typeof Chart!=='undefined'){const ctx=document.getElementById('occupancyBarChart');if(ctx){if(charts.occupancy)charts.occupancy.destroy();const vals=db.hours.map(h=>active.filter(s=>s.time===h).length);charts.occupancy=new Chart(ctx,{type:'bar',data:{labels:db.hours.map(formatTimeRange),datasets:[{data:vals,borderRadius:8,backgroundColor:chartPalette(5)[0]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});}}
}

function changeFinanceMonth(delta){
  currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+Number(delta||0),1);
  renderFinance();
  const lbl=document.getElementById('financeMonthLabel'); if(lbl)lbl.textContent=monthLabel(currentMonth);
}
function goFinanceCurrentMonth(){ currentMonth=new Date(); currentMonth.setDate(1); renderFinance(); const lbl=document.getElementById('financeMonthLabel'); if(lbl)lbl.textContent=monthLabel(currentMonth); }

function renderFinance(){
  const key=monthKey(currentMonth);
  const rows=db.finance.filter(f=>sameMonth(f.dueDate,key));
  const revenues=rows.filter(f=>(f.type||'Receita')!=='Despesa' && f.status!=='Cancelado');
  const expenses=rows.filter(f=>f.type==='Despesa' && f.status!=='Cancelado');
  const expected=revenues.reduce((a,f)=>a+Number(f.value||0),0);
  const received=revenues.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  const pending=Math.max(0,expected-received);
  const expenseTotal=expenses.reduce((a,f)=>a+Number(f.value||0),0);
  const expensePaid=expenses.filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0);
  const net=received-expensePaid;
  const rate=expected?received/expected*100:0;
  [['financeExpected',money(expected)],['financeReceived',money(received)],['financePending',money(pending)],['financeRate',rate.toFixed(0)+'%'],['financeExpenses',money(expenseTotal)],['financeNet',money(net)]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const lbl=document.getElementById('financeMonthLabel');if(lbl)lbl.textContent=monthLabel(currentMonth);
  const el=document.getElementById('financeTable');if(!el)return;
  const ordered=[...rows].sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  el.innerHTML=ordered.map(f=>{const isExp=f.type==='Despesa';const status=f.status||'Pendente';return `<tr><td>${isExp?'🔻 ':''}${esc(f.description||'Lançamento')}</td><td>${isExp?'—':esc(f.studentName||studentById(f.studentId)?.name||'—')}</td><td>${dateBR(f.dueDate)}</td><td><strong>${money(f.value)}</strong></td><td>${status==='Pago'?'<span class="badge ok">Pago</span>':status==='Cancelado'?'<span class="badge gray">Cancelado</span>':'<span class="badge warn">Pendente</span>'}</td><td>${esc(f.paymentMethod||'—')}</td><td><div class="row-actions">${status!=='Pago'&&status!=='Cancelado'?`<button class="btn success small" onclick="markFinancePaid('${f.id}')">Marcar pago</button>`:''}<button class="btn small" onclick="${isExp?'openExpenseModal':'openFinanceModal'}('${f.id}')">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteFinance('${f.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`}).join('')||'<tr><td colspan="7"><div class="empty">Nenhum lançamento neste mês.</div></td></tr>';
}
function openFinanceModal(id=null){
  editingId=id; const f=db.finance.find(x=>x.id===id)||{}; const opts=db.students.map(s=>`<option value="${s.id}" ${(f.studentId===s.id)?'selected':''}>${esc(s.name)}</option>`).join(''); const pays=db.payments.map(p=>`<option ${f.paymentMethod===p?'selected':''}>${esc(p)}</option>`).join('');
  const body=`<div class="form-grid"><div class="field full"><label>Aluno</label><select id="finStudent"><option value="">Sem aluno</option>${opts}</select></div><div class="field"><label>Descrição</label><input id="finDesc" value="${esc(f.description||'Mensalidade')}"></div><div class="field"><label>Valor</label><input id="finValue" type="number" step="0.01" value="${f.value??''}"></div><div class="field"><label>Vencimento</label><input id="finDue" type="date" value="${esc(f.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select id="finStatus"><option ${f.status==='Pendente'?'selected':''}>Pendente</option><option ${f.status==='Pago'?'selected':''}>Pago</option><option ${f.status==='Cancelado'?'selected':''}>Cancelado</option></select></div><div class="field"><label>Forma de pagamento</label><select id="finPay"><option value="">Selecione</option>${pays}</select></div><div class="field full"><label>Observação</label><textarea id="finNotes">${esc(f.notes||'')}</textarea></div></div>`;
  openModal(id?'Editar Lançamento':'Novo Lançamento',body,saveFinance);
}
function saveFinance(){const sid=document.getElementById('finStudent').value,s=studentById(sid),value=Number(document.getElementById('finValue').value||0),obj={id:editingId||uid('fin'),studentId:sid,studentName:s?.name||'',description:document.getElementById('finDesc').value.trim(),value,dueDate:document.getElementById('finDue').value,status:document.getElementById('finStatus').value,paymentMethod:document.getElementById('finPay').value,notes:document.getElementById('finNotes').value,type:'Receita'};if(!obj.description||!obj.dueDate||value<=0){toast('Informe descrição, valor maior que zero e vencimento.');return;}if(editingId){const i=db.finance.findIndex(x=>x.id===editingId);if(i>=0)db.finance[i]=obj;}else db.finance.push(obj);saveDB();closeModal();renderAll();toast('Lançamento salvo e financeiro atualizado.');}
function markFinancePaid(id){const f=db.finance.find(x=>x.id===id);if(!f)return;f.status='Pago';f.paidAt=todayISO();saveDB();renderAll();toast('Pagamento registrado.');}
async function deleteFinance(id){const confirmed=await iosConfirm('O lançamento financeiro será removido.',{title:'Excluir lançamento',okLabel:'Excluir',danger:true});if(!confirmed)return;db.finance=db.finance.filter(x=>x.id!==id);saveDB();renderAll();}

function renderBilling(){
  renderBillingCentralStatus();
  const key=monthKey(currentMonth), allRows=db.finance.filter(f=>(f.type||'Receita')!=='Despesa'&&sameMonth(f.dueDate,key));
  const rows=allRows.filter(f=>{if(billingCentralFilter==='all')return true;const s=studentById(f.studentId)||{name:f.studentName};return billingStatusForStudent(s,key)===billingCentralFilter;});
  const pending=allRows.filter(f=>f.status==='Pendente'), value=pending.reduce((a,f)=>a+Number(f.value||0),0);
  [['billingPending',pending.length],['billingValue',money(value)]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const el=document.getElementById('billingTable');if(!el)return;
  el.innerHTML=rows.sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate))).map(f=>{const s=studentById(f.studentId)||{name:f.studentName,whatsapp:f.whatsapp};const st=billingStatusForStudent(s,key);return `<tr><td><strong>${esc(s.name)}</strong><div class="muted" style="font-size:11px">${esc(s.whatsapp||'Sem WhatsApp')}</div></td><td>${dateBR(f.dueDate)}</td><td><strong>${money(f.value)}</strong></td><td>${st==='paid'?'<span class="badge ok">Em dia</span>':st==='overdue'?'<span class="badge bad">Atrasado</span>':'<span class="badge warn">Vencendo</span>'}</td><td><div class="row-actions">${s.whatsapp&&st!=='paid'?`<button class="btn whatsapp small" onclick="sendBillingWhatsApp('${f.id}')"><span class="wa-inline">${waIcon(16)}<span>Cobrar</span></span></button>`:''}${f.status!=='Pago'?`<button class="btn success small" onclick="markFinancePaid('${f.id}')">Pago</button>`:''}</div></td></tr>`}).join('')||'<tr><td colspan="5"><div class="empty">Nenhum registro para este filtro. 🎉</div></td></tr>';
}
function renderBirthdays(){
  const el=document.getElementById('birthdaysList');if(!el)return; const now=new Date(), month=now.getMonth()+1;
  const list=db.students.filter(s=>s.birth).map(s=>{const [y,m,d]=s.birth.split('-').map(Number);let diff=(m*100+d)-((now.getMonth()+1)*100+now.getDate());if(diff<0)diff+=1300;return {...s,bm:m,bd:d,diff};}).sort((a,b)=>a.diff-b.diff);
  const monthList=list.filter(s=>s.bm===month); const upcoming=list.slice(0,12);
  el.innerHTML=`<div class="module-kpis"><div class="module-kpi"><div class="label">Este mês</div><div class="value">${monthList.length}</div><div class="foot">Aniversários</div></div><div class="module-kpi"><div class="label">Próximo</div><div class="value" style="font-size:16px">${upcoming[0]?esc(upcoming[0].name.split(' ')[0]):'—'}</div><div class="foot">${upcoming[0]?`${String(upcoming[0].bd).padStart(2,'0')}/${String(upcoming[0].bm).padStart(2,'0')}`:'Sem cadastro'}</div></div><div class="module-kpi"><div class="label">Com nascimento</div><div class="value">${list.length}</div><div class="foot">Cadastros</div></div><div class="module-kpi"><div class="label">Ação</div><div class="value" style="font-size:15px">WhatsApp</div><div class="foot">Mensagem pronta</div></div></div><div style="display:grid;gap:9px">${upcoming.map(s=>`<div class="birth-card"><div style="display:flex;align-items:center;gap:12px"><div class="birth-date">${String(s.bd).padStart(2,'0')}/${String(s.bm).padStart(2,'0')}</div><div><strong>${esc(s.name)}</strong><div class="muted">${s.diff===0?'🎂 Hoje':s.diff===1?'Amanhã':`em ${s.diff} dias`}</div></div></div>${s.whatsapp?`<button class="btn whatsapp small" onclick="sendBirthdayWhatsApp('${s.id}')"><span class="wa-inline">${waIcon(16)}<span>Parabenizar</span></span></button>`:''}</div>`).join('')||'<div class="empty">Cadastre a data de nascimento dos alunos para acompanhar aniversários.</div>'}</div>`;
}

function openMakeupModal(id=null,studentId=null){
  editingId=id; const m=db.makeups.find(x=>x.id===id)||{}; const opts=db.students.map(s=>`<option value="${s.id}" ${(m.studentId||studentId)===s.id?'selected':''}>${esc(s.name)}</option>`).join('');
  const body=`<div class="form-grid"><div class="field full"><label>Aluno</label><select id="mkStudent"><option value="">Selecione</option>${opts}</select></div><div class="field"><label>Data original</label><input id="mkOriginal" type="date" value="${esc(m.originalDate||todayISO())}"></div><div class="field"><label>Nova data</label><input id="mkNew" type="date" value="${esc(m.newDate||'')}"></div><div class="field"><label>Novo horário</label><select id="mkTime"><option value="">Selecione</option>${db.hours.map(h=>`<option ${m.newTime===h?'selected':''}>${h}</option>`).join('')}</select></div><div class="field"><label>Status</label><select id="mkStatus"><option ${m.status==='Pendente'?'selected':''}>Pendente</option><option ${m.status==='Agendada'?'selected':''}>Agendada</option><option ${m.status==='Realizada'?'selected':''}>Realizada</option><option ${m.status==='Cancelada'?'selected':''}>Cancelada</option></select></div><div class="field full"><label>Motivo / observação</label><textarea id="mkNotes">${esc(m.notes||'')}</textarea></div></div>`;
  openModal(id?'Editar Reposição':'Agendar Reposição',body,saveMakeup);
}
function saveMakeup(){const sid=document.getElementById('mkStudent').value,s=studentById(sid);if(!sid){toast('Selecione o aluno.');return;}const obj={id:editingId||uid('mk'),studentId:sid,studentName:s?.name||'',originalDate:document.getElementById('mkOriginal').value,newDate:document.getElementById('mkNew').value,newTime:document.getElementById('mkTime').value,status:document.getElementById('mkStatus').value,notes:document.getElementById('mkNotes').value};if(editingId){const i=db.makeups.findIndex(x=>x.id===editingId);if(i>=0)db.makeups[i]=obj;}else db.makeups.push(obj);saveDB();closeModal();renderAll();toast('Reposição salva.');}
function renderMakeupsPage(){const el=document.getElementById('makeupsTable');if(!el)return;const rows=[...db.makeups].sort((a,b)=>String(a.newDate||'').localeCompare(String(b.newDate||'')));el.innerHTML=rows.map(m=>`<tr><td><strong>${esc(m.studentName||studentById(m.studentId)?.name||'—')}</strong></td><td>${dateBR(m.originalDate)}</td><td>${dateBR(m.newDate)} ${m.newTime?`<span class="schedule-chip">${esc(formatTimeRange(m.newTime))}</span>`:''}</td><td>${classStatusBadge(m.status)}</td><td><div class="row-actions"><button class="btn small" onclick="openMakeupModal('${m.id}')">Editar</button>${m.status==='Agendada'?`<button class="btn success small" onclick="completeMakeup('${m.id}')">Concluir</button>`:''}<button class="btn danger small icon ios-delete-button" onclick="deleteMakeup('${m.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Nenhuma reposição cadastrada.</div></td></tr>';}
function completeMakeup(id){const m=db.makeups.find(x=>x.id===id);if(!m)return;m.status='Realizada';saveDB();renderAll();toast('Reposição concluída.');}
async function deleteMakeup(id){const confirmed=await iosConfirm('A reposição será removida.',{title:'Excluir reposição',okLabel:'Excluir',danger:true});if(!confirmed)return;db.makeups=db.makeups.filter(x=>x.id!==id);saveDB();renderAll();}

function openWaitModal(id=null){editingId=id;const w=db.waitlist.find(x=>x.id===id)||{};const body=`<div class="form-grid"><div class="field full"><label>Nome *</label><input id="wName" value="${esc(w.name||'')}"></div><div class="field"><label>WhatsApp</label><input id="wWhatsapp" value="${esc(w.whatsapp||'')}"></div><div class="field"><label>Plano desejado</label><select id="wPlan"><option value="">Selecione</option>${db.plans.map(p=>`<option ${w.plan===p.name?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Horário desejado</label><select id="wTime"><option value="">Qualquer</option>${db.hours.map(h=>`<option ${w.time===h?'selected':''}>${h}</option>`).join('')}</select></div><div class="field"><label>Prioridade</label><select id="wPriority"><option value="1" ${Number(w.priority||1)===1?'selected':''}>1 — Alta</option><option value="2" ${Number(w.priority||1)===2?'selected':''}>2 — Média</option><option value="3" ${Number(w.priority||1)===3?'selected':''}>3 — Normal</option></select></div><div class="field"><label>Status</label><select id="wStatus"><option ${w.status==='Aguardando'?'selected':''}>Aguardando</option><option ${w.status==='Contactar'?'selected':''}>Contactar</option><option ${w.status==='Convertido'?'selected':''}>Convertido</option><option ${w.status==='Cancelado'?'selected':''}>Cancelado</option></select></div><div class="field full"><label>Observação</label><textarea id="wNotes">${esc(w.notes||'')}</textarea></div></div>`;openModal(id?'Editar Lista de Espera':'Adicionar à Lista de Espera',body,saveWait);}
function saveWait(){const name=document.getElementById('wName').value.trim();if(!name){toast('Informe o nome.');return;}const obj={id:editingId||uid('wait'),name,whatsapp:document.getElementById('wWhatsapp').value.trim(),plan:document.getElementById('wPlan').value,time:document.getElementById('wTime').value,priority:Number(document.getElementById('wPriority').value||3),status:document.getElementById('wStatus').value,notes:document.getElementById('wNotes').value,createdAt:db.waitlist.find(x=>x.id===editingId)?.createdAt||new Date().toISOString()};if(editingId){const i=db.waitlist.findIndex(x=>x.id===editingId);if(i>=0)db.waitlist[i]=obj;}else db.waitlist.push(obj);saveDB();closeModal();renderAll();toast('Contato adicionado à lista de espera.');}
function renderWaitlist(){const el=document.getElementById('waitTable');if(!el)return;const rows=[...db.waitlist].filter(w=>w.status!=='Convertido'&&w.status!=='Cancelado').sort((a,b)=>(a.priority||3)-(b.priority||3)||String(a.createdAt).localeCompare(String(b.createdAt)));el.innerHTML=rows.map(w=>`<tr><td><div style="display:flex;align-items:center;gap:8px"><span class="wait-priority">${w.priority||3}</span><strong>${esc(w.name)}</strong></div></td><td>${esc(w.whatsapp||'—')}</td><td>${esc(w.plan||'—')}</td><td>${esc(w.time||'Qualquer')}</td><td><span class="badge ${w.status==='Contactar'?'warn':'info'}">${esc(w.status)}</span></td><td><div class="row-actions">${w.whatsapp?`<button class="btn whatsapp small" onclick="openWaitWhatsApp('${w.id}')"><span class="wa-inline">${waIcon(16)}<span>Contatar</span></span></button>`:''}<button class="btn small" onclick="openWaitModal('${w.id}')">Editar</button><button class="btn success small" onclick="convertWait('${w.id}')">Converter</button><button class="btn danger small icon ios-delete-button" onclick="deleteWait('${w.id}')" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Lista de espera vazia.</div></td></tr>';}
function openWaitWhatsApp(id){const w=db.waitlist.find(x=>x.id===id);if(!w)return;openWhatsApp(w.whatsapp,`Olá, ${w.name}! 😊 Temos uma possibilidade de vaga no ${db.settings.studioName||'Studio de Pilates'}. Podemos conversar sobre horário e plano?`);}
function convertWait(id){const w=db.waitlist.find(x=>x.id===id);if(!w)return;w.status='Convertido';saveDB();renderAll();openStudentModal(null);toast('Contato convertido. Complete o cadastro do novo aluno.');}
async function deleteWait(id){const confirmed=await iosConfirm('O contato será removido da lista de espera.',{title:'Excluir contato',okLabel:'Excluir',danger:true});if(!confirmed)return;db.waitlist=db.waitlist.filter(x=>x.id!==id);saveDB();renderAll();}

/* Indicadores complementares no cabeçalho das páginas */
function enhanceModuleHeaders(){
  const pages={
    students:{id:'page-students',kpis:[['Alunos ativos',activeStudents().length],['Inativos',db.students.filter(s=>s.status==='Inativo').length],['Trancados',db.students.filter(s=>s.status==='Trancado').length],['Mensalidade ativa',money(activeStudents().reduce((a,s)=>a+Number(s.monthly||0),0))]]},
    agenda:{id:'page-agenda',kpis:[['Aulas do mês',classesForMonth(monthKey(currentMonth)).length],['Realizadas',classesForMonth(monthKey(currentMonth)).filter(c=>c.status==='Realizada').length],['Agendadas',classesForMonth(monthKey(currentMonth)).filter(c=>c.status==='Agendada').length],['Canceladas',classesForMonth(monthKey(currentMonth)).filter(c=>c.status==='Cancelada').length]]},
    makeups:{id:'page-makeups',kpis:[['Pendentes',db.makeups.filter(x=>x.status==='Pendente').length],['Agendadas',db.makeups.filter(x=>x.status==='Agendada').length],['Realizadas',db.makeups.filter(x=>x.status==='Realizada').length],['Total',db.makeups.length]]},
    waitlist:{id:'page-waitlist',kpis:[['Aguardando',db.waitlist.filter(x=>x.status==='Aguardando').length],['Contactar',db.waitlist.filter(x=>x.status==='Contactar').length],['Alta prioridade',db.waitlist.filter(x=>Number(x.priority)===1).length],['Total histórico',db.waitlist.length]]}
  };
  Object.values(pages).forEach(p=>{const sec=document.getElementById(p.id);if(!sec)return;let box=sec.querySelector('.v7-kpis');if(!box){box=document.createElement('div');box.className='module-kpis v7-kpis';sec.querySelector('.page-head')?.after(box);}box.innerHTML=p.kpis.map(k=>`<div class="module-kpi"><div class="label">${k[0]}</div><div class="value">${k[1]}</div></div>`).join('');});
}


let teacherManagementMonth=new Date(),billingCentralFilter='all',selectedTeacherManagement='';
function changeTeacherMonth(n){teacherManagementMonth=new Date(teacherManagementMonth.getFullYear(),teacherManagementMonth.getMonth()+n,1);renderTeacherManagement();}
function goTeacherCurrentMonth(){teacherManagementMonth=new Date();renderTeacherManagement();}
function teacherModel(t,key){const rows=db.classes.filter(c=>c.teacher===t&&sameMonth(c.date,key)),done=rows.filter(c=>c.status==='Realizada'),cancel=rows.filter(c=>c.status==='Cancelada'),students=new Set(done.map(c=>c.studentId).filter(Boolean)),rate=teacherRate(t),fixed=Number(db.settings.teacherFixedRates?.[t]||0),per=Number(db.settings.teacherClassValues?.[t]||db.settings.teacherDefaultClassValue||0),gross=done.reduce((a,c)=>a+Number(c.classValue||c.value||per||0),0),base=gross||done.length*per,total=base*rate/100+fixed;return{rows,done,cancel,experimental:done.filter(c=>c.experimental),students,rate,fixed,per,base,total};}
function openTeacherManagementModal(t=''){const rates=ensureTeacherRates(),name=t||db.teachers[0]||'';const b=`<div class="form-grid"><div class="field full"><label>Professor</label><input id="tmName" value="${esc(name)}"></div><div class="field"><label>Repasse (%)</label><input id="tmRate" type="number" min="0" max="100" step="0.1" value="${Number(rates[name]||0)}"></div><div class="field"><label>Repasse fixo</label><input id="tmFixed" type="number" min="0" step="0.01" value="${Number(db.settings.teacherFixedRates?.[name]||0)}"></div><div class="field"><label>Valor por aula</label><input id="tmClassValue" type="number" min="0" step="0.01" value="${Number(db.settings.teacherClassValues?.[name]||0)}"></div></div>`;openModal(name?'Editar professor':'Adicionar professor',b,()=>{const n=document.getElementById('tmName').value.trim(),r=Math.min(100,Math.max(0,Number(document.getElementById('tmRate').value||0))),fx=Math.max(0,Number(document.getElementById('tmFixed').value||0)),v=Math.max(0,Number(document.getElementById('tmClassValue').value||0));if(!n){toast('Informe o nome.');return false;}if(!db.teachers.includes(n))db.teachers.push(n);ensureTeacherRates()[n]=r;db.settings.teacherFixedRates=db.settings.teacherFixedRates||{};db.settings.teacherClassValues=db.settings.teacherClassValues||{};db.settings.teacherFixedRates[n]=fx;db.settings.teacherClassValues[n]=v;saveDB();renderAll();toast('Professor atualizado.');return true;});}
function selectTeacherManagement(t){selectedTeacherManagement=t;renderTeacherManagement();}
function renderTeacherManagement(){const key=monthKey(teacherManagementMonth),lbl=document.getElementById('teacherMonthLabel');if(lbl)lbl.textContent=monthLabel(teacherManagementMonth);const rows=db.teachers.map(t=>({teacher:t,...teacherModel(t,key)})),taught=rows.reduce((a,x)=>a+x.done.length,0),people=new Set();rows.forEach(x=>x.done.forEach(c=>c.studentId&&people.add(c.studentId)));const total=rows.reduce((a,x)=>a+x.total,0),cancel=rows.reduce((a,x)=>a+x.cancel.length,0),exp=rows.reduce((a,x)=>a+x.experimental.length,0);const k=document.getElementById('teacherManagementKpis');if(k)k.innerHTML=[['Professores',db.teachers.length],['Aulas ministradas',taught],['Alunos atendidos',people.size],['Total a receber',money(total)],['Canceladas',cancel],['Experimentais',exp]].map(x=>`<div class="module-kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div></div>`).join('');const closed=db.teacherClosings?.[key],cs=document.getElementById('teacherClosingStatus');if(cs)cs.innerHTML=closed?`<span class="badge ok">Fechado em ${dateBR(closed.closedAt.slice(0,10))}</span>`:'<span class="badge warn">Mês aberto</span>';const tb=document.getElementById('teacherManagementTable');if(tb)tb.innerHTML=rows.map(x=>`<tr class="${selectedTeacherManagement===x.teacher?'is-selected':''}" onclick="selectTeacherManagement('${esc(x.teacher).replace(/'/g,"\\'")}')"><td><strong>${esc(x.teacher)}</strong></td><td>${x.done.length}</td><td>${x.students.size}</td><td>${money(x.per)}</td><td><strong>${x.rate.toFixed(1).replace('.',',')}%</strong>${x.fixed?`<div class="muted">+ ${money(x.fixed)} fixo</div>`:''}</td><td><strong>${money(x.total)}</strong></td><td>${x.cancel.length}</td><td>${x.experimental.length}</td><td><button class="btn small" onclick="event.stopPropagation();openTeacherManagementModal('${esc(x.teacher).replace(/'/g,"\\'")}')">Editar</button></td></tr>`).join('')||'<tr><td colspan="9"><div class="empty">Nenhum professor cadastrado.</div></td></tr>';const d=document.getElementById('teacherManagementDetail'),sel=selectedTeacherManagement||rows[0]?.teacher;if(d&&sel){const x=rows.find(r=>r.teacher===sel)||teacherModel(sel,key);d.innerHTML=`<div class="teacher-detail-grid"><div><span>Aulas</span><strong>${x.done.length}</strong></div><div><span>Alunos</span><strong>${x.students.size}</strong></div><div><span>Repasse</span><strong>${x.rate.toFixed(1).replace('.',',')}%</strong></div><div><span>Total</span><strong>${money(x.total)}</strong></div></div><div class="section-title" style="margin-top:14px">Aulas do mês</div>${x.done.slice().sort(dateTimeSort).reverse().slice(0,30).map(c=>`<div class="v61-list-row"><span>${dateBR(c.date)} · ${esc(c.time||'')}</span><strong>${esc(c.studentName||studentById(c.studentId)?.name||'Aluno')}</strong><small>${c.experimental?'Experimental · ':''}${money(c.classValue||c.value||x.per)}</small></div>`).join('')||'<div class="empty">Nenhuma aula ministrada.</div>'}`;}const rl=document.getElementById('teacherDefaultRateLabel');if(rl)rl.textContent=`${Number(db.settings.teacherDefaultRate||0).toFixed(1).replace('.',',')}%`;}
function closeTeacherMonth(){const key=monthKey(teacherManagementMonth),rows=db.teachers.map(t=>({teacher:t,...teacherModel(t,key)}));db.teacherClosings=db.teacherClosings||{};db.teacherClosings[key]={closedAt:new Date().toISOString(),total:rows.reduce((a,x)=>a+x.total,0),classes:rows.reduce((a,x)=>a+x.done.length,0),teachers:rows.map(x=>({teacher:x.teacher,total:x.total,classes:x.done.length}))};saveDB();renderTeacherManagement();toast('Fechamento mensal registrado.');}
function billingStatusForStudent(s,key=monthKey(currentMonth)){const rows=db.finance.filter(f=>f.studentId===s.id&&f.type!=='Despesa'&&sameMonth(f.dueDate,key));if(rows.some(f=>f.status==='Pago'))return'paid';const p=rows.filter(f=>f.status==='Pendente').sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)))[0];if(!p)return'due';return p.dueDate<todayISO()?'overdue':'due';}
function setBillingFilter(f){billingCentralFilter=f;document.querySelectorAll('[data-billing-filter]').forEach(b=>b.classList.toggle('active',b.dataset.billingFilter===f));renderBilling();}
function renderBillingCentralStatus(){const key=monthKey(currentMonth),c={paid:0,due:0,overdue:0};activeStudents().forEach(s=>c[billingStatusForStudent(s,key)]++);const e=document.getElementById('billingStatusStrip');if(e)e.innerHTML=[['paid','🟢 Em dia'],['due','🟡 Vencendo'],['overdue','🔴 Atrasado']].map(x=>`<button class="billing-status-card ${billingCentralFilter===x[0]?'active':''}" onclick="setBillingFilter('${x[0]}')"><span>${x[1]}</span><strong>${c[x[0]]}</strong><small>alunos</small></button>`).join('');}
function getStudioAlerts(){const a=[],today=todayISO(),soon=new Date(Date.now()+3*864e5).toISOString().slice(0,10),reviewSoon=new Date(Date.now()+7*864e5).toISOString().slice(0,10);db.finance.filter(f=>f.type!=='Despesa'&&f.status==='Pendente'&&f.dueDate).forEach(f=>{const s=studentById(f.studentId)||{name:f.studentName};if(f.dueDate<today)a.push({id:'overdue-'+f.id,type:'overdue',icon:'🔴',title:'Mensalidade atrasada',text:`${s.name||'Aluno'} · ${money(f.value)} · ${dateBR(f.dueDate)}`,page:'billing'});else if(f.dueDate<=soon)a.push({id:'due-'+f.id,type:'due',icon:'🟠',title:'Mensalidade vencendo',text:`${s.name||'Aluno'} · ${money(f.value)} · ${dateBR(f.dueDate)}`,page:'billing'});});activeStudents().forEach(s=>{const from=new Date(Date.now()-30*864e5).toISOString().slice(0,10),n=db.classes.filter(c=>c.studentId===s.id&&c.date>=from&&c.status==='Realizada').length,expected=Math.max(1,Math.round(studentFrequency(s)*4.33));if(n<Math.max(1,Math.floor(expected*.6)))a.push({id:'freq-'+s.id,type:'frequency',icon:'🟡',title:'Aluno com baixa frequência',text:`${s.name} · ${n} aulas nos últimos 30 dias`,page:'students'});const r=s.clinical?.nextReview;if(r&&r>=today&&r<=reviewSoon)a.push({id:'review-'+s.id,type:'review',icon:'🟣',title:'Reavaliação próxima',text:`${s.name} · ${dateBR(r)}`,page:'evolution'});});db.classes.filter(c=>c.status==='Agendada'&&c.date>=today&&!c.equipmentId).forEach(c=>a.push({id:'equipment-'+c.id,type:'equipment',icon:'🔵',title:'Aula sem aparelho',text:`${dateBR(c.date)} · ${c.time||'—'} · ${c.studentName||studentById(c.studentId)?.name||'Aluno'}`,page:'equipment'}));db.finance.filter(f=>f.type!=='Despesa'&&f.status==='Pago'&&f.paidAt&&Date.now()-Date.parse(f.paidAt)<=7*864e5).forEach(f=>{const st=studentById(f.studentId)||{name:f.studentName};a.push({id:'paid-'+f.id,type:'paid',icon:'🟢',title:'Pagamento recebido',text:`${st.name||'Aluno'} · ${money(f.value)}`,page:'finance'});});return a.map(x=>({...x,dismissed:!!db.alertDismissed?.[x.id]}));}
function dismissAlert(id){db.alertDismissed=db.alertDismissed||{};db.alertDismissed[id]=true;saveDB();renderAlertsCenter();updateMenuBadges();}
function dismissAllAlerts(){getStudioAlerts().forEach(a=>{db.alertDismissed=db.alertDismissed||{};db.alertDismissed[a.id]=true;});saveDB();renderAlertsCenter();updateMenuBadges();toast('Alertas marcados como visualizados.');}
function renderAlertsCenter(){const all=getStudioAlerts(),items=all.filter(a=>!a.dismissed),types=['overdue','due','frequency','equipment','review','paid'],labels={'overdue':'🔴 Atrasadas','due':'🟠 Vencendo','frequency':'🟡 Frequência','equipment':'🔵 Aparelho','review':'🟣 Reavaliação','paid':'🟢 Recebidos'},counts=Object.fromEntries(types.map(t=>[t,items.filter(a=>a.type===t).length]));const k=document.getElementById('alertsKpis');if(k)k.innerHTML=types.map(t=>`<div class="module-kpi"><div class="label">${labels[t]}</div><div class="value">${counts[t]}</div></div>`).join('');const g=document.getElementById('alertsCenterGrid');if(!g)return;g.innerHTML=items.length?items.map(a=>`<article class="alert-card alert-${a.type}"><div class="alert-card-icon">${a.icon}</div><div class="alert-card-body"><strong>${esc(a.title)}</strong><p>${esc(a.text)}</p></div><div class="alert-card-actions"><button class="btn small" onclick="goPage('${a.page}')">Abrir</button><button class="btn small" onclick="dismissAlert('${a.id}')">Dispensar</button></div></article>`).join(''):'<div class="card panel"><div class="empty">Tudo em ordem. Nenhum alerta pendente. ✨</div></div>';}
function sendBillingWhatsApp(id){const f=db.finance.find(x=>x.id===id);if(!f)return;const s=studentById(f.studentId)||{name:f.studentName,whatsapp:f.whatsapp};openWhatsApp(s.whatsapp,replaceVars(db.settings.messages.billing,s,{value:f.value,due:dateBR(f.dueDate)}));}
function sendBirthdayWhatsApp(id){const s=studentById(id);if(!s)return;openWhatsApp(s.whatsapp,replaceVars(db.settings.messages.birthday,s));}
const REPORT_WEEKS_PER_MONTH = 4.33;

function ensureTeacherRates(){
  if(!db.settings) db.settings = {};
  if(!db.settings.teacherRates || typeof db.settings.teacherRates !== "object"){
    db.settings.teacherRates = {};
  }
  return db.settings.teacherRates;
}

function teacherRate(teacher){
  const rates = ensureTeacherRates();
  const value = Number(rates[teacher] ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function studentFrequency(student){
  const plan = db.plans.find(p => p.name === student.plan);
  const value = Number(plan?.weekly || student.weekly || 1);
  return Math.max(1, Math.min(7, Number.isFinite(value) ? value : 1));
}

function studentEconomics(student){
  const weekly = studentFrequency(student);
  const monthlyClasses = weekly * REPORT_WEEKS_PER_MONTH;
  const monthly = Math.max(0, Number(student.monthly || 0));
  const revenuePerClass = monthlyClasses ? monthly / monthlyClasses : 0;
  const durationHours = Math.max(0.25, Number(db.settings.duration || 60) / 60);
  const revenuePerHour = revenuePerClass / durationHours;
  const rate = teacherRate(student.teacher || "Sem professor");
  const teacherCost = monthlyClasses * revenuePerClass * (rate / 100);
  const margin = monthly - teacherCost;
  return { weekly, monthlyClasses, monthly, revenuePerClass, revenuePerHour, rate, teacherCost, margin };
}

function populateReportFilters(){
  const teacherEl = document.getElementById("reportTeacherFilter");
  if(!teacherEl) return;

  const current = teacherEl.value;
  const teachers = [...new Set([
    ...db.teachers,
    ...db.students.map(s => s.teacher).filter(Boolean)
  ])].sort((a,b)=>String(a).localeCompare(String(b),"pt-BR"));

  teacherEl.innerHTML = `<option value="">Todos</option>` +
    teachers.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");

  if(teachers.includes(current)) teacherEl.value = current;

  const monthEl = document.getElementById("reportMonthFilter");
  if(monthEl && !monthEl.value) monthEl.value = todayISO().slice(0,7);
}

function reportFilteredStudents(){
  const teacher = document.getElementById("reportTeacherFilter")?.value || "";
  const status = document.getElementById("reportStatusFilter")?.value || "Ativo";

  return db.students.filter(s => {
    const statusOk = status === "Todos" || s.status === status;
    const teacherOk = !teacher || s.teacher === teacher;
    return statusOk && teacherOk;
  });
}

function renderReports(){
  if(!db) return;

  populateReportFilters();

  const students = reportFilteredStudents();
  const month = document.getElementById("reportMonthFilter")?.value || todayISO().slice(0,7);

  let revenue = 0;
  let teacherCost = 0;
  let classes = 0;

  students.forEach(s => {
    const e = studentEconomics(s);
    revenue += e.monthly;
    teacherCost += e.teacherCost;
    classes += e.monthlyClasses;
  });

  const margin = revenue - teacherCost;
  const marginPct = revenue ? (margin / revenue) * 100 : 0;

  const setText = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  setText("reportRevenue", money(revenue));
  setText("reportTeacherCost", money(teacherCost));
  setText("reportMargin", money(margin));
  setText("reportMarginPct", `${marginPct.toFixed(1).replace(".",",")}% da receita`);
  setText("reportClasses", classes.toFixed(1).replace(".",","));

  // IDs legados mantidos.
  const active = db.students.filter(s=>s.status==="Ativo");
  const ticket = active.length ? active.reduce((a,s)=>a+Number(s.monthly||0),0)/active.length : 0;
  const pending = db.finance.filter(f=>f.status==="Pendente").reduce((a,f)=>a+Number(f.value||0),0);
  const billed = db.finance.reduce((a,f)=>a+Number(f.value||0),0);
  setText("reportTicket", money(ticket));
  setText("reportDefault", billed ? `${((pending/billed)*100).toFixed(1).replace(".",",")}%` : "0%");
  setText("reportInactive", db.students.filter(s=>s.status==="Inativo").length);
  setText("reportPaused", db.students.filter(s=>s.status==="Trancado").length);

  const filterStatus = document.getElementById("reportFilterStatus");
  if(filterStatus){
    const teacher = document.getElementById("reportTeacherFilter")?.value;
    const status = document.getElementById("reportStatusFilter")?.value || "Ativo";
    filterStatus.textContent = `${students.length} aluno(s) • ${teacher || "Todas as professoras"} • ${status}`;
  }

  renderReportStudents(students);
  renderReportTeachers(students);
  renderReportSummary(students, revenue, teacherCost, margin, classes, month);
  renderTeacherRateConfig();
}

function renderReportStudents(students){
  const el = document.getElementById("reportStudentsTable");
  if(!el) return;

  if(!students.length){
    el.innerHTML = `<tr><td colspan="10"><div class="settings-empty">Nenhum aluno encontrado para os filtros selecionados.</div></td></tr>`;
    return;
  }

  el.innerHTML = students
    .slice()
    .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"pt-BR"))
    .map(s=>{
      const e = studentEconomics(s);
      const marginClass = e.revenuePerClass - e.rate >= 0 ? "report-positive" : "report-negative";
      return `
        <tr>
          <td><span class="report-name">${esc(s.name)}</span><span class="report-sub">${esc(s.status||"")}</span></td>
          <td>${esc(s.plan||"Sem plano")}</td>
          <td>${esc(s.teacher||"Não definido")}</td>
          <td>${e.weekly}x</td>
          <td class="report-number">${money(e.monthly)}</td>
          <td class="report-number">${e.monthlyClasses.toFixed(1).replace(".",",")}</td>
          <td class="report-number">${money(e.revenuePerClass)}</td>
          <td class="report-number">${money(e.revenuePerHour)}</td>
          <td class="report-number">${money(e.rate)}</td>
          <td class="report-number ${marginClass}">${money(e.revenuePerClass-e.rate)}</td>
        </tr>`;
    }).join("");
}

function renderReportTeachers(students){
  const el = document.getElementById("reportTeachersTable");
  if(!el) return;

  const groups = {};
  students.forEach(s=>{
    const teacher = s.teacher || "Sem professor";
    const e = studentEconomics(s);
    if(!groups[teacher]) groups[teacher] = {students:0,classes:0,revenue:0,cost:0};
    groups[teacher].students++;
    groups[teacher].classes += e.monthlyClasses;
    groups[teacher].revenue += e.monthly;
    groups[teacher].cost += e.teacherCost;
  });

  const rows = Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0],"pt-BR"));
  if(!rows.length){
    el.innerHTML = `<tr><td colspan="6"><div class="settings-empty">Nenhum dado de professora para exibir.</div></td></tr>`;
    return;
  }

  el.innerHTML = rows.map(([teacher,g])=>{
    const margin = g.revenue-g.cost;
    return `
      <tr>
        <td><span class="report-name">${esc(teacher)}</span><span class="report-sub">${money(teacherRate(teacher))} por aluno/aula</span></td>
        <td class="report-number">${g.students}</td>
        <td class="report-number">${g.classes.toFixed(1).replace(".",",")}</td>
        <td class="report-number">${money(g.revenue)}</td>
        <td class="report-number">${money(g.cost)}</td>
        <td class="report-number ${margin>=0?"report-positive":"report-negative"}">${money(margin)}</td>
      </tr>`;
  }).join("");
}

function renderReportSummary(students, revenue, cost, margin, classes, month){
  const el = document.getElementById("reportSummary");
  if(!el) return;

  const avgPerClass = classes ? revenue/classes : 0;
  const avgRepasse = classes ? cost/classes : 0;
  const avgMargin = classes ? margin/classes : 0;

  el.innerHTML = `
    <div class="report-mini-grid">
      <div class="report-mini-card"><div class="report-mini-label">Alunos</div><div class="report-mini-value">${students.length}</div></div>
      <div class="report-mini-card"><div class="report-mini-label">R$/aula médio</div><div class="report-mini-value">${money(avgPerClass)}</div></div>
      <div class="report-mini-card"><div class="report-mini-label">Repasse médio</div><div class="report-mini-value">${money(avgRepasse)}</div></div>
      <div class="report-mini-card"><div class="report-mini-label">Margem/aula média</div><div class="report-mini-value">${money(avgMargin)}</div></div>
    </div>
    <div style="margin-top:14px">
      <div class="section-title" style="font-size:13px">Referência: ${esc(month)}</div>
      <div class="report-table-note">A projeção é baseada na mensalidade cadastrada e na frequência semanal do plano. Ela não substitui o controle de presença realizado.</div>
    </div>`;
}

function renderTeacherRateConfig(){
  const el = document.getElementById("reportTeacherConfig");
  if(!el) return;

  const teachers = [...new Set([
    ...db.teachers,
    ...db.students.map(s=>s.teacher).filter(Boolean)
  ])].sort((a,b)=>a.localeCompare(b,"pt-BR"));

  if(!teachers.length){
    el.innerHTML = `<div class="settings-empty">Cadastre uma professora em Configurações → Professores para definir o repasse.</div>`;
    return;
  }

  el.innerHTML = `
    <div class="report-config-card">
      ${teachers.map(t=>`
        <div class="report-config-row">
          <div>
            <label>${esc(t)}</label>
            <small>Percentual do valor da aula destinado à professora.</small>
          </div>
          <div class="field">
            <div class="repasse-percent-field"><input type="number" min="0" max="100" step="0.1" value="${teacherRate(t)}"
              onchange="saveTeacherRate('${esc(t).replaceAll("'","&#39;")}', this.value)"></div>
          </div>
        </div>
      `).join("")}
      <div class="actions" style="margin-top:4px">
        <button type="button" class="btn primary small" onclick="saveDB();renderReports();toast('Repasses salvos com sucesso!')">✓ Salvar repasses</button>
      </div>
    </div>`;
}

function saveTeacherRate(teacher, value){
  const rates = ensureTeacherRates();
  const n = Number(value||0);
  const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
  rates[teacher] = pct;
  saveDB();
  renderReports();
}

function exportReportsCSV(){
  const students = reportFilteredStudents();
  const rows = [
    ["Aluno","Plano","Professor","Frequência semanal","Mensalidade","Aulas/mês","Valor por aula","Valor por hora","Repasse (%)","Repasse mensal","Margem mensal"]
  ];

  students.forEach(s=>{
    const e = studentEconomics(s);
    rows.push([
      s.name||"", s.plan||"", s.teacher||"", e.weekly,
      e.monthly.toFixed(2), e.monthlyClasses.toFixed(2),
      e.revenuePerClass.toFixed(2), e.revenuePerHour.toFixed(2),
      e.rate.toFixed(2), e.teacherCost.toFixed(2), e.margin.toFixed(2)
    ]);
  });

  const csv = rows.map(row=>row.map(v=>{
    const text = String(v??"").replaceAll('"','""');
    return `"${text}"`;
  }).join(";")).join("\n");

  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_pilates_${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* CONFIGURAÇÕES — CRUD CORRIGIDO (somente Planos, Horários, Professores e Pagamentos) */
function renderSettingsCatalogs(){
  const plansEl=document.getElementById('plansSettings');
  if(plansEl){
    const rows=(db.plans||[]).map((p,i)=>`<tr>
      <td><strong>${esc(p.name||'—')}</strong></td>
      <td>${Number(p.weekly||0)}x/semana</td>
      <td>${money(p.price)}</td>
      <td><div class="row-actions"><button class="btn small" onclick="addPlan(${i})">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deletePlan(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td>
    </tr>`).join('');
    plansEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Plano</th><th>Frequência</th><th>Mensalidade</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhum plano cadastrado. Clique em “Novo Plano”.</div>`;
  }

  const hoursEl=document.getElementById('hoursSettings');
  if(hoursEl){
    const rows=(db.hours||[]).map((h,i)=>`<tr><td><strong>${esc(formatTimeRange(h))}</strong></td><td>${esc(hourDaysLabel(h))}</td><td><div class="row-actions"><button class="btn small" type="button" onclick="addHour(${i})">Editar dias/horário</button><button class="btn danger small icon ios-delete-button" type="button" onclick="deleteHour(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('');
    hoursEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Horário</th><th>Dias da semana</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhum horário cadastrado. Clique em “Novo Horário”.</div>`;
  }

  const teachersEl=document.getElementById('teachersSettings');
  if(teachersEl){
    const rows=(db.teachers||[]).map((t,i)=>`<tr><td><strong>${esc(t)}</strong></td><td><span class="repasse-percent-badge">${Number(teacherRate(t)).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</span></td><td><div class="row-actions"><button class="btn small" onclick="addTeacher(${i})">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deleteTeacher(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('');
    teachersEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Professor(a)</th><th>Repasse configurado</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhum professor cadastrado. Clique em “Novo Professor”.</div>`;
  }

  const paymentsEl=document.getElementById('paymentsSettings');
  if(paymentsEl){
    const rows=(db.payments||[]).map((t,i)=>`<tr><td><strong>${esc(t)}</strong></td><td><span class="badge ok">Disponível</span></td><td><div class="row-actions"><button class="btn small" onclick="addPayment(${i})">Editar</button><button class="btn danger small icon ios-delete-button" onclick="deletePayment(${i})" title="Excluir" aria-label="Excluir">${trashIcon(15)}</button></div></td></tr>`).join('');
    paymentsEl.innerHTML=rows?`<div class="table-wrap"><table><thead><tr><th>Forma de recebimento</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty">Nenhuma forma de recebimento cadastrada. Clique em “Nova Forma”.</div>`;
  }
}

function addPlan(index=null){
  const p=index!==null?db.plans[index]:{};
  const body=`<div class="form-grid">
    <div class="field full"><label>Nome do plano *</label><input id="cfgPlanName" value="${esc(p.name||'')}"></div>
    <div class="field"><label>Frequência semanal *</label><input id="cfgPlanWeekly" type="number" min="1" max="7" step="1" value="${Number(p.weekly||2)}"></div>
    <div class="field"><label>Mensalidade (R$) *</label><input id="cfgPlanPrice" type="number" min="0" step="0.01" value="${Number(p.price||0)}"></div>
  </div>`;
  openModal(index!==null?'Editar Plano':'Novo Plano',body,()=>savePlan(index));
}
function savePlan(index=null){
  const name=document.getElementById('cfgPlanName').value.trim();
  const weekly=Number(document.getElementById('cfgPlanWeekly').value||0);
  const price=Number(document.getElementById('cfgPlanPrice').value||0);
  if(!name){toast('Informe o nome do plano.');return;}
  if(weekly<1||weekly>7){toast('A frequência deve estar entre 1 e 7 aulas por semana.');return;}
  if(price<0){toast('Informe uma mensalidade válida.');return;}
  const duplicate=db.plans.some((x,i)=>i!==index&&String(x.name).trim().toLowerCase()===name.toLowerCase());
  if(duplicate){toast('Já existe um plano com esse nome.');return;}
  const obj={id:index!==null?(db.plans[index].id||uid('pln')):uid('pln'),name,weekly,price};
  if(index!==null) db.plans[index]=obj; else db.plans.push(obj);
  saveDB();closeModal();renderAll();toast(index!==null?'Plano atualizado com sucesso.':'Plano adicionado com sucesso.');
}
async function deletePlan(index){
  const p=db.plans[index]; if(!p)return;
  const inUse=db.students.some(s=>s.plan===p.name)||db.waitlist.some(w=>w.plan===p.name);
  if(inUse){toast('Este plano está vinculado a aluno ou lista de espera e não pode ser excluído.');return;}
  const confirmed=await iosConfirm(`Excluir o plano “${p.name}”?`,{title:'Excluir plano',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.plans.splice(index,1);saveDB();renderAll();toast('Plano excluído.');
}

function addHour(index=null){
  const current=index!==null?(db.hours[index]||''):'';
  const currentDays=index!==null&&db.hourDays?((db.hourDays[current]||[]).map(String)):['1','2','3','4','5'];
  const duration=Number(db.settings.duration||60);
  const dayOpts=[['1','Segunda'],['2','Terça'],['3','Quarta'],['4','Quinta'],['5','Sexta'],['6','Sábado'],['0','Domingo']];
  const body=`<div class="form-grid"><div class="field"><label>Horário de início *</label><input id="cfgHour" type="time" value="${esc(current)}"></div><div class="field"><label>Duração (minutos)</label><input id="cfgHourDuration" type="number" min="15" max="240" step="5" value="${duration}"></div><div class="field full"><label>Dias da semana</label><div class="actions" id="cfgHourDays">${dayOpts.map(([v,n])=>{const short={1:'SEG',2:'TER',3:'QUA',4:'QUI',5:'SEX',6:'SÁB',0:'DOM'}[v];return `<label class="ios-day-chip ios-day-chip-settings"><input type="checkbox" value="${v}" ${currentDays.includes(v)?'checked':''} aria-label="${n}"><span class="ios-day-check" aria-hidden="true">✓</span><span class="ios-day-label">${short}</span></label>`;}).join('')}</div></div></div><div class="muted" id="cfgHourPreview" style="margin-top:8px">Prévia: ${esc(current?formatTimeRange(current):'08:00 às 09:00')}</div>`;
  openModal(index!==null?'Editar Horário':'Novo Horário',body,()=>saveHour(index));
}
function saveHour(index=null){
  const value=document.getElementById('cfgHour').value;
  const duration=Math.max(15,Number(document.getElementById('cfgHourDuration')?.value||db.settings.duration||60));
  const days=[...document.querySelectorAll('#cfgHourDays input:checked')].map(x=>x.value);
  if(!value){toast('Informe o horário.');return;} if(!days.length){toast('Selecione pelo menos um dia.');return;}
  const duplicate=db.hours.some((x,i)=>i!==index&&x===value); if(duplicate){toast('Este horário já está cadastrado.');return;}
  if(!db.hourDays)db.hourDays={};
  if(index!==null){const old=db.hours[index];db.hours[index]=value;db.hourDays[value]=days;delete db.hourDays[old];db.students.forEach(s=>{if(s.time===old)s.time=value;});db.classes.forEach(c=>{if(c.time===old)c.time=value;});}
  else{db.hours.push(value);db.hourDays[value]=days;}
  db.settings.duration=duration; db.hours.sort(); saveDB();closeModal();renderAll();toast(index!==null?'Horário atualizado com sucesso.':'Horário adicionado com sucesso.');
}
async function deleteHour(index){
  const h=db.hours[index];if(!h)return;
  const inUse=db.students.some(s=>s.time===h)||db.classes.some(c=>c.time===h)||db.waitlist.some(w=>w.time===h);
  if(inUse){toast('Este horário está em uso e não pode ser excluído.');return;}
  const confirmed=await iosConfirm(`Excluir o horário ${h}?`,{title:'Excluir horário',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.hours.splice(index,1);if(db.hourDays)delete db.hourDays[h];saveDB();renderAll();toast('Horário excluído.');
}

function addTeacher(index=null){
  const name=index!==null?(db.teachers[index]||''):'';
  const rate=index!==null?teacherRate(name):0;
  const body=`<div class="form-grid">
    <div class="field full"><label>Nome da professora/professor *</label><input id="cfgTeacher" value="${esc(name)}"></div>
    <div class="field"><label>Repasse configurado (%)</label><div class="repasse-percent-field"><input id="cfgTeacherRate" type="number" min="0" max="100" step="0.1" value="${Number(rate||0)}"></div></div>
  </div><div class="muted" style="font-size:12px;margin-top:8px">O percentual será aplicado sobre o valor da aula e usado no módulo de Relatórios & Rentabilidade.</div>`;
  openModal(index!==null?'Editar Professor':'Novo Professor',body,()=>saveTeacher(index,name));
}
function saveTeacher(index=null,oldName=''){
  const name=document.getElementById('cfgTeacher').value.trim();
  const rate=Number(document.getElementById('cfgTeacherRate').value||0);
  if(!name){toast('Informe o nome do professor.');return;}
  if(rate<0){toast('Informe um repasse válido.');return;}
  const duplicate=db.teachers.some((x,i)=>i!==index&&String(x).trim().toLowerCase()===name.toLowerCase());
  if(duplicate){toast('Já existe um professor com esse nome.');return;}
  if(index!==null){
    db.teachers[index]=name;
    db.students.forEach(s=>{if(s.teacher===oldName)s.teacher=name;});
    db.classes.forEach(c=>{if(c.teacher===oldName)c.teacher=name;});
    db.settings.teacherRates=db.settings.teacherRates||{};
    if(oldName!==name && Object.prototype.hasOwnProperty.call(db.settings.teacherRates,oldName)){
      db.settings.teacherRates[name]=rate;
      delete db.settings.teacherRates[oldName];
    }else db.settings.teacherRates[name]=rate;
  }else{
    db.teachers.push(name);
    db.settings.teacherRates=db.settings.teacherRates||{};
    db.settings.teacherRates[name]=rate;
  }
  saveDB();closeModal();renderAll();toast(index!==null?'Professor atualizado com sucesso.':'Professor adicionado com sucesso.');
}
async function deleteTeacher(index){
  const name=db.teachers[index];if(!name)return;
  const inUse=db.students.some(s=>s.teacher===name)||db.classes.some(c=>c.teacher===name);
  if(inUse){toast('Este professor está vinculado a alunos ou aulas e não pode ser excluído.');return;}
  const confirmed=await iosConfirm(`Excluir “${name}”?`,{title:'Excluir professor',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.teachers.splice(index,1);
  if(db.settings.teacherRates)delete db.settings.teacherRates[name];
  saveDB();renderAll();toast('Professor excluído.');
}

function addPayment(index=null){
  const name=index!==null?(db.payments[index]||''):'';
  const body=`<div class="form-grid"><div class="field full"><label>Forma de recebimento *</label><input id="cfgPayment" value="${esc(name)}" placeholder="Ex.: PIX, Cartão, Dinheiro"></div></div>`;
  openModal(index!==null?'Editar Forma de Recebimento':'Nova Forma de Recebimento',body,()=>savePayment(index));
}
function savePayment(index=null){
  const name=document.getElementById('cfgPayment').value.trim();
  if(!name){toast('Informe a forma de recebimento.');return;}
  const duplicate=db.payments.some((x,i)=>i!==index&&String(x).trim().toLowerCase()===name.toLowerCase());
  if(duplicate){toast('Esta forma de recebimento já está cadastrada.');return;}
  if(index!==null)db.payments[index]=name;else db.payments.push(name);
  saveDB();closeModal();renderAll();toast(index!==null?'Forma de recebimento atualizada.':'Forma de recebimento adicionada.');
}
async function deletePayment(index){
  const name=db.payments[index];if(!name)return;
  const inUse=db.finance.some(f=>f.paymentMethod===name);
  if(inUse){toast('Esta forma de recebimento está vinculada a lançamentos financeiros e não pode ser excluída.');return;}
  const confirmed=await iosConfirm(`Excluir “${name}”?`,{title:'Excluir forma de recebimento',okLabel:'Excluir',danger:true});
  if(!confirmed)return;
  db.payments.splice(index,1);saveDB();renderAll();toast('Forma de recebimento excluída.');
}

/* Mantém o fluxo original e adiciona os novos módulos */
const _renderAllOriginal=renderAll;
function renderCurrentPage(page){
  ensureV7Data();
  applyThemeStyles();
  applyInterfacePreferences();
  const p=page||document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard';
  if(p==='dashboard'){renderDashboard();ensureV10Data();renderV10Dashboard();renderV9Alerts();}
  else if(p==='students') renderStudents();
  else if(p==='agenda') renderAgenda();
  else if(p==='hours') renderHours();
  else if(p==='occupancy'){renderOccupancy();renderOccupancyManagement();}
  else if(p==='finance'){renderFinance();ensureV10Data();renderV10FinanceEnhancement();}
  else if(p==='billing') renderBilling();
  else if(p==='makeups') renderMakeups();
  else if(p==='birthdays') renderBirthdays();
  else if(p==='waitlist') renderWaitlist();
  else if(p==='reports') renderReports();
  else if(p==='teacher'){ensureV10Data();renderTeacherPanel();}
  else if(p==='teachers'){ensureV10Data();renderTeacherManagement();}
  else if(p==='alerts'){ensureV10Data();renderAlertsCenter();}
  else if(p==='equipment') renderEquipment();
  else if(p==='evolution') renderEvolution();
  else if(p==='settings'){loadGeneralSettingsInputs();renderSettingsCatalogs();renderTeacherRateConfig();renderV9BackupStatus();}
}
function renderAll(){
  const page=document.querySelector('.page.active')?.id?.replace('page-','')||window.currentPage||'dashboard';
  window.currentPage=page;
  renderCurrentPage(page);
  updateMenuBadges();
}



/* V10 — CAMADA DE EVOLUÇÃO */
function ensureV10Data(){
  if(!db.settings) db.settings={};
  if(!db.settings.interface) db.settings.interface={density:'standard',reducedEffects:false};
  db.settings.interface={density:'standard',reducedEffects:false,tableWidth:720,tableDensity:'standard',backgroundOpacity:66,menuOpacity:72,bottomNavOpacity:72,menuPosition:'left',...db.settings.interface};
  db.settings.system={confirmDelete:true,animations:true,hapticVisual:true,showBadges:true,keyboardShortcuts:true,...(db.settings.system||{})};
  if(!Array.isArray(db.finance)) db.finance=[];
  if(!db.settings.teacherFixedRates) db.settings.teacherFixedRates={};
  if(!db.settings.teacherClassValues) db.settings.teacherClassValues={};
  if(!db.settings.teacherClosings) db.settings.teacherClosings={};
  if(!db.settings.alertDismissed) db.settings.alertDismissed={};
  db.students.forEach(s=>{ if(!Array.isArray(s.history)) s.history=[]; });
  db.finance.forEach(f=>{ if(!f.type) f.type='Receita'; });
}
function v10Month(){ return todayISO().slice(0,7); }
function v10FinanceRows(){ return db.finance.filter(f=>sameMonth(f.dueDate,v10Month())); }
function v10Expenses(){ return v10FinanceRows().filter(f=>f.type==='Despesa'); }
function v10Income(){ return v10FinanceRows().filter(f=>f.type!=='Despesa'); }
function v10IncomeReceived(){ return v10Income().filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0); }
function v10ExpensePaid(){ return v10Expenses().filter(f=>f.status==='Pago').reduce((a,f)=>a+Number(f.value||0),0); }
function v10DefaultRate(){ const rows=v10Income(); const pending=rows.filter(f=>f.status==='Pendente').reduce((a,f)=>a+Number(f.value||0),0); const total=rows.reduce((a,f)=>a+Number(f.value||0),0); return total?pending/total*100:0; }
function renderV10Dashboard(){
  ensureV10Data();
  const received=v10IncomeReceived(), expenses=v10ExpensePaid(), net=received-expenses;
  const today=todayISO(), todayClasses=db.classes.filter(c=>c.date===today);
  const pendingMakeups=db.makeups.filter(m=>m.status==='Pendente');
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('kpiNet',money(net)); set('kpiDefault',v10DefaultRate().toFixed(1).replace('.',',')+'%'); set('kpiTodayClasses',todayClasses.length); set('kpiMakeups',pendingMakeups.length);
  const active=activeStudents(), occupied=active.reduce((a,s)=>a+(Array.isArray(s.days)&&s.days.length?s.days.length:1),0), capacity=Number(db.settings.capacity||0)*Math.max(1,db.hours.length)*6;
  const teacherGroups={}; active.forEach(s=>{const t=s.teacher||'Sem professora'; teacherGroups[t]=(teacherGroups[t]||0)+1;});
  const topTeacher=Object.entries(teacherGroups).sort((a,b)=>b[1]-a[1])[0];
  const mg=document.getElementById('dashboardManagement'); if(mg) mg.innerHTML=`
    <div class="v10-management-item"><div class="label">Alunos ativos</div><div class="value">${active.length}</div><div class="foot">Base atual</div></div>
    <div class="v10-management-item"><div class="label">Ocupação estimada</div><div class="value">${capacity?(occupied/capacity*100).toFixed(0):0}%</div><div class="foot">Grade semanal</div></div>
    <div class="v10-management-item"><div class="label">Professora com mais alunos</div><div class="value" style="font-size:15px">${topTeacher?esc(topTeacher[0]):'—'}</div><div class="foot">${topTeacher?topTeacher[1]+' aluno(s)':'Sem dados'}</div></div>
    <div class="v10-management-item"><div class="label">Despesas pagas</div><div class="value">${money(expenses)}</div><div class="foot">Mês atual</div></div>`;
}
function renderV10FinanceEnhancement(){
  const exp=v10Expenses().reduce((a,f)=>a+Number(f.value||0),0), net=v10IncomeReceived()-v10ExpensePaid();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;}; set('financeExpenses',money(exp));set('financeNet',money(net));
}
function openExpenseModal(id=null){
  editingId=id; const f=db.finance.find(x=>x.id===id)||{};
  const body=`<div class="form-grid"><div class="field full"><label>Descrição da despesa *</label><input id="expDesc" value="${esc(f.description||'')}" placeholder="Ex.: aluguel, energia, material"></div><div class="field"><label>Valor *</label><input id="expValue" type="number" step="0.01" min="0" value="${f.value??''}"></div><div class="field"><label>Data</label><input id="expDue" type="date" value="${esc(f.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select id="expStatus"><option ${f.status==='Pendente'?'selected':''}>Pendente</option><option ${f.status==='Pago'?'selected':''}>Pago</option></select></div><div class="field"><label>Forma de pagamento</label><select id="expPay"><option value="">Selecione</option>${db.payments.map(p=>`<option ${f.paymentMethod===p?'selected':''}>${esc(p)}</option>`).join('')}</select></div><div class="field full"><label>Observação</label><textarea id="expNotes">${esc(f.notes||'')}</textarea></div></div>`;
  openModal(id?'Editar Despesa':'Nova Despesa',body,saveExpense);
}
function saveExpense(){
  const obj={id:editingId||uid('exp'),studentId:'',studentName:'',description:document.getElementById('expDesc').value.trim(),value:Number(document.getElementById('expValue').value||0),dueDate:document.getElementById('expDue').value,status:document.getElementById('expStatus').value,paymentMethod:document.getElementById('expPay').value,notes:document.getElementById('expNotes').value,type:'Despesa'};
  if(!obj.description||obj.value<=0||!obj.dueDate){toast('Informe descrição, valor e data da despesa.');return;}
  const i=db.finance.findIndex(x=>x.id===editingId); if(i>=0)db.finance[i]=obj;else db.finance.push(obj);
  saveDB();closeModal();renderAll();toast('Despesa salva com sucesso.');
}
function renderTeacherPanel(){
  ensureV10Data(); const filter=document.getElementById('teacherPanelFilter')?.value||'';
  const sel=document.getElementById('teacherPanelFilter'); if(sel){const cur=filter;sel.innerHTML='<option value="">Todas as professoras</option>'+db.teachers.map(t=>`<option ${t===cur?'selected':''}>${esc(t)}</option>`).join('');if(cur)sel.value=cur;}
  const classes=db.classes.filter(c=>c.date===todayISO()&&(!filter||c.teacher===filter)).sort(dateTimeSort);
  const students=activeStudents().filter(s=>!filter||s.teacher===filter);
  const k=document.getElementById('teacherPanelKpis'); if(k) k.innerHTML=[['Aulas hoje',classes.length,'Agenda do dia'],['Alunos',students.length,'Ativos'],['Realizadas',classes.filter(c=>c.status==='Realizada').length,'Hoje'],['Pendentes',classes.filter(c=>c.status==='Agendada').length,'Hoje']].map(x=>`<div class="module-kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="foot">${x[2]}</div></div>`).join('');
  const tc=document.getElementById('teacherTodayClasses'); if(tc) tc.innerHTML=classes.map(c=>`<div class="v10-teacher-row"><strong>${esc(c.time)}</strong> — ${esc(c.studentName)}<div style="margin-top:5px">${classStatusBadge(c.status)} <button class="btn small" onclick="openClassModal(null,null,'${c.id}')">Editar</button></div></div>`).join('')||'<div class="empty">Nenhuma aula hoje.</div>';
  const ts=document.getElementById('teacherStudents'); if(ts) ts.innerHTML=students.slice(0,30).map(s=>`<div class="v10-teacher-row"><strong>${esc(s.name)}</strong><div class="muted">${esc(s.time||'—')} • ${daysLabel(s.days)} • ${esc(s.plan||'Sem plano')}</div></div>`).join('')||'<div class="empty">Nenhum aluno encontrado.</div>';
}
function openStudentTimeline(id){
  const s=studentById(id);if(!s)return; const classes=db.classes.filter(c=>c.studentId===id).sort(dateTimeSort).slice(-20).reverse(); const fin=db.finance.filter(f=>f.studentId===id).sort((a,b)=>String(b.dueDate).localeCompare(String(a.dueDate))).slice(0,12);
  const body=`<div><div class="module-kpis"><div class="module-kpi"><div class="label">Plano</div><div class="value" style="font-size:15px">${esc(s.plan||'—')}</div></div><div class="module-kpi"><div class="label">Mensalidade</div><div class="value" style="font-size:17px">${money(s.monthly)}</div></div><div class="module-kpi"><div class="label">Aulas registradas</div><div class="value">${classes.length}</div></div></div><div class="section-title">Últimas aulas</div>${classes.map(c=>`<div class="v10-teacher-row">${dateBR(c.date)} • ${esc(c.time)} • ${classStatusBadge(c.status)}</div>`).join('')||'<div class="empty">Sem aulas registradas.</div>'}<div class="section-title" style="margin-top:15px">Últimos lançamentos</div>${fin.map(f=>`<div class="v10-teacher-row">${dateBR(f.dueDate)} • ${esc(f.description||'Lançamento')} • ${money(f.value)} • ${esc(f.status)}</div>`).join('')||'<div class="empty">Sem lançamentos.</div>'}</div>`;
  openModal('Ficha / Linha do Tempo — '+s.name,body,closeModal);
}
function enhanceStudentActions(){
  document.querySelectorAll('#studentsTable tr').forEach(tr=>{});
}
function enhanceFinanceTable(){
  const el=document.getElementById('financeTable'); if(!el)return;
  el.querySelectorAll('tr').forEach(tr=>{});
}
function registerPWA(){ if('serviceWorker' in navigator && location.protocol!=='file:'){ navigator.serviceWorker.register('sw.js').catch(()=>{}); } }

/* INICIALIZAÇÃO DO SISTEMA */
window.addEventListener("DOMContentLoaded", () => {
  db = loadDB();
  // Migra/espelha imediatamente os alunos existentes para a persistência redundante.
  saveStudentVault(db.students);
  renderAll();
  // A partir daqui, persistências sem mensagem específica recebem “Alteração feita”.
  window.__appReady = true;
});


/* ===== extracted script block ===== */

(function(){
  'use strict';
  const actions=[
    {icon:'⌕',title:'Buscar aluno',sub:'Encontre rapidamente um aluno',type:'student-search'},
    {icon:'＋',title:'Cadastrar aluno',sub:'Abrir cadastro de novo aluno',run:()=>openStudentModal()},
    {icon:'◷',title:'Agendar aula',sub:'Abrir agenda e nova aula',run:()=>openClassModal()},
    {icon:'$',title:'Financeiro',sub:'Receitas, cobranças e despesas',run:()=>iosSmartGo('finance')},
    {icon:'⚙',title:'Configurações',sub:'Preferências e aparência',run:()=>iosSmartGo('settings')},
    {icon:'⚡',title:'Ações rápidas',sub:'Abrir central de ações',run:()=>openQuickActions()}
  ];
  window.iosHaptic=function(kind){
    try{if(navigator.vibrate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){navigator.vibrate(kind==='success'?[8,24,8]:kind==='warning'?[18]:[6]);}}catch(e){}
  };
  window.iosSmartGo=function(page){
    try{
      const btn=document.querySelector('#mobileBottomNav button[data-page="'+page+'"]');
      if(btn) btn.click();
      else if(typeof goPage==='function') goPage(page);
      else if(typeof showPage==='function') showPage(page);
      else if(typeof navigateTo==='function') navigateTo(page);
      iosHaptic('tap');
    }catch(e){console.warn('iosSmartGo',e)}
  };
  function escSafe(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function dateKey(c){return String(c?.date||'');}
  function timeVal(c){return String(c?.time||'').replace(/\D/g,'').padStart(4,'0');}
  function updateSmartState(){
    try{
      const classes=Array.isArray(window.db?.classes)?window.db.classes:[];
      const today=typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10);
      const todayClasses=classes.filter(c=>dateKey(c)===today && c.status!=='Cancelada').sort((a,b)=>timeVal(a).localeCompare(timeVal(b)));
      const now=new Date(); const hm=String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');
      const next=todayClasses.find(c=>timeVal(c)>=hm) || todayClasses[0];
      const occupancy=todayClasses.length;
      const capacity=todayClasses.reduce((sum,c)=>sum+(Number(c.capacity)||Number(window.db?.settings?.maxOccupancy)||0),0);
      const used=todayClasses.reduce((sum,c)=>sum+1,0);
      const wNext=document.getElementById('iosWidgetNext');
      const wNextFoot=document.getElementById('iosWidgetNextFoot');
      const wOcc=document.getElementById('iosWidgetOccupancy');
      const wOccFoot=document.getElementById('iosWidgetOccupancyFoot');
      if(wNext) wNext.textContent=next?(String(next.time||'').slice(0,5)||'Hoje'):'—';
      if(wNextFoot) wNextFoot.textContent=next?`${next.studentName||'Aula'}${next.teacher?' · '+next.teacher:''}`:'Nenhuma aula programada';
      if(wOcc) wOcc.textContent=capacity?`${used}/${capacity}`:String(occupancy);
      if(wOccFoot) wOccFoot.textContent=capacity?'capacidade configurada':'aulas agendadas hoje';
      const alertCount=document.querySelectorAll('#navAlertsBadge').length?Number(document.getElementById('navAlertsBadge')?.textContent||0):0;
      const wa=document.getElementById('iosWidgetAlerts'); const waf=document.getElementById('iosWidgetAlertsFoot');
      if(wa) wa.textContent=Number.isFinite(alertCount)?String(alertCount):'0';
      if(waf) waf.textContent=alertCount?'Requer sua atenção':'Tudo em ordem';
    }catch(e){console.warn('smart state',e)}
  }
  window.openIOSCommandCenter=function(){
    const b=document.getElementById('iosCommandBackdrop'); if(!b)return;
    b.classList.add('open'); b.setAttribute('aria-hidden','false'); renderCommands('');
    setTimeout(()=>document.getElementById('iosCommandInput')?.focus(),40); iosHaptic('tap');
  };
  window.closeIOSCommandCenter=function(){const b=document.getElementById('iosCommandBackdrop');if(!b)return;b.classList.remove('open');b.setAttribute('aria-hidden','true');};
  function renderCommands(q){
    const list=document.getElementById('iosCommandList'); if(!list)return;
    q=String(q||'').trim().toLowerCase();
    let items=actions.filter(a=>!q || (a.title+' '+a.sub).toLowerCase().includes(q));
    if(q){
      const students=Array.isArray(window.db?.students)?window.db.students:[];
      students.filter(s=>String(s.name||'').toLowerCase().includes(q)).slice(0,8).forEach(s=>items.push({icon:'●',title:s.name||'Aluno',sub:'Abrir ficha do aluno',run:()=>{try{iosSmartGo('students')}catch(e){iosSmartGo('students')}}}));
    }
    list.innerHTML=items.length?items.map((a,i)=>`<button class="ios-command-item" type="button" data-cmd="${i}"><span class="cmd-icon">${escSafe(a.icon)}</span><span><strong>${escSafe(a.title)}</strong><small>${escSafe(a.sub)}</small></span></button>`).join(''):`<div style="padding:22px;text-align:center;color:var(--muted);font-size:12px">Nenhum resultado.</div>`;
    [...list.querySelectorAll('[data-cmd]')].forEach((el,i)=>el.addEventListener('click',()=>{const a=items[i];closeIOSCommandCenter();setTimeout(()=>{try{a.run&&a.run()}catch(e){console.warn(e)}},30)}));
  }
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openIOSCommandCenter();}
    if(e.key==='Escape') closeIOSCommandCenter();
  });
  document.addEventListener('click',e=>{
    const t=e.target.closest('button,.btn,[role="button"]'); if(t && t.id!=='iosCommandInput') iosHaptic('tap');
  },{passive:true});
  document.addEventListener('input',e=>{if(e.target.id==='iosCommandInput')renderCommands(e.target.value)},{passive:true});
  window.addEventListener('load',()=>{updateSmartState();setInterval(updateSmartState,15000);});
  window.addEventListener('storage',updateSmartState);
  window.addEventListener('ios:db-updated',updateSmartState);
})();


/* ===== extracted script block ===== */


/* Funções extras com fallback seguro */
function pinDashboardSummary(){localStorage.setItem("dashboard_summary_pinned","1");if(typeof toast==="function")toast("Resumo gerencial fixado.")}
function refreshManagementPanel(){if(typeof renderDashboard==="function")renderDashboard();if(typeof renderDashboardManagement==="function")renderDashboardManagement();if(typeof toast==="function")toast("Painel atualizado.")}
function printManagementSummary(){window.print()}
function focusStudentSearch(){goPage("students");setTimeout(()=>document.getElementById("studentSearch")?.focus(),100)}
function exportStudentsList(){if(typeof exportData==="function")exportData()}
function printStudentsList(){window.print()}
function goAgendaToday(){goPage("agenda")}
function focusNextClass(){goPage("agenda")}
function printAgenda(){window.print()}
function printHours(){window.print()}
function pinOccupancyMatrix(){localStorage.setItem("occupancy_matrix_pinned","1");if(typeof toast==="function")toast("Matriz de ocupação fixada.")}
function printOccupancyManagement(){window.print()}
function openFinanceSummary(){goPage("finance")}
function exportFinanceReport(){if(typeof exportData==="function")exportData()}
function printFinanceSummary(){window.print()}
function printBilling(){window.print()}
function renderMakeups(){if(typeof renderMakeupsPage==="function")renderMakeupsPage()}
function filterBirthdaysMonth(){goPage("birthdays")}
function openBirthdayBatch(){if(typeof openBatchWhatsAppModal==="function")openBatchWhatsAppModal()}
function printBirthdays(){window.print()}
function sortWaitlistPriority(){goPage("waitlist")}
function openWaitlistBatch(){goPage("waitlist")}
function exportReports(){if(typeof exportData==="function")exportData()}
function printReports(){window.print()}
function printTeacherPanel(){window.print()}

/* Painel gerencial resumido */
function renderManagementSummary(){
  const box=document.getElementById("managementSummary");if(!box)return;
  const students=(typeof db!=="undefined"&&db.students)?db.students:[];
  const active=students.filter(s=>String(s.status||"Ativo").toLowerCase()==="ativo").length;
  const plans=[...new Set(students.map(s=>s.plan||s.plano).filter(Boolean))].length;
  const classes=(typeof db!=="undefined"&&db.classes)?db.classes:[];
  const today=new Date().toISOString().slice(0,10);
  const todayClasses=classes.filter(c=>String(c.date||c.data||"").slice(0,10)===today).length;
  box.innerHTML=`
    <div class="grid grid-4">
      <div class="card kpi"><div class="kpi-label">ALUNOS ATIVOS</div><div class="kpi-value">${active}</div><div class="kpi-foot">Base atual</div></div>
      <div class="card kpi"><div class="kpi-label">PLANOS EM USO</div><div class="kpi-value">${plans}</div><div class="kpi-foot">Planos cadastrados nos alunos</div></div>
      <div class="card kpi"><div class="kpi-label">AULAS HOJE</div><div class="kpi-value">${todayClasses}</div><div class="kpi-foot">Agenda do dia</div></div>
      <div class="card kpi"><div class="kpi-label">GESTÃO</div><div class="kpi-value">Ativa</div><div class="kpi-foot">Sistema operacional</div></div>
    </div>`;
}

/* Ocupação: alunos por plano + dia + horário */
function normalizeOccupancyDays(raw){
  const arr=Array.isArray(raw)?raw:[raw];
  const map={seg:'1',segunda:'1',ter:'2',terça:'2',terca:'2',qua:'3',quarta:'3',qui:'4',quinta:'4',sex:'5',sexta:'5',sáb:'6',sab:'6',sábado:'6',sabado:'6',dom:'0',domingo:'0'};
  return [...new Set(arr.flatMap(v=>{const x=String(v??'').trim().toLowerCase();return map[x]?[map[x]]:[x];}).filter(Boolean))];
}
function occupancyDayName(v){return ({'1':'Seg','2':'Ter','3':'Qua','4':'Qui','5':'Sex','6':'Sáb','0':'Dom'})[String(v)]||String(v)}
function filterOccupancyDay(day){
  window.occupancySelectedDay=day||'all';
  document.querySelectorAll('#occupancyDayFilters .btn').forEach(b=>b.classList.remove('primary'));
  const labels={all:'Todos','1':'Segunda','2':'Terça','3':'Quarta','4':'Quinta','5':'Sexta','6':'Sábado','0':'Domingo'};
  const target=[...document.querySelectorAll('#occupancyDayFilters .btn')].find(b=>b.textContent.trim()===labels[String(window.occupancySelectedDay)]);
  if(target)target.classList.add('primary');
  renderOccupancyManagement();
}
function renderOccupancyManagement(){
  const box=document.getElementById("occupancyPlanMatrix");if(!box)return;
  const students=(typeof db!=="undefined"&&db.students)?db.students:[];
  const selected=window.occupancySelectedDay||'all';
  const rows=students.map(s=>({
    name:s.name||s.nome||"Aluno",
    plan:s.plan||s.plano||s.planName||"Sem plano",
    time:s.schedule||s.horario||s.time||"—",
    days:normalizeOccupancyDays(s.days||s.dias||s.weekdays||s.day||[])
  })).filter(r=>selected==='all'||r.days.length===0||r.days.includes(String(selected)));
  const plans=[...new Set(rows.map(r=>r.plan))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'));
  if(!plans.length){box.innerHTML='<div class="empty">Nenhum aluno encontrado para o filtro selecionado.</div>';return;}
  box.innerHTML=plans.map(plan=>{
    const pr=rows.filter(r=>r.plan===plan);
    const groups={};
    pr.forEach(r=>{
      const days=r.days.length?r.days.slice().sort((a,b)=>Number(a)-Number(b)):[];
      const key=r.time+'|'+(days.length?days.join(','):'sem-dia');
      if(!groups[key])groups[key]={time:r.time,days,names:[]};
      groups[key].names.push(r.name);
    });
    const ordered=Object.values(groups).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
    return `<div class="card panel" style="margin-top:10px">
      <div class="panel-head"><div><div class="panel-title">${esc(plan)}</div><div class="muted" style="font-size:11px">${pr.length} aluno(s) neste plano</div></div><span class="badge info">${selected==='all'?'Todos os dias':occupancyDayName(selected)}</span></div>
      <div class="table-wrap"><table><thead><tr><th>Dias</th><th>Horário</th><th>Aluno(s)</th></tr></thead><tbody>
      ${ordered.map(g=>`<tr><td><strong>${esc(g.days.length?g.days.map(occupancyDayName).join(', '):'Não definido')}</strong></td><td><span class="schedule-chip">${esc(g.time)}</span></td><td>${g.names.map(esc).join(', ')}</td></tr>`).join('')||'<tr><td colspan="3" class="muted">Nenhum aluno registrado.</td></tr>'}
      </tbody></table></div>
    </div>`;
  }).join('');
}


/* iOS 27 — personalização de densidade, tabelas, transparência e relógio do aparelho */
function applyAdvancedInterfaceSettings(){
  const prefs=db?.settings?.interface||{};
  const width=Math.max(520,Math.min(1100,Number(prefs.tableWidth||720)));
  const density=['compact','standard','comfortable'].includes(prefs.tableDensity)?prefs.tableDensity:'standard';
  const opacity=Math.max(0,Math.min(100,Number(prefs.backgroundOpacity??66)));
  const menuOpacity=Math.max(0,Math.min(100,Number(prefs.menuOpacity??72)));
  const bottomNavOpacity=Math.max(0,Math.min(100,Number(prefs.bottomNavOpacity??72)));
  document.documentElement.style.setProperty('--white-bg-opacity',(opacity/100).toFixed(2));
  document.documentElement.style.setProperty('--menu-opacity',(menuOpacity/100).toFixed(2));
  document.documentElement.style.setProperty('--bottom-nav-opacity',(bottomNavOpacity/100).toFixed(2));
  document.documentElement.style.setProperty('--table-min-width',width+'px');
  document.documentElement.style.setProperty('--system-bg-opacity',(opacity/100).toFixed(2));
  document.documentElement.dataset.tableDensity=density;
  const wr=document.getElementById('tableWidthRange'); if(wr)wr.value=String(width);
  const wo=document.getElementById('tableWidthValue'); if(wo)wo.textContent=width+' px';
  const br=document.getElementById('backgroundOpacityRange'); if(br)br.value=String(opacity);
  const bo=document.getElementById('backgroundOpacityValue'); if(bo)bo.textContent=opacity+'%';
  const mr=document.getElementById('menuOpacityRange'); if(mr)mr.value=String(menuOpacity);
  const mo=document.getElementById('menuOpacityValue'); if(mo)mo.textContent=menuOpacity+'%';
  const brn=document.getElementById('bottomNavOpacityRange'); if(brn)brn.value=String(bottomNavOpacity);
  const bno=document.getElementById('bottomNavOpacityValue'); if(bno)bno.textContent=bottomNavOpacity+'%';
  document.querySelectorAll('[data-table-width]').forEach(b=>b.classList.toggle('active',(width<=620?'compact':width>=900?'wide':'standard')===b.dataset.tableWidth));
  document.querySelectorAll('[data-table-density]').forEach(b=>b.classList.toggle('active',b.dataset.tableDensity===density));
}
function setTableWidth(value){
  const width=Math.max(520,Math.min(1100,Number(value)||720));
  db.settings.interface={...(db.settings.interface||{}),tableWidth:width};
  applyAdvancedInterfaceSettings(); saveDB();
}
function setTableWidthPreset(preset){ setTableWidth({compact:600,standard:720,wide:920}[preset]||720); }
function setTableDensity(density){
  if(!['compact','standard','comfortable'].includes(density)) density='standard';
  db.settings.interface={...(db.settings.interface||{}),tableDensity:density};
  applyAdvancedInterfaceSettings(); saveDB(); toast('Densidade das tabelas atualizada.');
}
function setBackgroundOpacity(value){
  const opacity=Math.max(0,Math.min(100,Number(value)));
  db.settings.interface={...(db.settings.interface||{}),backgroundOpacity:opacity};
  applyAdvancedInterfaceSettings();
  if(typeof applyDashboardHero==='function') applyDashboardHero();
  saveDB();
}
function setMenuOpacity(value){
  const menuOpacity=Math.max(0,Math.min(100,Number(value)||0));
  db.settings.interface={...(db.settings.interface||{}),menuOpacity};
  applyAdvancedInterfaceSettings();
  saveDB();
}
function setBottomNavOpacity(value){
  const bottomNavOpacity=Math.max(0,Math.min(100,Number(value)||0));
  db.settings.interface={...(db.settings.interface||{}),bottomNavOpacity};
  applyAdvancedInterfaceSettings();
  saveDB();
}
function syncDeviceDateTime(){
  const now=new Date(), dateEl=document.getElementById('deviceDate'), timeEl=document.getElementById('deviceTime');
  if(dateEl) dateEl.textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now);
  if(timeEl) timeEl.textContent=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
}
function startDeviceClock(){
  syncDeviceDateTime();
  if(window.__deviceClockTimer) clearInterval(window.__deviceClockTimer);
  if(window.__equipmentDashboardTimer) clearInterval(window.__equipmentDashboardTimer);
  window.__deviceClockTimer=setInterval(syncDeviceDateTime,1000);
  // Atualização operacional sem criar múltiplos timers quando a inicialização
  // da interface for executada novamente.
  window.__equipmentDashboardTimer=setInterval(()=>{
    if(window.currentPage==='dashboard' && typeof renderDashboardEquipmentSchedule==='function') renderDashboardEquipmentSchedule();
    if(window.currentPage==='equipment' && typeof renderControlEquipment==='function') renderControlEquipment();
  },15000);
}

/* V11 — preferências de interface e atalhos */
function applyInterfacePreferences(){
  const prefs=db?.settings?.interface || {};
  const density=['comfortable','standard','compact'].includes(prefs.density)?prefs.density:'standard';
  const reduced=!!prefs.reducedEffects;
  document.documentElement.dataset.uiDensity=density;
  document.documentElement.dataset.reduceEffects=reduced?'1':'0';
  applyAdvancedInterfaceSettings();
  document.querySelectorAll('#uiDensityOptions .v11-preference-btn').forEach(b=>b.classList.toggle('active',b.dataset.density===density));
  const sw=document.getElementById('reduceEffectsSwitch');
  if(sw){sw.classList.toggle('on',reduced);sw.setAttribute('aria-checked',String(reduced));}
}
function setInterfaceDensity(density){
  if(!['comfortable','standard','compact'].includes(density)) density='standard';
  db.settings.interface={...(db.settings.interface||{}),density};
  applyInterfacePreferences(); saveDB(); toast(`Interface ${density==='compact'?'compacta':density==='comfortable'?'confortável':'padrão'} aplicada.`);
}
function toggleReducedEffects(){
  db.settings.interface={...(db.settings.interface||{}),reducedEffects:!db.settings.interface?.reducedEffects};
  applyInterfacePreferences(); saveDB();
  toast(db.settings.interface.reducedEffects?'Efeitos reduzidos para priorizar desempenho.':'Efeitos visuais restaurados.');
}
function focusGlobalSearch(){
  const i=document.getElementById('menuSearch');
  if(i){document.getElementById('sidebar')?.classList.add('open');i.focus();i.select();}
}
function closeTransientUI(){
  const modal=document.getElementById('modalBackdrop');
  if(modal?.classList.contains('show')){closeModal();return true;}
  const sidebar=document.getElementById('sidebar');
  if(sidebar?.classList.contains('open')){sidebar.classList.remove('open');return true;}
  document.getElementById('menuSearch')?.blur();
  return false;
}

/* Tenta atualizar os blocos sem interferir no código oficial */
function refreshAdvancedPanels(force=false){
  try{updateCustomizationState()}catch(e){}
  if(force || document.getElementById('page-occupancy')?.classList.contains('active')) try{renderOccupancyManagement()}catch(e){}
}
document.addEventListener("DOMContentLoaded",()=>{
  document.documentElement.dataset.reduceEffects=(db.settings.interface?.reducedEffects?'1':'0');
  loadDashboardAppearance();
  applyInterfacePreferences();
  applyAdvancedInterfaceSettings();
  startDeviceClock();
  restoreCustomization();
  if(window.requestIdleCallback){requestIdleCallback(()=>refreshAdvancedPanels(false),{timeout:1500});}
});


/* ===== extracted script block ===== */

(function(){
  function syncBottomNav(){
    const page=window.currentPage||document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard';
    document.querySelectorAll('#mobileBottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  }
  document.addEventListener('click',e=>{
    const sidebar=document.getElementById('sidebar');
    if(sidebar?.classList.contains('open') && !e.target.closest('#sidebar') && !e.target.closest('.mobile-menu')) sidebar.classList.remove('open');
    const b=e.target.closest('#mobileBottomNav button');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof goPage==='function') goPage(b.dataset.page);
    setTimeout(syncBottomNav,30);
  });
  const oldGo=window.goPage;
  if(typeof oldGo==='function') window.goPage=function(page){const r=oldGo.apply(this,arguments);setTimeout(syncBottomNav,20);return r;};
  window.addEventListener('DOMContentLoaded',()=>setTimeout(syncBottomNav,100));
})();


/* ===== extracted script block ===== */

(function(){
  const backdrop=document.getElementById('iosConfirmBackdrop');
  const titleEl=document.getElementById('iosConfirmTitle');
  const messageEl=document.getElementById('iosConfirmMessage');
  const okBtn=document.getElementById('iosConfirmOk');
  const cancelBtn=document.getElementById('iosConfirmCancel');
  const iconEl=document.getElementById('iosConfirmIcon');
  let resolver=null, previousFocus=null;
  const trashSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/></svg>';
  const warnSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 21 20H3L12 3.5Z"/><path d="M12 9v5"/><path d="M12 17.5h.01"/></svg>';
  const restoreSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9a8 8 0 1 1 2.35 5.65"/><path d="M4 4v5h5"/></svg>';
  function close(value){
    if(!backdrop||!resolver)return;
    const r=resolver; resolver=null; backdrop.classList.remove('is-open'); backdrop.setAttribute('aria-hidden','true');
    document.body.classList.remove('ios-confirm-open');
    setTimeout(()=>{if(previousFocus?.focus) previousFocus.focus();previousFocus=null;},180);
    r(value);
  }
  window.iosConfirm=function(message, options={}){
    if(!backdrop) return Promise.resolve(false);
    if(resolver) close(false);
    previousFocus=document.activeElement;
    titleEl.textContent=options.title||'Confirmar ação';
    messageEl.textContent=String(message??'');
    const danger=options.danger!==false;
    okBtn.textContent=options.okLabel||'Confirmar';
    okBtn.classList.toggle('danger',danger);
    iconEl.innerHTML=options.icon==='restore'?restoreSvg:(danger?trashSvg:warnSvg);
    backdrop.classList.add('is-open'); backdrop.setAttribute('aria-hidden','false'); document.body.classList.add('ios-confirm-open');
    requestAnimationFrame(()=>okBtn.focus());
    return new Promise(resolve=>{resolver=resolve;});
  };
  okBtn?.addEventListener('click',()=>close(true));
  cancelBtn?.addEventListener('click',()=>close(false));
  backdrop?.addEventListener('click',e=>{if(e.target===backdrop)close(false)});
  document.addEventListener('keydown',e=>{if(!backdrop?.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();close(false)}});
})();


/* ===== extracted script block ===== */

/* V42 — evolução profissional: indicadores, metas, reavaliação e comparação longitudinal */
function evo42Num(v,def=0){const n=Number(v);return Number.isFinite(n)?n:def}
function evo42Clamp(v,min=0,max=10){return Math.max(min,Math.min(max,evo42Num(v,min)))}
function evo42Date(d){return d?dateBR(d):'—'}
function evo42DaysFrom(a,b){if(!a||!b)return null;return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5)}
function ensureEvolutionV42(){
 ensurePatientEvolutionData();
 db.students.forEach(s=>{
  const c=s.clinical||{};
  ['baselineDate','painScore','painLocation','functionalScale','functionalScore','postureScore','mobilityScore','strengthScore','balanceScore','controlScore'].forEach(k=>{if(c[k]==null)c[k]='';});
  if(!Array.isArray(c.goals))c.goals=[];
  c.goals=c.goals.map(g=>({id:g.id||uid('goal'),area:String(g.area||'Funcional'),description:String(g.description||''),baseline:g.baseline??'',target:g.target??'',current:g.current??'',unit:String(g.unit||''),targetDate:g.targetDate||'',status:g.status||'Em andamento'}));
  s.clinical=c;
  if(!Array.isArray(s.evolution))s.evolution=[];
  s.evolution=s.evolution.map(e=>({id:e.id||uid('evo'),date:e.date||todayISO(),title:e.title||'Evolução',complaint:e.complaint||'',objective:e.objective||c.objective||'',assessment:e.assessment||'',pain:e.pain||'',painBefore:e.painBefore??'',painAfter:e.painAfter??'',functionalScore:e.functionalScore??'',mobilityScore:e.mobilityScore??'',strengthScore:e.strengthScore??'',balanceScore:e.balanceScore??'',controlScore:e.controlScore??'',intervention:e.intervention||'',exercises:e.exercises||'',response:e.response||'',adherence:e.adherence||'',tolerance:e.tolerance||'',progression:e.progression||'',incidents:e.incidents||'',nextSteps:e.nextSteps||'',nextReview:e.nextReview||'',professional:e.professional||s.teacher||''}));
 });
}
function evo42Progress(g){const b=Number(g.baseline),t=Number(g.target),c=Number(g.current);if(![b,t,c].every(Number.isFinite)||t===b)return null;return Math.max(0,Math.min(100,Math.round(((c-b)/(t-b))*100)))}
function evo42Metric(label,val){if(val===''||val==null||!Number.isFinite(Number(val)))return `<div class="evo42-meter"><div class="evo42-meter-top"><span>${label}</span><b>—</b></div><div class="evo42-bar"><i style="width:0%"></i></div></div>`;const n=evo42Clamp(val);return `<div class="evo42-meter"><div class="evo42-meter-top"><span>${label}</span><b>${n}/10</b></div><div class="evo42-bar"><i style="width:${n*10}%"></i></div></div>`}
function renderEvolution(){
 ensureEvolutionV42();const q=(document.getElementById('evolutionSearch')?.value||'').toLowerCase().trim(),sel=document.getElementById('evolutionStudentSelect');
 if(sel){const cur=sel.value;sel.innerHTML='<option value="">Todos os pacientes</option>'+db.students.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR')).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');sel.value=cur;}
 const selected=sel?.value||'',list=db.students.filter(s=>(!selected||s.id===selected)&&(!q||String(s.name).toLowerCase().includes(q))),k=document.getElementById('evolutionKpis');
 const total=db.students.reduce((n,s)=>n+(s.evolution||[]).length,0),tracked=db.students.filter(s=>(s.evolution||[]).length||s.clinical?.baselineDate).length,d30=new Date(Date.now()-30*864e5).toISOString().slice(0,10),recent=db.students.reduce((n,s)=>n+(s.evolution||[]).filter(e=>e.date>=d30).length,0),due=db.students.filter(s=>s.clinical?.nextReview&&s.clinical.nextReview<=todayISO()).length;
 if(k)k.className='evo42-kpis',k.innerHTML=[['Pacientes acompanhados',tracked],['Sessões registradas',total],['Reavaliações vencidas',due],['Registros · 30 dias',recent]].map(x=>`<div class="evo42-kpi"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');
 const grid=document.getElementById('evolutionPatientGrid');if(!grid)return;if(!list.length){grid.innerHTML='<div class="evo42-empty">Nenhum paciente encontrado.</div>';return;}grid.innerHTML='<div class="evo42-shell">'+list.map(evo42PatientCard).join('')+'</div>';
}
function evo42PatientCard(s){
 const c=s.clinical||{},entries=evolutionSummary(s),latest=entries[0],goals=c.goals||[],p0=latest?.painAfter!==''&&latest?.painAfter!=null?latest.painAfter:c.painScore,days=evo42DaysFrom(c.baselineDate||entries.at(-1)?.date,latest?.date),painDelta=(Number.isFinite(Number(c.painScore))&&Number.isFinite(Number(p0)))?Number(p0)-Number(c.painScore):null;
 return `<div class="evo42-patient"><div class="evo42-head"><div><h3>${esc(s.name)}</h3><div class="muted">${esc(s.plan||'Sem plano')} · ${esc(s.teacher||'Sem profissional')} ${days!=null?'· acompanhamento há '+days+' dias':''}</div></div><div class="evo42-actions"><button class="btn small primary" onclick="openEvolutionModal('${s.id}')">＋ Registrar sessão</button><button class="btn small" onclick="openClinicalProfileV42('${s.id}')">Ficha completa</button><button class="btn small" onclick="openEvolutionReport('${s.id}')">Relatório</button></div></div>
 <div class="evo42-grid"><div class="evo42-card"><div class="evo42-section-title"><h4>Indicadores atuais</h4><span class="evo42-badge">${latest?evo42Date(latest.date):'Sem sessão'}</span></div><div class="evo42-metrics">${evo42Metric('Mobilidade',latest?.mobilityScore??c.mobilityScore)}${evo42Metric('Força / resistência',latest?.strengthScore??c.strengthScore)}${evo42Metric('Equilíbrio / coordenação',latest?.balanceScore??c.balanceScore)}${evo42Metric('Controle motor',latest?.controlScore??c.controlScore)}</div>${c.painScore!==''||p0!==''?`<div class="evo42-compare" style="margin-top:10px"><div class="box"><div class="v">${c.painScore!==''?c.painScore:'—'}</div><div class="k">Dor inicial</div></div><div class="box"><div class="v">${p0!==''?p0:'—'}</div><div class="k">Dor atual</div></div><div class="box"><div class="v">${painDelta==null?'—':(painDelta>0?'+':'')+painDelta}</div><div class="k">Variação</div></div></div>`:''}</div>
 <div class="evo42-card"><div class="evo42-section-title"><h4>Metas</h4><span class="evo42-badge">${goals.length}</span></div>${goals.length?goals.slice(0,4).map(g=>{const pr=evo42Progress(g);return `<div class="evo42-goal"><div class="gt"><span>${esc(g.area)} · ${esc(g.description||'Meta')}</span><span>${pr==null?'—':pr+'%'}</span></div><div class="sub">${esc(String(g.current||'—'))} ${esc(g.unit)} → ${esc(String(g.target||'—'))} ${esc(g.unit)} ${g.targetDate?'· '+evo42Date(g.targetDate):''}</div>${pr!=null?`<div class="evo42-bar" style="margin-top:7px"><i style="width:${pr}%"></i></div>`:''}</div>`}).join(''):'<div class="evo42-empty">Cadastre metas mensuráveis na ficha completa.</div>'}${c.alerts?`<div class="evo42-alert" style="margin-top:9px"><b>Pontos de atenção:</b> ${esc(c.alerts)}</div>`:''}</div></div>
 <div class="evo42-card" style="margin-top:12px"><div class="evo42-section-title"><h4>Histórico de evolução</h4><span class="evo42-badge">${entries.length} registro(s)</span></div><div class="evo42-timeline">${entries.slice(0,5).map(e=>`<div class="evo42-entry"><div class="meta">${evo42Date(e.date)} · ${esc(e.professional||s.teacher||'Profissional')}</div><div class="title">${esc(e.title||'Evolução')}</div><div class="evo42-badges">${e.painAfter!==''?`<span class="evo42-badge">Dor ${esc(String(e.painAfter))}/10</span>`:''}${e.mobilityScore!==''?`<span class="evo42-badge">Mobilidade ${esc(String(e.mobilityScore))}/10</span>`:''}${e.functionalScore!==''?`<span class="evo42-badge">Função ${esc(String(e.functionalScore))}/10</span>`:''}${e.equipment?`<span class="evo42-badge">${esc(e.equipment)}</span>`:''}</div><div class="txt">${esc([e.assessment,e.response,e.progression].filter(Boolean).join('\n'))||'Sem observação detalhada.'}</div><div class="evo42-actions" style="margin-top:7px;justify-content:flex-start"><button class="btn small" onclick="openEvolutionModal('${s.id}','${e.id}')">Editar</button></div></div>`).join('')||'<div class="evo42-empty">Nenhuma sessão registrada.</div>'}</div></div></div>`;
}
function openClinicalProfileV42(id){
 ensureEvolutionV42();const s=studentById(id);if(!s)return;const c=s.clinical||{};
 const goalRows=(c.goals||[]).map(g=>`<div class="evo42-goal" data-goal-row="1"><input type="hidden" class="goalId" value="${esc(g.id)}"><div class="form-grid"><div class="field"><label>Área</label><input class="goalArea" value="${esc(g.area)}"></div><div class="field"><label>Meta</label><input class="goalDesc" value="${esc(g.description)}"></div><div class="field"><label>Inicial</label><input type="number" step="any" class="goalBase" value="${esc(String(g.baseline))}"></div><div class="field"><label>Atual</label><input type="number" step="any" class="goalCurrent" value="${esc(String(g.current))}"></div><div class="field"><label>Alvo</label><input type="number" step="any" class="goalTarget" value="${esc(String(g.target))}"></div><div class="field"><label>Unidade</label><input class="goalUnit" value="${esc(g.unit)}"></div><div class="field"><label>Prazo</label><input type="date" class="goalDate" value="${esc(g.targetDate)}"></div><div class="field"><label>Status</label><select class="goalStatus"><option ${g.status==='Em andamento'?'selected':''}>Em andamento</option><option ${g.status==='Atingida'?'selected':''}>Atingida</option><option ${g.status==='Pausada'?'selected':''}>Pausada</option><option ${g.status==='Revisar'?'selected':''}>Revisar</option></select></div></div><button class="btn small danger" type="button" onclick="this.closest('[data-goal-row]').remove()">Excluir meta</button></div>`).join('');
 const b=`<div class="evo42-modal-grid"><div class="evo42-card"><h4>Resumo clínico e funcional</h4><div class="field"><label>Queixa principal</label><textarea id="v42Complaint">${esc(c.complaint||'')}</textarea></div><div class="field"><label>Objetivo terapêutico / funcional</label><textarea id="v42Objective">${esc(c.objective||s.goal||'')}</textarea></div><div class="field"><label>Diagnóstico / condição informada</label><textarea id="v42Diagnosis">${esc(c.diagnosis||'')}</textarea></div><div class="field"><label>Histórico relevante</label><textarea id="v42Medical">${esc(c.medicalHistory||'')}</textarea></div><div class="field"><label>Contraindicações / cuidados</label><textarea id="v42Contra">${esc(c.contraindications||'')}</textarea></div><div class="field"><label>Alertas / pontos de atenção</label><textarea id="v42Alerts">${esc(c.alerts||'')}</textarea></div></div>
 <div class="evo42-card"><h4>Avaliação inicial e base de comparação</h4><div class="form-grid"><div class="field"><label>Data da avaliação inicial</label><input id="v42BaselineDate" type="date" value="${esc(c.baselineDate||'')}"></div><div class="field"><label>Próxima reavaliação</label><input id="v42Review" type="date" value="${esc(c.nextReview||'')}"></div><div class="field"><label>Dor inicial (0–10)</label><input id="v42Pain" type="number" min="0" max="10" value="${esc(String(c.painScore??''))}"></div><div class="field"><label>Localização da dor</label><input id="v42PainLoc" value="${esc(c.painLocation||'')}"></div><div class="field"><label>Escala funcional</label><input id="v42Scale" value="${esc(c.functionalScale||'')}"></div><div class="field"><label>Função inicial (0–10)</label><input id="v42Func" type="number" min="0" max="10" value="${esc(String(c.functionalScore??''))}"></div></div><div class="form-grid" style="margin-top:8px">${[['posture','Postura'],['mobility','Mobilidade'],['strength','Força / resistência'],['balance','Equilíbrio / coordenação'],['control','Controle motor']].map(x=>`<div class="field"><label>${x[1]} inicial (0–10)</label><input id="v42_${x[0]}" type="number" min="0" max="10" value="${esc(String(c[x[0]+'Score']??''))}"></div>`).join('')}</div><div class="field"><label>Medidas / testes / referências</label><textarea id="v42Measures">${esc(c.measurements||'')}</textarea></div></div>
 <div class="evo42-card full"><div class="evo42-section-title"><h4>Metas mensuráveis</h4><button class="btn small" type="button" onclick="addGoalV42()">＋ Adicionar meta</button></div><div id="v42Goals">${goalRows||'<div class="evo42-empty">Nenhuma meta cadastrada.</div>'}</div><div class="evo42-mini-note">Registre valores que possam ser comparados nas próximas avaliações. A unidade pode ser %, repetições, segundos, centímetros ou uma escala definida pelo profissional.</div></div>
 <div class="evo42-card full"><h4>Planejamento e observações</h4><div class="form-grid"><div class="field"><label>Frequência planejada</label><input id="v42Frequency" value="${esc(c.frequency||'')}"></div><div class="field"><label>Plano de intervenção</label><textarea id="v42Plan">${esc(c.plan||'')}</textarea></div><div class="field"><label>Orientações para casa</label><textarea id="v42Home">${esc(c.homecare||'')}</textarea></div><div class="field"><label>Postura</label><textarea id="v42Posture">${esc(c.posture||'')}</textarea></div><div class="field"><label>Mobilidade / amplitude</label><textarea id="v42Mobility">${esc(c.mobility||'')}</textarea></div><div class="field"><label>Força / resistência</label><textarea id="v42Strength">${esc(c.strength||'')}</textarea></div><div class="field"><label>Equilíbrio / coordenação</label><textarea id="v42Balance">${esc(c.balance||'')}</textarea></div><div class="field"><label>Respiração / controle motor</label><textarea id="v42Breathing">${esc(c.breathing||'')}</textarea></div></div></div></div>`;
 openModal(`Ficha completa — ${esc(s.name)}`,b,()=>{const goals=[...document.querySelectorAll('#v42Goals [data-goal-row]')].map(r=>({id:r.querySelector('.goalId')?.value||uid('goal'),area:r.querySelector('.goalArea')?.value.trim()||'Funcional',description:r.querySelector('.goalDesc')?.value.trim()||'',baseline:r.querySelector('.goalBase')?.value??'',current:r.querySelector('.goalCurrent')?.value??'',target:r.querySelector('.goalTarget')?.value??'',unit:r.querySelector('.goalUnit')?.value.trim()||'',targetDate:r.querySelector('.goalDate')?.value||'',status:r.querySelector('.goalStatus')?.value||'Em andamento'})).filter(g=>g.description||g.area);
 s.clinical={...s.clinical,complaint:v42Complaint.value.trim(),objective:v42Objective.value.trim(),diagnosis:v42Diagnosis.value.trim(),medicalHistory:v42Medical.value.trim(),contraindications:v42Contra.value.trim(),alerts:v42Alerts.value.trim(),baselineDate:v42BaselineDate.value,painScore:v42Pain.value,painLocation:v42PainLoc.value.trim(),functionalScale:v42Scale.value.trim(),functionalScore:v42Func.value,postureScore:v42_posture.value,mobilityScore:v42_mobility.value,strengthScore:v42_strength.value,balanceScore:v42_balance.value,controlScore:v42_control.value,measurements:v42Measures.value.trim(),nextReview:v42Review.value,goals,frequency:v42Frequency.value.trim(),plan:v42Plan.value.trim(),homecare:v42Home.value.trim(),posture:v42Posture.value.trim(),mobility:v42Mobility.value.trim(),strength:v42Strength.value.trim(),balance:v42Balance.value.trim(),breathing:v42Breathing.value.trim()};s.goal=s.clinical.objective||s.goal||'';s.updatedAt=new Date().toISOString();saveDB();renderAll();toast('Ficha de evolução atualizada.');return true;});
}
function addGoalV42(){const box=document.getElementById('v42Goals');if(!box)return;if(box.querySelector('.evo42-empty'))box.innerHTML='';const r=document.createElement('div');r.className='evo42-goal';r.dataset.goalRow='1';r.innerHTML=`<input type="hidden" class="goalId" value="${uid('goal')}"><div class="form-grid"><div class="field"><label>Área</label><input class="goalArea" value="Funcional"></div><div class="field"><label>Meta</label><input class="goalDesc"></div><div class="field"><label>Inicial</label><input type="number" step="any" class="goalBase"></div><div class="field"><label>Atual</label><input type="number" step="any" class="goalCurrent"></div><div class="field"><label>Alvo</label><input type="number" step="any" class="goalTarget"></div><div class="field"><label>Unidade</label><input class="goalUnit"></div><div class="field"><label>Prazo</label><input type="date" class="goalDate"></div><div class="field"><label>Status</label><select class="goalStatus"><option>Em andamento</option><option>Atingida</option><option>Pausada</option><option>Revisar</option></select></div></div><button class="btn small danger" type="button" onclick="this.closest('[data-goal-row]').remove()">Excluir meta</button>`;box.appendChild(r)}
function openEvolutionModal(studentId=null,entryId=null){
 ensureEvolutionV42();const s=studentById(studentId)||db.students[0];if(!s){toast('Cadastre um paciente primeiro.');return;}const old=(s.evolution||[]).find(e=>e.id===entryId)||{id:uid('evo'),date:todayISO(),title:'Evolução da sessão',complaint:s.clinical?.complaint||'',objective:s.clinical?.objective||s.goal||'',assessment:'',pain:'',painBefore:s.clinical?.painScore??'',painAfter:'',functionalScore:'',mobilityScore:'',strengthScore:'',balanceScore:'',controlScore:'',intervention:'',exercises:'',equipment:'',response:'',adherence:'',tolerance:'',progression:'',incidents:'',nextSteps:s.clinical?.plan||'',nextReview:s.clinical?.nextReview||'',professional:s.teacher||''};
 const b=`<div class="evo42-modal-grid"><div class="evo42-card"><h4>Sessão</h4><div class="field"><label>Paciente</label><select id="v42EvStudent">${db.students.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="form-grid"><div class="field"><label>Data</label><input id="v42EvDate" type="date" value="${esc(old.date||todayISO())}"></div><div class="field"><label>Título</label><input id="v42EvTitle" value="${esc(old.title||'Evolução da sessão')}"></div></div><div class="field"><label>Queixa / relato no início</label><textarea id="v42EvComplaint">${esc(old.complaint||'')}</textarea></div><div class="field"><label>Objetivo acompanhado</label><textarea id="v42EvObjective">${esc(old.objective||'')}</textarea></div></div>
 <div class="evo42-card"><h4>Indicadores da sessão</h4><div class="form-grid"><div class="field"><label>Dor antes (0–10)</label><input id="v42EvPainBefore" type="number" min="0" max="10" value="${esc(String(old.painBefore??''))}"></div><div class="field"><label>Dor depois (0–10)</label><input id="v42EvPainAfter" type="number" min="0" max="10" value="${esc(String(old.painAfter??''))}"></div><div class="field"><label>Função (0–10)</label><input id="v42EvFunc" type="number" min="0" max="10" value="${esc(String(old.functionalScore??''))}"></div><div class="field"><label>Mobilidade (0–10)</label><input id="v42EvMob" type="number" min="0" max="10" value="${esc(String(old.mobilityScore??''))}"></div><div class="field"><label>Força / resistência (0–10)</label><input id="v42EvStrength" type="number" min="0" max="10" value="${esc(String(old.strengthScore??''))}"></div><div class="field"><label>Equilíbrio (0–10)</label><input id="v42EvBalance" type="number" min="0" max="10" value="${esc(String(old.balanceScore??''))}"></div><div class="field"><label>Controle motor (0–10)</label><input id="v42EvControl" type="number" min="0" max="10" value="${esc(String(old.controlScore??''))}"></div></div></div>
 <div class="evo42-card full"><h4>Avaliação e intervenção</h4><div class="field"><label>Avaliação / achados</label><textarea id="v42EvAssessment">${esc(old.assessment||'')}</textarea></div><div class="form-grid"><div class="field"><label>Exercícios realizados</label><textarea id="v42EvExercises">${esc(old.exercises||'')}</textarea></div><div class="field"><label>Equipamentos utilizados</label><textarea id="v42EvEquipment">${esc(old.equipment||'')}</textarea></div><div class="field"><label>Intervenção / ajustes</label><textarea id="v42EvIntervention">${esc(old.intervention||'')}</textarea></div><div class="field"><label>Resposta / evolução observada</label><textarea id="v42EvResponse">${esc(old.response||'')}</textarea></div></div></div>
 <div class="evo42-card full"><h4>Adesão, tolerância e continuidade</h4><div class="form-grid"><div class="field"><label>Adesão</label><input id="v42EvAdherence" value="${esc(old.adherence||'')}"></div><div class="field"><label>Tolerância</label><input id="v42EvTolerance" value="${esc(old.tolerance||'')}"></div><div class="field"><label>Progressão</label><input id="v42EvProgression" value="${esc(old.progression||'')}"></div></div><div class="field"><label>Intercorrências / observações de segurança</label><textarea id="v42EvIncidents">${esc(old.incidents||'')}</textarea></div><div class="form-grid"><div class="field"><label>Plano para próxima sessão</label><textarea id="v42EvNext">${esc(old.nextSteps||'')}</textarea></div><div class="field"><label>Próxima revisão</label><input id="v42EvReview" type="date" value="${esc(old.nextReview||'')}"></div><div class="field"><label>Profissional responsável</label><input id="v42EvProfessional" value="${esc(old.professional||s.teacher||'')}"></div></div></div></div>`;
 openModal(entryId?'Editar evolução':'Registrar evolução',b,()=>{const t=studentById(v42EvStudent.value);if(!t)return false;if(!Array.isArray(t.evolution))t.evolution=[];const e={...old,id:old.id||uid('evo'),date:v42EvDate.value||todayISO(),title:v42EvTitle.value.trim()||'Evolução da sessão',complaint:v42EvComplaint.value.trim(),objective:v42EvObjective.value.trim(),assessment:v42EvAssessment.value.trim(),pain:v42EvPainAfter.value||v42EvPainBefore.value||'',painBefore:v42EvPainBefore.value,painAfter:v42EvPainAfter.value,functionalScore:v42EvFunc.value,mobilityScore:v42EvMob.value,strengthScore:v42EvStrength.value,balanceScore:v42EvBalance.value,controlScore:v42EvControl.value,intervention:v42EvIntervention.value.trim(),exercises:v42EvExercises.value.trim(),equipment:v42EvEquipment.value.trim(),response:v42EvResponse.value.trim(),adherence:v42EvAdherence.value.trim(),tolerance:v42EvTolerance.value.trim(),progression:v42EvProgression.value.trim(),incidents:v42EvIncidents.value.trim(),nextSteps:v42EvNext.value.trim(),nextReview:v42EvReview.value,professional:v42EvProfessional.value.trim()};const i=t.evolution.findIndex(x=>x.id===e.id);if(i>=0)t.evolution[i]=e;else t.evolution.push(e);t.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)));if(e.nextReview)t.clinical.nextReview=e.nextReview;saveDB();renderAll();toast('Evolução registrada com sucesso.');return true;});
}
function openEvolutionReport(id){ensureEvolutionV42();const s=studentById(id);if(!s)return;const c=s.clinical||{},e=evolutionSummary(s),goals=c.goals||[];const w=window.open('','_blank');if(!w){toast('Permita pop-ups para gerar o relatório.');return;}w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Evolução — ${esc(s.name)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;padding:28px;color:#17202a;max-width:900px;margin:auto}h1{font-size:22px}h2{font-size:15px;margin-top:22px;border-bottom:1px solid #ddd;padding-bottom:6px}.box{padding:12px;border:1px solid #ddd;border-radius:10px;margin:8px 0}.muted{color:#667085;font-size:12px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.entry{border-left:3px solid #777;padding:8px 12px;margin:9px 0;background:#fafafa}.entry small{color:#667085}@media print{body{padding:0}}</style>
<style id="ios27-v70-final-3">
/* v70 — paleta enxuta + Liquid Glass refinado + desempenho */
:root{--ios27-accent-soft:color-mix(in srgb,var(--p) 10%,transparent);--ios27-surface-tint:color-mix(in srgb,var(--p) 3%,white);}
.palette-grid-pro{grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.palette-pro{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.42))!important}.palette-swatches{gap:4px}.palette-swatches span{height:24px;border-radius:7px}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dark-palette{min-height:106px;padding:12px 11px;border-radius:18px!important;background:linear-gradient(145deg,rgba(40,40,50,.82),rgba(24,24,31,.66))!important}.dark-swatches{gap:4px}.dark-swatches span{height:22px;border-radius:7px}
html[data-theme="dark"] .palette-pro{background:rgba(255,255,255,.045)!important}
html[data-theme="dark"] .dark-palette.active,html[data-theme="dark"] .palette-pro.active{box-shadow:0 0 0 2px color-mix(in srgb,var(--p) 32%,transparent),0 12px 30px rgba(0,0,0,.22)!important}
/* Material hierarchy: blur fica concentrado nos elementos estruturais, evitando excesso de composição. */
.card,.panel,.kpi,.dashboard-equipment-row,.equipment-card-v40,.equipment-inventory-card,.rotation-block-v41,.rotation-center-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:blur(26px) saturate(165%)!important;-webkit-backdrop-filter:blur(26px) saturate(165%)!important}
@media(max-width:900px){.palette-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr))}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sidebar{backdrop-filter:blur(22px) saturate(155%)!important;-webkit-backdrop-filter:blur(22px) saturate(155%)!important}}
@media(prefers-reduced-transparency:reduce),(prefers-reduced-motion:reduce){.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.palette-pro:hover,.dark-palette:hover{transform:none!important}}
</style>

<style id="v71-performance-modal-palettes">
/* v71: performance + modal viewport + exactly 4 light / 2 dark palettes */
:root{
 --p:#6f5bd3;--p2:#9a8de5;--a:#d783ad;
 --bg:#f5f5f7;--card:#ffffff;--ink:#1c1c1e;--muted:#6e6e73;--line:rgba(60,60,67,.16);
 --surface-2:#f2f2f7;--surface-3:#e5e5ea;--input-bg:#fff;--focus:rgba(111,91,211,.20);
 --ios27-material:rgba(255,255,255,.72);--ios27-material-strong:rgba(255,255,255,.88);
}
html[data-theme="dark"]{--p:#a99bf5;--p2:#c5bcff;--a:#dca1bf;--bg:#0b0b0f;--card:#1c1c20;--ink:#f5f5f7;--muted:#a1a1a6;--line:rgba(235,235,245,.16);--surface-2:#2c2c30;--surface-3:#3a3a40;--input-bg:#16161a;--focus:rgba(169,155,245,.30);--ios27-material:rgba(36,36,42,.76);--ios27-material-strong:rgba(44,44,50,.92)}
/* Keep palette controls deterministic: four light choices and two dark choices. */
.palette-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dark-palette-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.palette-pro,.dark-palette{min-height:88px;border-radius:18px;padding:12px;background:var(--ios27-material);border-color:var(--ios27-hairline);box-shadow:0 6px 18px rgba(30,30,40,.05)}
.palette-pro.active,.dark-palette.active{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 16%,transparent)}
/* Modal: never clip the footer or content; viewport-safe on iPhone/Android keyboards. */
.modal-backdrop{padding:clamp(8px,2vw,20px);align-items:center;overflow:auto;-webkit-overflow-scrolling:touch}
.modal{width:min(720px,calc(100vw - 16px));max-height:min(88dvh,820px);display:flex;flex-direction:column;overflow:hidden;overscroll-behavior:contain}
.modal-head{flex:0 0 auto;min-height:64px}.modal-body{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-bottom:24px}.modal-foot{flex:0 0 auto;min-height:68px;padding:12px 16px;background:var(--ios27-material-strong);border-top:1px solid var(--ios27-hairline);box-shadow:0 -8px 22px rgba(20,20,30,.06)}
.modal-foot .btn{min-width:112px;min-height:44px;font-size:13px;font-weight:750;opacity:1!important;visibility:visible!important}
.modal-foot .btn:not(.primary){background:var(--surface-2);color:var(--ink);border-color:var(--line)}
.modal-foot .btn.primary{background:linear-gradient(135deg,var(--p),var(--a));color:#fff;border-color:transparent;box-shadow:0 7px 18px color-mix(in srgb,var(--p) 22%,transparent)}
@media(max-width:900px){
 body{padding-bottom:calc(88px + env(safe-area-inset-bottom,0px))}
 .modal-backdrop{align-items:flex-end;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px))}
 .modal{width:100%;max-height:min(86dvh,760px);border-radius:28px!important}
 .modal-head{min-height:60px;padding:14px 16px}.modal-body{padding:14px 14px 22px}.modal-foot{padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:1fr 1.25fr;gap:8px;min-height:68px}.modal-foot .btn{width:100%;min-width:0}
}
@media(max-height:700px) and (max-width:900px){.modal{max-height:82dvh}.modal-body{padding-bottom:18px}}
/* Reduce expensive paint operations while retaining Liquid Glass hierarchy. */
.card,.dashboard-equipment-row,.equipment-card-v40,.equipment-inventory-card,.rotation-block-v41,.rotation-center-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)}
body:before{filter:blur(6px);opacity:.72}
@media(prefers-reduced-transparency:reduce){body:before{display:none}.sidebar,.topbar,.mobile-bottom-nav,.modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}
</style>

<style id="v92-hero-contrast-fix">
/* v92 — correção de contraste do painel principal no modo claro.
   O fundo real é aplicado por applyDashboardHero(); esta regra apenas garante
   que o texto permaneça legível quando a paleta clara estiver ativa. */
#page-dashboard .hero{
  color:#fff!important;
  text-shadow:0 1px 2px rgba(20,14,35,.18);
}
#page-dashboard .hero-title{color:#fff!important;}
#page-dashboard .hero-text{color:rgba(255,255,255,.88)!important;}
#page-dashboard .device-datetime{color:rgba(255,255,255,.84)!important;}
#page-dashboard .hero-actions .btn{
  color:#fff!important;
  background:rgba(255,255,255,.12)!important;
  border-color:rgba(255,255,255,.20)!important;
}
html[data-theme="dark"] #page-dashboard .hero{
  text-shadow:0 1px 2px rgba(0,0,0,.32);
}
</style>
</head><body><h1>Evolução do paciente — ${esc(s.name)}</h1><div class="muted">Gerado em ${evo42Date(todayISO())} · ${esc(s.plan||'')}</div><h2>Resumo inicial</h2><div class="box"><b>Queixa:</b> ${esc(c.complaint||'—')}<br><b>Objetivo:</b> ${esc(c.objective||'—')}<br><b>Diagnóstico/condição informada:</b> ${esc(c.diagnosis||'—')}<br><b>Avaliação inicial:</b> ${evo42Date(c.baselineDate)}</div><h2>Indicadores</h2><div class="grid"><div class="box"><b>Dor inicial:</b> ${esc(String(c.painScore||'—'))}/10</div><div class="box"><b>Função inicial:</b> ${esc(String(c.functionalScore||'—'))}/10</div><div class="box"><b>Mobilidade inicial:</b> ${esc(String(c.mobilityScore||'—'))}/10</div><div class="box"><b>Força inicial:</b> ${esc(String(c.strengthScore||'—'))}/10</div></div><h2>Metas</h2>${goals.length?goals.map(g=>`<div class="box"><b>${esc(g.area)}:</b> ${esc(g.description)} — ${esc(String(g.current||'—'))} ${esc(g.unit)} / alvo ${esc(String(g.target||'—'))} ${esc(g.unit)}</div>`).join(''):'<div class="box">Nenhuma meta cadastrada.</div>'}<h2>Histórico</h2>${e.length?e.map(x=>`<div class="entry"><small>${evo42Date(x.date)} · ${esc(x.professional||'Profissional')}</small><br><b>${esc(x.title)}</b><br>${esc([x.assessment,x.intervention,x.response,x.progression,x.nextSteps].filter(Boolean).join('\n'))}</div>`).join(''):'<div class="box">Nenhum registro.</div>'}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);w.document.close();}
openClinicalProfile=openClinicalProfileV42;
ensureEvolutionV42();


/* ===== extracted script block ===== */

(function(){'use strict';const root=document.documentElement;root.classList.add('ios27-runtime');const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);if(isIOS)root.dataset.platform='ios';const setVH=()=>root.style.setProperty('--app-vh',Math.round(window.innerHeight)+'px');setVH();window.addEventListener('resize',setVH,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(setVH,250),{passive:true});if(window.visualViewport){const sync=()=>root.style.setProperty('--keyboard-offset',Math.max(0,window.innerHeight-window.visualViewport.height)+'px');window.visualViewport.addEventListener('resize',sync,{passive:true});sync();}if(window.navigator.standalone)root.classList.add('ios-standalone');})();


/* ===== extracted script block ===== */

/* V49 — evolução básica e objetiva; equipamentos permanecem exclusivamente no módulo de rodízio. */
function cleanEvolutionEntry(e,s){return{id:e.id||uid('evo'),studentId:s.id,date:e.date||todayISO(),title:String(e.title||'Evolução da sessão'),complaint:String(e.complaint||''),objective:String(e.objective||''),assessment:String(e.assessment||''),pain:String(e.pain||''),painBefore:e.painBefore??'',painAfter:e.painAfter??'',functionalScore:e.functionalScore??'',mobilityScore:e.mobilityScore??'',strengthScore:e.strengthScore??'',balanceScore:e.balanceScore??'',controlScore:e.controlScore??'',exercises:String(e.exercises||''),intervention:String(e.intervention||''),response:String(e.response||''),nextSteps:String(e.nextSteps||''),nextReview:e.nextReview||'',professional:String(e.professional||s.teacher||'')};}
function ensureEvolutionV49(){ensurePatientEvolutionData();db.students.forEach(s=>{const c=s.clinical||{};if(!Array.isArray(s.evolution))s.evolution=[];s.evolution=s.evolution.map(e=>cleanEvolutionEntry(e,s));s.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)));s.clinical=c;});}
function openEvolutionModalV49(studentId=null,entryId=null){ensureEvolutionV49();const s=studentById(studentId)||db.students[0];if(!s){toast('Cadastre um aluno primeiro.');return;}const old=(s.evolution||[]).find(e=>e.id===entryId)||{id:uid('evo'),date:todayISO(),title:'Evolução da sessão',complaint:'',objective:s.clinical?.objective||s.goal||'',assessment:'',painBefore:'',painAfter:'',functionalScore:'',mobilityScore:'',strengthScore:'',balanceScore:'',controlScore:'',exercises:'',intervention:'',response:'',nextSteps:s.clinical?.plan||'',nextReview:s.clinical?.nextReview||'',professional:s.teacher||''};
 const b=`<div class="evo49-modal"><div class="evo49-modal-section"><h4>Identificação</h4><div class="evo49-modal-grid"><div class="field"><label>Aluno</label><select id="v49EvStudent">${db.students.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Data</label><input id="v49EvDate" type="date" value="${esc(old.date||todayISO())}"></div><div class="field full"><label>Título</label><input id="v49EvTitle" value="${esc(old.title||'Evolução da sessão')}"></div><div class="field"><label>Queixa / relato</label><textarea id="v49EvComplaint">${esc(old.complaint||'')}</textarea></div><div class="field"><label>Objetivo</label><textarea id="v49EvObjective">${esc(old.objective||'')}</textarea></div></div></div>
 <div class="evo49-modal-section"><h4>Indicadores rápidos</h4><div class="evo49-modal-grid"><div class="field"><label>Dor antes (0–10)</label><input id="v49EvPainBefore" type="number" min="0" max="10" value="${esc(String(old.painBefore??''))}"></div><div class="field"><label>Dor depois (0–10)</label><input id="v49EvPainAfter" type="number" min="0" max="10" value="${esc(String(old.painAfter??''))}"></div><div class="field"><label>Função (0–10)</label><input id="v49EvFunc" type="number" min="0" max="10" value="${esc(String(old.functionalScore??''))}"></div><div class="field"><label>Mobilidade (0–10)</label><input id="v49EvMob" type="number" min="0" max="10" value="${esc(String(old.mobilityScore??''))}"></div><div class="field"><label>Força / resistência (0–10)</label><input id="v49EvStrength" type="number" min="0" max="10" value="${esc(String(old.strengthScore??''))}"></div><div class="field"><label>Equilíbrio (0–10)</label><input id="v49EvBalance" type="number" min="0" max="10" value="${esc(String(old.balanceScore??''))}"></div><div class="field"><label>Controle motor (0–10)</label><input id="v49EvControl" type="number" min="0" max="10" value="${esc(String(old.controlScore??''))}"></div></div></div>
 <div class="evo49-modal-section"><h4>Registro objetivo</h4><div class="field"><label>Avaliação / achados</label><textarea id="v49EvAssessment">${esc(old.assessment||'')}</textarea></div><div class="evo49-modal-grid"><div class="field"><label>Exercícios realizados</label><textarea id="v49EvExercises">${esc(old.exercises||'')}</textarea></div><div class="field"><label>Intervenção / ajustes</label><textarea id="v49EvIntervention">${esc(old.intervention||'')}</textarea></div><div class="field full"><label>Resposta / evolução observada</label><textarea id="v49EvResponse">${esc(old.response||'')}</textarea></div><div class="field full"><label>Plano para próxima sessão</label><textarea id="v49EvNext">${esc(old.nextSteps||'')}</textarea></div></div></div>
 <div class="evo49-modal-section"><h4>Continuidade</h4><div class="evo49-modal-grid"><div class="field"><label>Próxima revisão</label><input id="v49EvReview" type="date" value="${esc(old.nextReview||'')}"></div><div class="field"><label>Profissional</label><input id="v49EvProfessional" value="${esc(old.professional||s.teacher||'')}"></div></div></div></div>`;
 openModal(entryId?'Editar evolução':'Registrar evolução',b,()=>{const t=studentById(document.getElementById('v49EvStudent')?.value);if(!t)return false;if(!Array.isArray(t.evolution))t.evolution=[];const e=cleanEvolutionEntry({id:old.id,date:document.getElementById('v49EvDate').value||todayISO(),title:document.getElementById('v49EvTitle').value.trim()||'Evolução da sessão',complaint:document.getElementById('v49EvComplaint').value.trim(),objective:document.getElementById('v49EvObjective').value.trim(),assessment:document.getElementById('v49EvAssessment').value.trim(),pain:document.getElementById('v49EvPainAfter').value||document.getElementById('v49EvPainBefore').value||'',painBefore:document.getElementById('v49EvPainBefore').value,painAfter:document.getElementById('v49EvPainAfter').value,functionalScore:document.getElementById('v49EvFunc').value,mobilityScore:document.getElementById('v49EvMob').value,strengthScore:document.getElementById('v49EvStrength').value,balanceScore:document.getElementById('v49EvBalance').value,controlScore:document.getElementById('v49EvControl').value,exercises:document.getElementById('v49EvExercises').value.trim(),intervention:document.getElementById('v49EvIntervention').value.trim(),response:document.getElementById('v49EvResponse').value.trim(),nextSteps:document.getElementById('v49EvNext').value.trim(),nextReview:document.getElementById('v49EvReview').value,professional:document.getElementById('v49EvProfessional').value.trim()},t);const i=t.evolution.findIndex(x=>x.id===e.id);if(i>=0)t.evolution[i]=e;else t.evolution.push(e);t.evolution.sort((a,b)=>String(b.date).localeCompare(String(a.date)));if(e.nextReview){t.clinical=t.clinical||{};t.clinical.nextReview=e.nextReview;}saveDB();renderAll();toast('Evolução registrada com sucesso.');return true;});}
function renderEvolutionV49(){ensureEvolutionV49();const q=(document.getElementById('evolutionSearch')?.value||'').toLowerCase().trim(),sel=document.getElementById('evolutionStudentSelect');if(sel){const cur=sel.value;sel.innerHTML='<option value="">Todos os alunos</option>'+db.students.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR')).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');sel.value=cur;}const selected=sel?.value||'',list=db.students.filter(s=>(!selected||s.id===selected)&&(!q||String(s.name).toLowerCase().includes(q))),total=db.students.reduce((n,s)=>n+(s.evolution||[]).length,0),tracked=db.students.filter(s=>(s.evolution||[]).length).length,recent=db.students.reduce((n,s)=>n+(s.evolution||[]).filter(e=>e.date>=new Date(Date.now()-30*864e5).toISOString().slice(0,10)).length,0),k=document.getElementById('evolutionKpis');if(k){k.className='evo49-kpis';k.innerHTML=[['Alunos acompanhados',tracked],['Registros',total],['Últimos 30 dias',recent]].map(x=>`<div class="evo49-kpi"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');}const grid=document.getElementById('evolutionPatientGrid');if(!grid)return;if(!list.length){grid.innerHTML='<div class="evo49-empty">Nenhum aluno encontrado.</div>';return;}grid.innerHTML='<div class="evo49-shell">'+list.map(s=>{const entries=evolutionSummary(s),latest=entries[0],pain=latest?.painAfter!==''&&latest?.painAfter!=null?latest.painAfter:latest?.painBefore??'',func=latest?.functionalScore??'',mob=latest?.mobilityScore??'';return `<div class="evo49-patient"><div class="evo49-head"><div><h3>${esc(s.name)}</h3><div class="muted">${esc(s.plan||'Sem plano')} · ${esc(s.teacher||'Sem profissional')}</div></div><div class="evo49-actions"><button class="btn small primary" onclick="openEvolutionModalV49('${s.id}')">＋ Registrar evolução</button><button class="btn small" onclick="openClinicalProfileV42('${s.id}')">Ficha</button><button class="btn small" onclick="openEvolutionReport('${s.id}')">Relatório</button></div></div><div class="evo49-grid"><div class="evo49-card"><h4>Resumo atual</h4><div class="evo49-summary"><div class="evo49-stat"><div class="v">${esc(String(pain||'—'))}${pain!==''?' /10':''}</div><div class="k">Dor</div></div><div class="evo49-stat"><div class="v">${esc(String(func||'—'))}${func!==''?' /10':''}</div><div class="k">Função</div></div><div class="evo49-stat"><div class="v">${esc(String(mob||'—'))}${mob!==''?' /10':''}</div><div class="k">Mobilidade</div></div></div><div class="evo49-text" style="margin-top:9px"><b>Última observação:</b> ${esc(latest?.response||latest?.assessment||'Nenhuma evolução registrada.')}</div></div><div class="evo49-card"><h4>Próxima conduta</h4><div class="evo49-text">${esc(latest?.nextSteps||'Nenhum plano registrado.')}</div>${latest?.nextReview?`<div class="muted" style="margin-top:8px">Próxima revisão: ${evo42Date(latest.nextReview)}</div>`:''}</div></div><div class="evo49-card" style="margin-top:10px"><div class="evo42-section-title"><h4>Histórico</h4><span class="evo42-badge">${entries.length} registro(s)</span></div><div class="evo49-timeline">${entries.slice(0,5).map(e=>`<div class="evo49-entry"><div class="meta">${evo42Date(e.date)} · ${esc(e.professional||s.teacher||'Profissional')}</div><div class="title">${esc(e.title||'Evolução')}</div><div class="txt">${esc([e.assessment,e.response,e.nextSteps].filter(Boolean).join('\n'))||'Sem observações.'}</div><div class="evo49-actions" style="margin-top:7px;justify-content:flex-start"><button class="btn small" onclick="openEvolutionModalV49('${s.id}','${e.id}')">Editar</button></div></div>`).join('')||'<div class="evo49-empty">Nenhuma evolução registrada.</div>'}</div></div></div>`}).join('')+'</div>';}
openEvolutionModal=openEvolutionModalV49;renderEvolution=renderEvolutionV49;ensureEvolutionV49();


/* ===== extracted script block ===== */

(function(){
  const KEY='studio_pilates_apple27_ui_v1';
  const root=document.documentElement;
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function write(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
  function apply(){
    const p=read();
    const menu=Math.max(0,Math.min(100,Number(p.menuOpacity ?? 72)))/100;
    const bottom=Math.max(0,Math.min(100,Number(p.bottomNavOpacity ?? 72)))/100;
    root.style.setProperty('--menu-opacity',menu.toFixed(2));
    root.style.setProperty('--bottom-nav-opacity',bottom.toFixed(2));
    root.dataset.apple27='1';
  }
  function syncFromDB(){
    try{
      const i=(window.db&&db.settings&&db.settings.interface)||{};
      const p=read();
      if(i.menuOpacity!=null)p.menuOpacity=i.menuOpacity;
      if(i.bottomNavOpacity!=null)p.bottomNavOpacity=i.bottomNavOpacity;
      write(p);
    }catch(e){}
    apply();
  }
  window.apple27UI={apply,sync:syncFromDB};
  apply();
  document.addEventListener('DOMContentLoaded',function(){
    syncFromDB();
    // Harmoniza o estado salvo pelo sistema principal com o novo design.
    setTimeout(syncFromDB,120);
  });
})();
/* V84 — Navigation Isolation Fix System preferences: estado único, persistente e integrado. */
function getSystemPrefs(){
  const i=(db&&db.settings&&db.settings.interface)||{};
  const s=(db&&db.settings&&db.settings.system)||{};
  return {
    confirmDelete:s.confirmDelete!==false,
    animations:s.animations!==false,
    hapticVisual:s.hapticVisual!==false,
    showBadges:s.showBadges!==false,
    keyboardShortcuts:s.keyboardShortcuts!==false,
    menuPosition:['left','right','top'].includes(i.menuPosition)?i.menuPosition:'left'
  };
}
function applySystemPrefs(){
  const p=getSystemPrefs(), root=document.documentElement;
  root.dataset.systemAnimations=p.animations?'1':'0';
  root.dataset.hapticVisual=p.hapticVisual?'1':'0';
  root.dataset.showBadges=p.showBadges?'1':'0';
  root.dataset.keyboardShortcuts=p.keyboardShortcuts?'1':'0';
  root.dataset.menuPosition=p.menuPosition;
  root.style.setProperty('--motion-enabled',p.animations?'1':'0');
  const ids={confirmDelete:'sysConfirmDelete',animations:'sysAnimations',hapticVisual:'sysHapticVisual',showBadges:'sysShowBadges',keyboardShortcuts:'sysKeyboard'};
  Object.entries(ids).forEach(([k,id])=>{
    const e=document.getElementById(id);
    if(e){
      e.classList.toggle('on',!!p[k]);
      e.setAttribute('aria-checked',String(!!p[k]));
      e.title=!!p[k]?'Ativado':'Desativado';
    }
  });
  const mp=document.getElementById('sysMenuPosition');
  if(mp)mp.value=p.menuPosition;
  document.querySelectorAll('[data-sys-density]').forEach(b=>b.classList.toggle('active',b.dataset.sysDensity===(db.settings.interface?.density||'standard')));
  document.querySelectorAll('.nav-badge').forEach(e=>e.style.display=p.showBadges?'':'none');
}
function toggleSystemPref(key){
  const allowed=['confirmDelete','animations','hapticVisual','showBadges','keyboardShortcuts'];
  if(!allowed.includes(key))return;
  const current=getSystemPrefs();
  const next=!current[key];
  db.settings.system={...(db.settings.system||{}),[key]:next};
  saveDB();
  applySystemPrefs();
  if(key==='showBadges')updateMenuBadges();
  toast(`${key==='confirmDelete'?'Confirmação de exclusões':key==='animations'?'Animações do sistema':key==='hapticVisual'?'Resposta visual ao toque':key==='showBadges'?'Indicadores nos menus':'Atalhos de teclado'} ${next?'ativados':'desativados'}.`);
}
function setSystemMenuPosition(pos){
  if(!['left','right','top'].includes(pos))pos='left';
  db.settings.interface={...(db.settings.interface||{}),menuPosition:pos};
  saveDB();
  applyAdvancedInterfaceSettings();
  applySystemPrefs();
  toast(`Posição do menu: ${pos==='left'?'esquerda':pos==='right'?'direita':'superior'}.`);
}
const __oldApplyInterfacePreferences=applyInterfacePreferences;
applyInterfacePreferences=function(){__oldApplyInterfacePreferences();applySystemPrefs();};
const __oldGoSettings=goSettings;
goSettings=function(sec){__oldGoSettings(sec);applySystemPrefs();};
applySystemPrefs();
/* Confirmações destrutivas seguem uma única política global. */
if(typeof window.iosConfirm==='function' && !window.__apple27ConfirmWrapped){
  const __nativeIosConfirm=window.iosConfirm;
  window.iosConfirm=function(message, options={}){
    const p=getSystemPrefs();
    if(options.danger!==false && p.confirmDelete===false) return Promise.resolve(true);
    return __nativeIosConfirm(message, options);
  };
  window.__apple27ConfirmWrapped=true;
}
/* Atalhos globais opcionais. */
document.addEventListener('keydown',e=>{
  if(!getSystemPrefs().keyboardShortcuts)return;
  const mod=e.ctrlKey||e.metaKey;
  if(mod && e.key.toLowerCase()==='k'){e.preventDefault();focusGlobalSearch();}
  if(e.key==='Escape') closeTransientUI();
});


/* ===== extracted script block ===== */

(function(){
  function setupDashboardGlance(){
    const page=document.getElementById('page-dashboard');
    if(!page || page.dataset.glanceReady==='1') return;
    const kpis=page.querySelector('.grid.grid-4');
    if(!kpis) return;
    const grids=Array.from(page.querySelectorAll('.grid.grid-2.section'));
    const chartGrid=grids[0];
    const finalGrid=grids[1];
    const occupancy=Array.from(page.querySelectorAll('.card.panel.section')).find(el=>el.querySelector('#dashboardOccupancyChart'));
    if(!chartGrid && !occupancy && !finalGrid) return;
    const details=document.createElement('details');
    details.className='dashboard-details';
    const summary=document.createElement('summary');
    summary.innerHTML='<span>Ver análises detalhadas</span><span class="details-sub">Gráficos · ocupação · pendências</span>';
    const body=document.createElement('div');
    body.className='dashboard-details-body';
    if(chartGrid) body.appendChild(chartGrid);
    if(occupancy) body.appendChild(occupancy);
    if(finalGrid) body.appendChild(finalGrid);
    details.appendChild(summary);details.appendChild(body);
    kpis.insertAdjacentElement('afterend',details);
    page.dataset.glanceReady='1';
    details.addEventListener('toggle',function(){
      if(details.open && typeof window.renderCharts==='function'){
        requestAnimationFrame(()=>{try{window.renderCharts()}catch(e){}});
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(setupDashboardGlance,80));
  else setTimeout(setupDashboardGlance,80);
  const oldGoPage=window.goPage;
  if(typeof oldGoPage==='function' && !window.__glanceGoWrapped){
    window.goPage=function(page){const r=oldGoPage.apply(this,arguments);if(page==='dashboard')setTimeout(setupDashboardGlance,50);return r;};
    window.__glanceGoWrapped=true;
  }
})();
