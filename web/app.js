
(() => {
  const STORAGE_KEY = "farmandeh-runtime-v0.4";
  const DEFAULT = {
    version: "0.4",
    workspace: { name: "فرمانده", subtitle: "پلتفرم شخصی‌سازی‌پذیر" },
    theme: { mode: "dark", accent: "#7c3aed", radius: 18, density: "comfortable" },
    modules: [
      {id:"repairs",title:"تعمیرات",emoji:"🛠️",description:"پذیرش، عیب‌یابی، تعمیر، تحویل و سوابق",visible:true},
      {id:"customers",title:"مشتریان",emoji:"👥",description:"پروفایل مشتری، دستگاه‌ها و تاریخچه",visible:true},
      {id:"inventory",title:"انبار قطعات",emoji:"📦",description:"قطعات، موجودی و تامین‌کننده",visible:true},
      {id:"tasks",title:"کارها و برنامه",emoji:"✅",description:"وظایف، تایمر و گزارش روزانه",visible:true},
      {id:"forum",title:"انجمن",emoji:"💬",description:"موضوعات، گفتگوها و دانش جمعی",visible:true},
      {id:"sales",title:"فروش",emoji:"🛒",description:"محصولات، مقایسه و سفارش‌ها",visible:true}
    ],
    repairs: []
  };

  let state = loadState();
  let route = "home";
  let routeArg = null;
  let toastTimer;

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function uid(){ return "r_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,8); }
  function nowIso(){ return new Date().toISOString(); }
  function formatMoney(v){ return Number(v||0).toLocaleString("fa-IR"); }

  function loadState(){
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved) {
        const p = JSON.parse(saved);
        return {
          ...clone(DEFAULT),
          ...p,
          workspace:{...clone(DEFAULT.workspace),...(p.workspace||{})},
          theme:{...clone(DEFAULT.theme),...(p.theme||{})},
          modules:Array.isArray(p.modules)&&p.modules.length?p.modules:clone(DEFAULT.modules),
          repairs:Array.isArray(p.repairs)?p.repairs:[]
        };
      }
      const old = localStorage.getItem("farmandeh-runtime-v0.3");
      if(old){
        const p = JSON.parse(old);
        return {
          ...clone(DEFAULT),
          ...p,
          version:"0.4",
          repairs:[]
        };
      }
    }catch(e){}
    return clone(DEFAULT);
  }

  function saveState(msg="ذخیره شد"){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if(msg) toast(msg);
  }

  function toast(msg){
    document.querySelector(".toast")?.remove();
    clearTimeout(toastTimer);
    const el=document.createElement("div");
    el.className="toast";
    el.textContent=msg;
    document.body.appendChild(el);
    toastTimer=setTimeout(()=>el.remove(),1800);
  }

  function applyTheme(){
    document.documentElement.dataset.theme = state.theme.mode;
    document.documentElement.style.setProperty("--accent", state.theme.accent);
    document.documentElement.style.setProperty("--radius", `${state.theme.radius}px`);
    document.documentElement.style.setProperty("--gap", state.theme.density==="compact"?"9px":"14px");
  }

  function navigate(next,arg=null){
    route=next; routeArg=arg; render(); window.scrollTo({top:0,behavior:"smooth"});
  }

  function topbar(title){
    return `<header class="topbar">
      ${route!=="home"?`<button class="icon-btn" data-action="back">→</button>`:""}
      <div class="brand"><div class="logo">F</div><div><div class="brand-title">${esc(title||state.workspace.name)}</div><div class="brand-sub">${esc(state.workspace.subtitle)}</div></div></div>
      <button class="icon-btn" data-action="toggle-theme">${state.theme.mode==="dark"?"☀️":"🌙"}</button>
    </header>`;
  }

  function bottomNav(){
    return `<nav class="bottom-nav">
      <button class="nav-btn ${route==="home"?"active":""}" data-route="home">🏠<br><small>خانه</small></button>
      <button class="nav-btn ${route==="activity"?"active":""}" data-route="activity">📊<br><small>فعالیت</small></button>
      <button class="nav-btn ${route==="studio"?"active":""}" data-route="studio">🎛️<br><small>استودیو</small></button>
    </nav>`;
  }

  function repairStats(){
    const open = state.repairs.filter(r=>!["delivered","cancelled"].includes(r.status)).length;
    const ready = state.repairs.filter(r=>r.status==="ready").length;
    const returned = state.repairs.filter(r=>r.isReturn).length;
    return {open,ready,returned,total:state.repairs.length};
  }

  function home(){
    const s=repairStats();
    const modules=state.modules.filter(m=>m.visible!==false);
    return `${topbar()}
      <main class="page">
        <section class="hero">
          <div class="badge">Runtime v0.4 • Real Repairs Core</div>
          <h1>${esc(state.workspace.name)}</h1>
          <p>اولین ماژول واقعی فرمانده فعال است: تعمیرات با ثبت، ویرایش، جستجو، تایمر و ذخیره دائمی.</p>
          <div class="stats">
            <div class="stat"><b>${s.open}</b><span>تعمیر باز</span></div>
            <div class="stat"><b>${s.ready}</b><span>آماده تحویل</span></div>
            <div class="stat"><b>${s.returned}</b><span>برگشتی</span></div>
          </div>
        </section>

        <div class="section-head"><div><h2>Command Center</h2><small>ماژول‌ها</small></div><button class="ghost-btn" data-route="studio">ویرایش</button></div>
        <section class="grid">
          ${modules.map(m=>`<article class="card clickable" data-module="${esc(m.id)}">
            <div class="emoji">${esc(m.emoji)}</div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p>
            <div class="card-footer"><span class="badge">${m.id==="repairs"?`${s.total} پرونده`:"ماژول"}</span><span>←</span></div>
          </article>`).join("")}
        </section>
      </main>${bottomNav()}`;
  }

  function statusLabel(s){
    return ({
      intake:"پذیرش",
      diagnosing:"عیب‌یابی",
      repairing:"در حال تعمیر",
      waiting_part:"منتظر قطعه",
      ready:"آماده تحویل",
      delivered:"تحویل شده",
      cancelled:"لغو شده"
    })[s] || s;
  }

  function repairList(){
    const q = (document.getElementById("repairSearch")?.value||"").trim().toLowerCase();
    return state.repairs.filter(r=>{
      if(!q) return true;
      return [r.repairNo,r.customerName,r.customerPhone,r.vehicle,r.device,r.fault,r.technician,statusLabel(r.status)]
        .some(v=>String(v||"").toLowerCase().includes(q));
    });
  }

  function repairsPage(){
    const s=repairStats();
    return `${topbar("تعمیرات")}
      <main class="page">
        <section class="hero">
          <div class="badge">Real Repairs Core</div>
          <h1>مدیریت تعمیرات</h1>
          <p>پرونده واقعی بساز، ویرایش کن، جستجو کن و زمان تعمیر را ثبت کن.</p>
          <div class="stats">
            <div class="stat"><b>${s.total}</b><span>کل پرونده</span></div>
            <div class="stat"><b>${s.open}</b><span>باز</span></div>
            <div class="stat"><b>${s.ready}</b><span>آماده</span></div>
          </div>
        </section>

        <div class="section-head">
          <div><h2>پرونده‌ها</h2><small>ذخیره روی همین دستگاه</small></div>
          <button class="primary-btn" data-action="new-repair">+ پذیرش</button>
        </div>

        <section class="panel">
          <div class="field" style="margin-bottom:12px"><label>جستجوی سریع</label><input id="repairSearch" placeholder="شماره، مشتری، خودرو، دستگاه، عیب..." autocomplete="off"></div>
          <div id="repairList" class="list">${renderRepairRows(state.repairs)}</div>
        </section>
      </main>${bottomNav()}`;
  }

  function renderRepairRows(items){
    if(!items.length) return `<div class="empty">هنوز پرونده‌ای ثبت نشده است.</div>`;
    return items.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).map(r=>{
      const elapsed = getElapsedSeconds(r);
      return `<div class="row clickable" data-repair-id="${r.id}">
        <div class="row-main">
          <div class="row-title">${esc(r.repairNo||"بدون شماره")} • ${esc(r.device||"دستگاه")}</div>
          <div class="row-sub">${esc(r.customerName||"بدون مشتری")} • ${esc(r.vehicle||"بدون خودرو")} • ${statusLabel(r.status)}</div>
          <div class="row-sub">${elapsed?`⏱ ${formatDuration(elapsed)}`:""} ${r.isReturn?"• 🔁 برگشتی":""}</div>
        </div>
        <span>‹</span>
      </div>`;
    }).join("");
  }

  function repairForm(repair=null){
    const r = repair || {
      id:"",
      repairNo:"",
      customerName:"",
      customerPhone:"",
      vehicle:"",
      device:"",
      fault:"",
      diagnosis:"",
      technician:"",
      status:"intake",
      partsUsed:"",
      cost:0,
      paid:0,
      isReturn:false,
      notes:""
    };
    return `${topbar(repair?"ویرایش تعمیر":"پذیرش تعمیر")}
      <main class="page">
        <section class="panel">
          <div class="section-head" style="margin-top:0"><div><h2>${repair?"ویرایش پرونده":"پذیرش جدید"}</h2><small>تمام فیلدها قابل ویرایش‌اند</small></div></div>
          <div class="form-grid">
            ${field("repairNo","شماره تعمیر",r.repairNo)}
            ${field("customerName","نام مشتری",r.customerName)}
            ${field("customerPhone","تلفن",r.customerPhone,"tel")}
            ${field("vehicle","خودرو",r.vehicle)}
            ${field("device","دستگاه / مدل",r.device)}
            ${field("technician","تکنسین",r.technician)}
            <div class="field"><label>وضعیت</label><select id="status">
              ${["intake","diagnosing","repairing","waiting_part","ready","delivered","cancelled"].map(s=>`<option value="${s}" ${r.status===s?"selected":""}>${statusLabel(s)}</option>`).join("")}
            </select></div>
            ${field("cost","هزینه کل",r.cost,"number")}
            ${field("paid","پرداخت شده",r.paid,"number")}
          </div>
          <div class="field" style="margin-top:12px"><label>شرح عیب</label><textarea id="fault" rows="4">${esc(r.fault)}</textarea></div>
          <div class="field" style="margin-top:12px"><label>تشخیص فنی</label><textarea id="diagnosis" rows="4">${esc(r.diagnosis)}</textarea></div>
          <div class="field" style="margin-top:12px"><label>قطعات مصرفی</label><textarea id="partsUsed" rows="3">${esc(r.partsUsed)}</textarea></div>
          <div class="field" style="margin-top:12px"><label>یادداشت</label><textarea id="notes" rows="3">${esc(r.notes)}</textarea></div>
          <label class="switch" style="margin-top:14px"><input type="checkbox" id="isReturn" ${r.isReturn?"checked":""}> پرونده برگشتی / تکرار تعمیر</label>

          <div class="toolbar" style="margin-top:18px">
            <button class="primary-btn" data-action="save-repair" data-id="${esc(r.id)}">ذخیره پرونده</button>
            ${repair?`<button class="danger-btn" data-action="delete-repair" data-id="${esc(r.id)}">حذف</button>`:""}
          </div>
        </section>
      </main>${bottomNav()}`;
  }

  function field(id,label,value,type="text"){
    return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`;
  }

  function getElapsedSeconds(r){
    let sec = Number(r.elapsedSeconds||0);
    if(r.timerRunning && r.timerStartedAt){
      sec += Math.max(0, Math.floor((Date.now()-new Date(r.timerStartedAt).getTime())/1000));
    }
    return sec;
  }

  function formatDuration(sec){
    sec=Math.floor(sec||0);
    const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60;
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  }

  function repairDetail(r){
    const elapsed=getElapsedSeconds(r);
    return `${topbar(`تعمیر ${r.repairNo||""}`)}
      <main class="page">
        <section class="hero">
          <div class="badge">${statusLabel(r.status)}</div>
          <h1>${esc(r.device||"دستگاه")}</h1>
          <p>${esc(r.customerName||"بدون نام")} • ${esc(r.vehicle||"بدون خودرو")}</p>
          <div class="stats">
            <div class="stat"><b>${formatDuration(elapsed)}</b><span>زمان تعمیر</span></div>
            <div class="stat"><b>${formatMoney(r.cost)}</b><span>هزینه</span></div>
            <div class="stat"><b>${formatMoney((r.cost||0)-(r.paid||0))}</b><span>مانده</span></div>
          </div>
        </section>

        <div class="section-head"><h2>عملیات</h2></div>
        <section class="toolbar">
          <button class="primary-btn" data-action="${r.timerRunning?"pause-timer":"start-timer"}" data-id="${r.id}">${r.timerRunning?"⏸ توقف تایمر":"▶ شروع تایمر"}</button>
          <button class="ghost-btn" data-action="edit-repair" data-id="${r.id}">✏️ ویرایش</button>
          <button class="ghost-btn" data-action="mark-ready" data-id="${r.id}">✅ آماده تحویل</button>
        </section>

        <div class="section-head"><h2>اطلاعات پرونده</h2></div>
        <section class="list">
          ${detailRow("مشتری",r.customerName)}
          ${detailRow("تلفن",r.customerPhone)}
          ${detailRow("خودرو",r.vehicle)}
          ${detailRow("دستگاه",r.device)}
          ${detailRow("تکنسین",r.technician)}
          ${detailRow("شرح عیب",r.fault)}
          ${detailRow("تشخیص",r.diagnosis)}
          ${detailRow("قطعات مصرفی",r.partsUsed)}
          ${detailRow("وضعیت",statusLabel(r.status))}
          ${detailRow("برگشتی",r.isReturn?"بله":"خیر")}
          ${detailRow("یادداشت",r.notes)}
        </section>
      </main>${bottomNav()}`;
  }

  function detailRow(k,v){ return `<div class="row"><div class="row-main"><div class="row-title">${k}</div><div class="row-sub">${esc(v||"—")}</div></div></div>`; }

  function activity(){
    const s=repairStats();
    return `${topbar("فعالیت")}
      <main class="page">
        <section class="hero"><h1>مرکز فعالیت</h1><p>آمار واقعی تعمیرات از داده‌های ثبت‌شده.</p></section>
        <div class="section-head"><h2>Repair KPIs</h2></div>
        <section class="grid">
          <div class="card"><div class="emoji">🛠️</div><h3>${s.total}</h3><p>کل پرونده‌های تعمیر</p></div>
          <div class="card"><div class="emoji">⏳</div><h3>${s.open}</h3><p>تعمیرات باز</p></div>
          <div class="card"><div class="emoji">✅</div><h3>${s.ready}</h3><p>آماده تحویل</p></div>
          <div class="card"><div class="emoji">🔁</div><h3>${s.returned}</h3><p>برگشتی‌ها</p></div>
        </section>
      </main>${bottomNav()}`;
  }

  function studio(){
    return `${topbar("Farmandeh Studio")}
      <main class="page">
        <section class="hero"><div class="badge">No-code customization</div><h1>استودیو فرمانده</h1><p>تنظیمات ظاهر و ماژول‌ها بدون ویرایش کد.</p></section>
        <div class="section-head"><h2>هویت Workspace</h2></div>
        <section class="panel form-grid">
          ${field("workspaceName","نام",state.workspace.name)}
          ${field("workspaceSubtitle","زیرعنوان",state.workspace.subtitle)}
        </section>
        <div class="section-head"><h2>ظاهر</h2></div>
        <section class="panel form-grid">
          <div class="field"><label>حالت</label><select id="themeMode"><option value="dark" ${state.theme.mode==="dark"?"selected":""}>تیره</option><option value="light" ${state.theme.mode==="light"?"selected":""}>روشن</option></select></div>
          <div class="field"><label>Accent</label><input id="accent" type="color" value="${state.theme.accent}"></div>
          <div class="field"><label>گردی کارت‌ها</label><input id="radius" type="range" min="4" max="32" value="${state.theme.radius}"></div>
          <div class="field"><label>تراکم</label><select id="density"><option value="comfortable" ${state.theme.density==="comfortable"?"selected":""}>راحت</option><option value="compact" ${state.theme.density==="compact"?"selected":""}>فشرده</option></select></div>
        </section>
        <div class="section-head"><h2>ماژول‌ها</h2></div>
        <section class="panel module-editor">
          ${state.modules.map((m,i)=>`<div class="editor-row" data-editor-id="${m.id}">
            <input class="module-visible" type="checkbox" ${m.visible!==false?"checked":""}>
            <div><input class="module-title" value="${esc(m.title)}" style="width:100%;padding:9px;border-radius:9px;border:1px solid var(--border);background:var(--surface);color:var(--text)"><div class="row-sub">${esc(m.emoji)} ${esc(m.id)}</div></div>
            <div class="editor-actions"><button class="mini" data-move="up" data-id="${m.id}" ${i===0?"disabled":""}>↑</button><button class="mini" data-move="down" data-id="${m.id}" ${i===state.modules.length-1?"disabled":""}>↓</button></div>
          </div>`).join("")}
        </section>
        <div class="toolbar" style="margin-top:18px"><button class="primary-btn" data-action="save-studio">ذخیره تغییرات</button><button class="ghost-btn" data-action="export">خروجی JSON</button></div>
      </main>${bottomNav()}`;
  }

  function genericModule(id){
    const m=state.modules.find(x=>x.id===id);
    return `${topbar(`${m?.emoji||"◼"} ${m?.title||id}`)}
      <main class="page"><section class="hero"><h1>${esc(m?.title||id)}</h1><p>این ماژول در v0.4 هنوز روی Runtime عمومی اجرا می‌شود. Repairs اولین Core واقعی است.</p></section></main>${bottomNav()}`;
  }

  function render(){
    applyTheme();
    let html;
    if(route==="home") html=home();
    else if(route==="repairs") html=repairsPage();
    else if(route==="repair-new") html=repairForm();
    else if(route==="repair-edit") html=repairForm(state.repairs.find(r=>r.id===routeArg));
    else if(route==="repair-detail") {
      const r=state.repairs.find(x=>x.id===routeArg);
      html=r?repairDetail(r):repairsPage();
    }
    else if(route==="activity") html=activity();
    else if(route==="studio") html=studio();
    else if(route.startsWith("module:")) html=genericModule(route.split(":")[1]);
    else html=home();
    document.getElementById("app").innerHTML=`<div class="shell">${html}</div>`;
  }

  function collectRepair(id){
    const old=state.repairs.find(r=>r.id===id);
    return {
      ...(old||{}),
      id: old?.id || uid(),
      repairNo: document.getElementById("repairNo").value.trim(),
      customerName: document.getElementById("customerName").value.trim(),
      customerPhone: document.getElementById("customerPhone").value.trim(),
      vehicle: document.getElementById("vehicle").value.trim(),
      device: document.getElementById("device").value.trim(),
      technician: document.getElementById("technician").value.trim(),
      status: document.getElementById("status").value,
      cost: Number(document.getElementById("cost").value||0),
      paid: Number(document.getElementById("paid").value||0),
      fault: document.getElementById("fault").value.trim(),
      diagnosis: document.getElementById("diagnosis").value.trim(),
      partsUsed: document.getElementById("partsUsed").value.trim(),
      notes: document.getElementById("notes").value.trim(),
      isReturn: document.getElementById("isReturn").checked,
      createdAt: old?.createdAt || nowIso(),
      updatedAt: nowIso(),
      elapsedSeconds: Number(old?.elapsedSeconds||0),
      timerRunning: Boolean(old?.timerRunning),
      timerStartedAt: old?.timerStartedAt || null
    };
  }

  document.addEventListener("click", e=>{
    const routeEl=e.target.closest("[data-route]");
    if(routeEl){ navigate(routeEl.dataset.route); return; }

    const moduleEl=e.target.closest("[data-module]");
    if(moduleEl){
      const id=moduleEl.dataset.module;
      navigate(id==="repairs"?"repairs":`module:${id}`);
      return;
    }

    const repairEl=e.target.closest("[data-repair-id]");
    if(repairEl){ navigate("repair-detail",repairEl.dataset.repairId); return; }

    const moveEl=e.target.closest("[data-move]");
    if(moveEl){
      const idx=state.modules.findIndex(x=>x.id===moveEl.dataset.id);
      const next=moveEl.dataset.move==="up"?idx-1:idx+1;
      if(idx>=0&&next>=0&&next<state.modules.length){
        [state.modules[idx],state.modules[next]]=[state.modules[next],state.modules[idx]];
        saveState(""); render();
      }
      return;
    }

    const a=e.target.closest("[data-action]");
    if(!a) return;
    const action=a.dataset.action;
    const id=a.dataset.id;

    if(action==="back"){
      if(route==="repair-detail"||route==="repair-new"||route==="repair-edit") navigate("repairs");
      else navigate("home");
    }
    if(action==="toggle-theme"){
      state.theme.mode=state.theme.mode==="dark"?"light":"dark"; saveState(""); render();
    }
    if(action==="new-repair") navigate("repair-new");
    if(action==="edit-repair") navigate("repair-edit",id);
    if(action==="save-repair"){
      const r=collectRepair(id);
      const idx=state.repairs.findIndex(x=>x.id===r.id);
      if(idx>=0) state.repairs[idx]=r; else state.repairs.push(r);
      saveState("پرونده ذخیره شد");
      navigate("repair-detail",r.id);
    }
    if(action==="delete-repair"){
      if(confirm("این پرونده حذف شود؟")){
        state.repairs=state.repairs.filter(r=>r.id!==id);
        saveState("پرونده حذف شد"); navigate("repairs");
      }
    }
    if(action==="start-timer"){
      const r=state.repairs.find(x=>x.id===id);
      if(r&&!r.timerRunning){ r.timerRunning=true; r.timerStartedAt=nowIso(); r.updatedAt=nowIso(); saveState(""); render(); }
    }
    if(action==="pause-timer"){
      const r=state.repairs.find(x=>x.id===id);
      if(r&&r.timerRunning){
        r.elapsedSeconds=getElapsedSeconds(r);
        r.timerRunning=false; r.timerStartedAt=null; r.updatedAt=nowIso(); saveState(""); render();
      }
    }
    if(action==="mark-ready"){
      const r=state.repairs.find(x=>x.id===id);
      if(r){ r.status="ready"; r.updatedAt=nowIso(); saveState("آماده تحویل شد"); render(); }
    }
    if(action==="save-studio"){
      state.workspace.name=document.getElementById("workspaceName").value.trim()||DEFAULT.workspace.name;
      state.workspace.subtitle=document.getElementById("workspaceSubtitle").value.trim()||DEFAULT.workspace.subtitle;
      state.theme.mode=document.getElementById("themeMode").value;
      state.theme.accent=document.getElementById("accent").value;
      state.theme.radius=Number(document.getElementById("radius").value);
      state.theme.density=document.getElementById("density").value;
      document.querySelectorAll("[data-editor-id]").forEach(row=>{
        const m=state.modules.find(x=>x.id===row.dataset.editorId);
        if(m){ m.title=row.querySelector(".module-title").value.trim()||m.title; m.visible=row.querySelector(".module-visible").checked; }
      });
      saveState("تغییرات Studio ذخیره شد"); render();
    }
    if(action==="export"){
      const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob); const link=document.createElement("a");
      link.href=url; link.download="farmandeh-v0.4-data.json"; link.click(); URL.revokeObjectURL(url);
    }
  });

  document.addEventListener("input", e=>{
    if(e.target.id==="repairSearch"){
      document.getElementById("repairList").innerHTML=renderRepairRows(repairList());
    }
    if(e.target.id==="accent") document.documentElement.style.setProperty("--accent",e.target.value);
    if(e.target.id==="radius") document.documentElement.style.setProperty("--radius",`${e.target.value}px`);
  });

  history.replaceState({farmandeh:true},"");
  window.addEventListener("popstate",()=>{
    if(route!=="home"){ route="home"; routeArg=null; render(); history.pushState({farmandeh:true},""); }
  });

  render();
})();
