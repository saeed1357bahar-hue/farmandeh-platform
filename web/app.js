
(() => {
  const DEFAULT = {"version": "0.3", "workspace": {"name": "فرمانده", "subtitle": "پلتفرم شخصی‌سازی‌پذیر"}, "theme": {"mode": "dark", "accent": "#7c3aed", "radius": 18, "density": "comfortable"}, "modules": [{"id": "repairs", "title": "تعمیرات", "emoji": "🛠️", "description": "پذیرش، عیب‌یابی، تعمیر، خروج و سوابق", "visible": true}, {"id": "customers", "title": "مشتریان", "emoji": "👥", "description": "پروفایل مشتری، دستگاه‌ها و تاریخچه ارتباط", "visible": true}, {"id": "inventory", "title": "انبار قطعات", "emoji": "📦", "description": "قطعات، موجودی، تامین‌کننده و قیمت", "visible": true}, {"id": "tasks", "title": "کارها و برنامه", "emoji": "✅", "description": "وظایف، تایمر، اولویت و گزارش روزانه", "visible": true}, {"id": "forum", "title": "انجمن", "emoji": "💬", "description": "موضوعات، گفتگوها و دانش جمعی", "visible": true}, {"id": "sales", "title": "فروش", "emoji": "🛒", "description": "محصولات، مقایسه و سفارش‌ها", "visible": true}]};
  const STORAGE_KEY = "farmandeh-runtime-v0.3";
  const state = loadState();
  let route = "home";
  let toastTimer;

  function clone(v){ return JSON.parse(JSON.stringify(v)); }

  function loadState(){
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(!saved) return clone(DEFAULT);
      const parsed = JSON.parse(saved);
      return {
        ...clone(DEFAULT),
        ...parsed,
        workspace:{...clone(DEFAULT.workspace),...(parsed.workspace||{})},
        theme:{...clone(DEFAULT.theme),...(parsed.theme||{})},
        modules:Array.isArray(parsed.modules) && parsed.modules.length ? parsed.modules : clone(DEFAULT.modules)
      };
    }catch(e){ return clone(DEFAULT); }
  }

  function saveState(message="ذخیره شد"){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyTheme();
    if(message) toast(message);
  }

  function applyTheme(){
    document.documentElement.dataset.theme = state.theme.mode;
    document.documentElement.style.setProperty("--accent", state.theme.accent);
    document.documentElement.style.setProperty("--radius", `${state.theme.radius}px`);
    document.documentElement.style.setProperty("--gap", state.theme.density === "compact" ? "9px" : "14px");
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute("content", state.theme.mode === "dark" ? "#0b1020" : "#f3f6fb");
  }

  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function toast(msg){
    const old = document.querySelector(".toast");
    if(old) old.remove();
    clearTimeout(toastTimer);
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    toastTimer = setTimeout(()=>el.remove(),1800);
  }

  function navigate(next){
    route = next;
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function visibleModules(){ return state.modules.filter(m => m.visible !== false); }

  function topbar(title){
    return `
      <header class="topbar">
        ${route !== "home" ? `<button class="icon-btn" data-action="back" aria-label="بازگشت">→</button>` : ""}
        <div class="brand">
          <div class="logo">F</div>
          <div>
            <div class="brand-title">${esc(title || state.workspace.name)}</div>
            <div class="brand-sub">${esc(state.workspace.subtitle)}</div>
          </div>
        </div>
        <button class="icon-btn" data-action="toggle-theme" title="تغییر تم">${state.theme.mode === "dark" ? "☀️" : "🌙"}</button>
      </header>`;
  }

  function bottomNav(){
    return `
      <nav class="bottom-nav">
        <button class="nav-btn ${route==="home"?"active":""}" data-route="home">🏠<br><small>خانه</small></button>
        <button class="nav-btn ${route==="activity"?"active":""}" data-route="activity">📊<br><small>فعالیت</small></button>
        <button class="nav-btn ${route==="studio"?"active":""}" data-route="studio">🎛️<br><small>استودیو</small></button>
      </nav>`;
  }

  function home(){
    const modules = visibleModules();
    return `
      ${topbar()}
      <main class="page">
        <section class="hero">
          <div class="badge">Runtime v0.3 • Local-first</div>
          <h1>${esc(state.workspace.name)}</h1>
          <p>${esc(state.workspace.subtitle)} — این نسخه واقعاً قابل کلیک، قابل ویرایش و دارای ذخیره محلی است.</p>
          <div class="stats">
            <div class="stat"><b>${modules.length}</b><span>ماژول فعال</span></div>
            <div class="stat"><b>${state.modules.length}</b><span>ماژول کل</span></div>
            <div class="stat"><b>v0.3</b><span>Runtime</span></div>
          </div>
        </section>

        <div class="section-head">
          <div><h2>Command Center</h2><small>ماژول‌ها از Studio قابل تغییرند</small></div>
          <button class="ghost-btn" data-route="studio">ویرایش</button>
        </div>

        <section class="grid">
          ${modules.map((m,i)=>`
            <article class="card clickable" data-module="${esc(m.id)}">
              <div class="emoji">${esc(m.emoji)}</div>
              <h3>${esc(m.title)}</h3>
              <p>${esc(m.description)}</p>
              <div class="card-footer"><span class="badge">ماژول ${i+1}</span><span>←</span></div>
            </article>`).join("")}
        </section>
      </main>
      ${bottomNav()}`;
  }

  function modulePage(id){
    const m = state.modules.find(x=>x.id===id);
    if(!m) return home();
    const demoRows = [
      ["نمونه رکورد ۱","وضعیت: فعال"],
      ["نمونه رکورد ۲","قابل جایگزینی با داده واقعی"],
      ["افزودن رکورد جدید","در نسخه Data Engine متصل می‌شود"]
    ];
    return `
      ${topbar(`${m.emoji} ${m.title}`)}
      <main class="page">
        <section class="panel">
          <div class="section-head" style="margin-top:0">
            <div><h2>${esc(m.title)}</h2><small>${esc(m.description)}</small></div>
            <button class="primary-btn" data-action="demo-add">+ افزودن</button>
          </div>
          <div class="list">
            ${demoRows.map(r=>`<div class="row"><div class="row-main"><div class="row-title">${r[0]}</div><div class="row-sub">${r[1]}</div></div><span>›</span></div>`).join("")}
          </div>
        </section>
      </main>
      ${bottomNav()}`;
  }

  function activity(){
    return `
      ${topbar("فعالیت")}
      <main class="page">
        <section class="hero">
          <h1>مرکز فعالیت</h1>
          <p>این صفحه اسکلت واقعی Dashboard است و بعداً به Data Engine و گزارش‌ها وصل می‌شود.</p>
        </section>
        <div class="section-head"><h2>وضعیت Runtime</h2></div>
        <section class="grid">
          <div class="card"><div class="emoji">💾</div><h3>ذخیره محلی</h3><p>تنظیمات Studio در localStorage ذخیره می‌شود.</p><span class="badge">فعال</span></div>
          <div class="card"><div class="emoji">🧭</div><h3>Navigation</h3><p>Back داخلی و برگشت به Command Center پیاده شده است.</p><span class="badge">فعال</span></div>
          <div class="card"><div class="emoji">🎨</div><h3>Theme Engine</h3><p>تم، رنگ Accent، Radius و Density قابل تغییر است.</p><span class="badge">فعال</span></div>
        </section>
      </main>
      ${bottomNav()}`;
  }

  function studio(){
    return `
      ${topbar("Farmandeh Studio")}
      <main class="page">
        <section class="hero">
          <div class="badge">No-code customization</div>
          <h1>استودیو فرمانده</h1>
          <p>تنظیمات این صفحه بدون ویرایش کد روی Runtime اعمال و در دستگاه ذخیره می‌شوند.</p>
        </section>

        <div class="section-head"><h2>هویت Workspace</h2></div>
        <section class="panel form-grid">
          <div class="field"><label>نام</label><input id="workspaceName" value="${esc(state.workspace.name)}"></div>
          <div class="field"><label>زیرعنوان</label><input id="workspaceSubtitle" value="${esc(state.workspace.subtitle)}"></div>
        </section>

        <div class="section-head"><h2>ظاهر</h2></div>
        <section class="panel form-grid">
          <div class="field"><label>حالت</label>
            <select id="themeMode">
              <option value="dark" ${state.theme.mode==="dark"?"selected":""}>تیره</option>
              <option value="light" ${state.theme.mode==="light"?"selected":""}>روشن</option>
            </select>
          </div>
          <div class="field"><label>Accent</label><input id="accent" type="color" value="${esc(state.theme.accent)}"></div>
          <div class="field"><label>گردی کارت‌ها: <span id="radiusValue">${state.theme.radius}</span></label><input id="radius" type="range" min="4" max="32" value="${state.theme.radius}"></div>
          <div class="field"><label>تراکم</label>
            <select id="density">
              <option value="comfortable" ${state.theme.density==="comfortable"?"selected":""}>راحت</option>
              <option value="compact" ${state.theme.density==="compact"?"selected":""}>فشرده</option>
            </select>
          </div>
        </section>

        <div class="section-head"><div><h2>ماژول‌ها</h2><small>نمایش، نام و ترتیب</small></div></div>
        <section class="panel module-editor">
          ${state.modules.map((m,i)=>`
            <div class="editor-row" data-editor-id="${esc(m.id)}">
              <input class="module-visible" type="checkbox" ${m.visible!==false?"checked":""} aria-label="نمایش">
              <div>
                <input class="module-title" value="${esc(m.title)}" style="width:100%;padding:9px;border-radius:9px;border:1px solid var(--border);background:var(--surface);color:var(--text)">
                <div class="row-sub">${esc(m.emoji)} ${esc(m.id)}</div>
              </div>
              <div class="editor-actions">
                <button class="mini" data-move="up" data-id="${esc(m.id)}" ${i===0?"disabled":""}>↑</button>
                <button class="mini" data-move="down" data-id="${esc(m.id)}" ${i===state.modules.length-1?"disabled":""}>↓</button>
              </div>
            </div>`).join("")}
        </section>

        <div class="section-head"><h2>کنترل</h2></div>
        <section class="toolbar">
          <button class="primary-btn" data-action="save-studio">ذخیره تغییرات</button>
          <button class="ghost-btn" data-action="export">خروجی JSON</button>
          <button class="danger-btn" data-action="reset">بازنشانی</button>
        </section>
      </main>
      ${bottomNav()}`;
  }

  function render(){
    applyTheme();
    const app = document.getElementById("app");
    let html;
    if(route==="home") html=home();
    else if(route==="studio") html=studio();
    else if(route==="activity") html=activity();
    else if(route.startsWith("module:")) html=modulePage(route.split(":")[1]);
    else html=home();
    app.innerHTML = `<div class="shell">${html}</div>`;
  }

  document.addEventListener("click", e=>{
    const routeEl = e.target.closest("[data-route]");
    if(routeEl){ navigate(routeEl.dataset.route); return; }

    const moduleEl = e.target.closest("[data-module]");
    if(moduleEl){ navigate(`module:${moduleEl.dataset.module}`); return; }

    const actionEl = e.target.closest("[data-action]");
    if(actionEl){
      const action = actionEl.dataset.action;
      if(action==="back"){ navigate("home"); }
      if(action==="toggle-theme"){
        state.theme.mode = state.theme.mode==="dark" ? "light" : "dark";
        saveState("");
        render();
      }
      if(action==="demo-add") toast("در v0.3 رویداد دکمه واقعی است؛ اتصال دیتابیس مرحله بعد.");
      if(action==="save-studio"){
        state.workspace.name = document.getElementById("workspaceName").value.trim() || DEFAULT.workspace.name;
        state.workspace.subtitle = document.getElementById("workspaceSubtitle").value.trim() || DEFAULT.workspace.subtitle;
        state.theme.mode = document.getElementById("themeMode").value;
        state.theme.accent = document.getElementById("accent").value;
        state.theme.radius = Number(document.getElementById("radius").value);
        state.theme.density = document.getElementById("density").value;

        document.querySelectorAll("[data-editor-id]").forEach(row=>{
          const m=state.modules.find(x=>x.id===row.dataset.editorId);
          if(m){
            m.title=row.querySelector(".module-title").value.trim() || m.title;
            m.visible=row.querySelector(".module-visible").checked;
          }
        });
        saveState("تغییرات Studio ذخیره شد");
        render();
      }
      if(action==="reset"){
        if(confirm("همه تنظیمات Runtime به حالت اولیه برگردد؟")){
          localStorage.removeItem(STORAGE_KEY);
          Object.keys(state).forEach(k=>delete state[k]);
          Object.assign(state,clone(DEFAULT));
          saveState("بازنشانی شد");
          render();
        }
      }
      if(action==="export"){
        const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download="farmandeh-workspace.json";
        a.click();
        URL.revokeObjectURL(a.href);
        toast("فایل تنظیمات ساخته شد");
      }
    }

    const moveEl = e.target.closest("[data-move]");
    if(moveEl){
      const idx=state.modules.findIndex(x=>x.id===moveEl.dataset.id);
      const next=moveEl.dataset.move==="up" ? idx-1 : idx+1;
      if(idx>=0 && next>=0 && next<state.modules.length){
        [state.modules[idx],state.modules[next]]=[state.modules[next],state.modules[idx]];
        saveState("");
        render();
      }
    }
  });

  document.addEventListener("input", e=>{
    if(e.target.id==="radius"){
      const out=document.getElementById("radiusValue");
      if(out) out.textContent=e.target.value;
      document.documentElement.style.setProperty("--radius",`${e.target.value}px`);
    }
    if(e.target.id==="accent"){
      document.documentElement.style.setProperty("--accent",e.target.value);
    }
  });

  // Browser Back: module/studio/activity -> Command Center first.
  history.replaceState({farmandeh:true}, "");
  window.addEventListener("popstate", ()=>{
    if(route!=="home"){
      route="home";
      render();
      history.pushState({farmandeh:true},"");
    }
  });

  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }

  render();
})();
