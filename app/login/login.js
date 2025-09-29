/* Got2Cook — Login
 * Mantém classes/IDs do seu padrão. Sem libs externas.
 * Perfis salvos, galeria (+) e botões de login (placeholders).
 */

const LS_PROFILES_KEY = "got2cook_profiles";
const LS_CURRENT_PROFILE_KEY = "got2cook_current_profile";

let profiles = [];
let selectedProfileId = null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function loadProfiles() {
  try {
    const raw = localStorage.getItem(LS_PROFILES_KEY);
    profiles = raw ? JSON.parse(raw) : null;
  } catch { profiles = null; }

  if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
    profiles = [
      { id: crypto.randomUUID(), name: "Convidado", emoji: "😀", avatar: "", createdAt: Date.now() },
    ];
    saveProfiles();
  }

  try {
    const rawCurrent = localStorage.getItem(LS_CURRENT_PROFILE_KEY);
    if (rawCurrent) {
      const curr = JSON.parse(rawCurrent);
      if (profiles.some(p => p.id === curr.id)) selectedProfileId = curr.id;
    }
  } catch {}

  if (!selectedProfileId && profiles[0]) selectedProfileId = profiles[0].id;
}

function saveProfiles() {
  localStorage.setItem(LS_PROFILES_KEY, JSON.stringify(profiles));
}

function setCurrentProfile(profile) {
  if (!profile) return;
  selectedProfileId = profile.id;
  localStorage.setItem(LS_CURRENT_PROFILE_KEY, JSON.stringify(profile));
}

function renderProfiles() {
  const container = document.getElementById("perfilContainer");
  if (!container) return;
  container.innerHTML = "";

  profiles.forEach((p) => {
    const wrap = document.createElement("div");
    wrap.className = "perfil-box";

    const btn = document.createElement("button");
    btn.className = "perfil";
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(p.id === selectedProfileId));
    btn.setAttribute("aria-label", `Selecionar perfil ${p.name}`);
    btn.title = `Selecionar ${p.name}`;

    const span = document.createElement("span");
    span.className = "icone-perfil";
    span.textContent = p.emoji || "🙂";
    btn.appendChild(span);

    btn.addEventListener("click", () => {
      setCurrentProfile(p);
      $$(".perfil", container).forEach(el => el.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      console.log("[Got2Cook] Perfil selecionado:", p);
    });

    const name = document.createElement("div");
    name.className = "nome-perfil";
    name.textContent = p.name;

    wrap.appendChild(btn);
    wrap.appendChild(name);
    container.appendChild(wrap);
  });

  // Botão “+” (galeria)
  const addWrap = document.createElement("div");
  addWrap.className = "perfil-box";
  const addBtn = document.createElement("button");
  addBtn.className = "adicionar-conta";
  addBtn.type = "button";
  addBtn.setAttribute("aria-label", "Abrir galeria de perfis");
  addBtn.title = "Adicionar/Selecionar perfil";
  addBtn.textContent = "+";
  addBtn.addEventListener("click", openGalleryModal);
  addWrap.appendChild(addBtn);
  container.appendChild(addWrap);
}

/* ===== Modal simples e acessível, sem alterar seu HTML ===== */
let lastFocusedElement = null;

function trapFocus(modal) {
  const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
    .filter(el => !el.hasAttribute("disabled"));

  function onKey(e){
    if (e.key === "Escape"){ e.preventDefault(); closeModal(modal); return; }
    if (e.key !== "Tab" || focusables.length === 0) return;

    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  modal.addEventListener("keydown", onKey);
  modal._removeTrap = () => modal.removeEventListener("keydown", onKey);
}

function closeModal(modal){
  if (!modal) return;
  if (modal._removeTrap) modal._removeTrap();
  modal.remove();
  if (lastFocusedElement){ lastFocusedElement.focus(); lastFocusedElement = null; }
}

function openGalleryModal(){
  lastFocusedElement = document.activeElement;

  const overlay = document.createElement("div");
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","Galeria de perfis");
  overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:9999;";

  const modal = document.createElement("div");
  modal.style.cssText = "background:#fff; width: min(92vw, 520px); max-height:85vh; overflow:auto; border:2px solid #492f70; border-radius:16px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,.25); color:#492f70; font-family:Arial, sans-serif;";
  modal.innerHTML = `
    <h2 style="margin:0 0 10px; font-size:20px; color:#492f70;">Perfis</h2>
    <div id="gridPerfis" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:16px;"></div>
    <hr style="border:none; border-top:1px solid #eee; margin:12px 0 14px;">
    <h3 style="margin:0 0 10px; font-size:18px;">Adicionar novo perfil</h3>
    <form id="formNovoPerfil" style="display:grid; gap:8px;">
      <label style="display:grid; gap:4px; font-size:14px">
        Nome
        <input id="np_nome" type="text" required aria-required="true" style="padding:10px; border:2px solid #492f70; border-radius:10px;" />
      </label>
      <label style="display:grid; gap:4px; font-size:14px">
        Emoji (opcional)
        <input id="np_emoji" type="text" inputmode="text" maxlength="2" placeholder="😀" style="padding:10px; border:2px solid #492f70; border-radius:10px;" />
      </label>
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:6px;">
        <button type="button" id="btnCancelarModal" style="background:#fff; color:#492f70; border:2px solid #492f70; border-radius:10px; padding:8px 14px; cursor:pointer;">Cancelar</button>
        <button type="submit" style="background:#7b7190; color:#fff; border:none; border-radius:10px; padding:8px 14px; cursor:pointer;">Salvar</button>
      </div>
    </form>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // lista de perfis
  const grid = $("#gridPerfis", modal);
  profiles.forEach((p)=>{
    const card = document.createElement("button");
    card.type = "button";
    card.style.cssText = "display:grid; gap:6px; justify-items:center; padding:10px; border:2px solid #492f70; border-radius:14px; background:#fff; cursor:pointer;";
    card.setAttribute("aria-label", `Selecionar perfil ${p.name}`);
    card.title = `Selecionar ${p.name}`;

    const avatar = document.createElement("div");
    avatar.style.cssText = "width:72px; height:72px; border-radius:50%; border:2px solid #492f70; display:flex; align-items:center; justify-content:center; background:#fff;";
    const span = document.createElement("span");
    span.className = "icone-perfil";
    span.style.fontSize = "28px";
    span.textContent = p.emoji || "🙂";
    avatar.appendChild(span);

    const nm = document.createElement("div");
    nm.style.cssText = "font-size:13px; max-width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
    nm.textContent = p.name;

    card.appendChild(avatar);
    card.appendChild(nm);
    card.addEventListener("click", ()=>{
      setCurrentProfile(p);
      renderProfiles();
      closeModal(overlay);
      console.log("[Got2Cook] Perfil selecionado via galeria:", p);
    });
    grid.appendChild(card);
  });

  // novo perfil
  const form = $("#formNovoPerfil", modal);
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = $("#np_nome", form).value.trim();
    const emoji = $("#np_emoji", form).value.trim() || "😀";
    if (!name) return;
    const newP = { id: crypto.randomUUID(), name, emoji, avatar:"", createdAt: Date.now() };
    profiles.push(newP);
    saveProfiles();
    setCurrentProfile(newP);
    renderProfiles();
    closeModal(overlay);
    console.log("[Got2Cook] Novo perfil criado:", newP);
  });

  $("#btnCancelarModal", modal).addEventListener("click", ()=> closeModal(overlay));

  // acessibilidade
  trapFocus(overlay);
  $("#np_nome", modal).focus();
}

function wireLoginButtons(){
  const map = [
    { sel: ".login-btn.google", provider: "Google" },
    { sel: ".login-btn.apple",  provider: "Apple"  },
    { sel: ".login-btn.email",  provider: "Email"  },
  ];
  map.forEach(({sel, provider})=>{
    const btn = document.querySelector(sel);
    if (!btn) return;
    btn.addEventListener("click", ()=>{
      const curr = profiles.find(p => p.id === selectedProfileId) || null;
      alert(`Login via ${provider} (demo)\nPerfil: ${curr ? curr.name : "—"}`);
      console.log("[Got2Cook] Tentativa de login:", { provider, profile: curr });
      document.body.classList.add("fade-out");
      // setTimeout(()=>{ window.location.href = "home.html"; }, 450);
    });
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", ()=>{
  loadProfiles();
  renderProfiles();
  wireLoginButtons();

  // Enter ativa botões focados
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Enter" && document.activeElement?.tagName === "BUTTON") {
      document.activeElement.click();
    }
  });
});
