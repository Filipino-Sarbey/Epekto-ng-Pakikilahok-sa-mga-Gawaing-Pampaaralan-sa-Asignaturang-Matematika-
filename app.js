
// Add your Supabase project URL and anon key from Project Settings > API.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "sb_publishable_m7YpdXdSiY49Qez-fNJZIA_uKUemIqQ";
const supabaseReady = SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = supabaseReady && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const multipleChoice = [
  { number: 1, text: "Anong uri ng gawain sa matematika ang pinakamadalas mong salihan?", options: [
    "Akademiko (Math Club, quiz bee)", "Tutoring program (Aral Math)", "Mga gawaing aktibidad", "Wala sa nabanggit"
  ]},
  { number: 2, text: "Gaano ka kadalas makilahok sa mga gawaing may kinalaman sa Asignaturang Matematika?", options: [
    "Hindi kailanman", "1-2 beses", "3-4 beses", "4 o higit pa"
  ]},
  { number: 3, text: "Ano ang iyong marka sa Matematika sa nakaraang markahan?", options: [
    "90-100", "85-89", "80-84", "75-79"
  ]}
];
const likert = [
  { number: 4, text: "Mas nauunawaan ko ang mga aralin sa Matematika kapag lumalahok ako sa mga gawaing pang-akademiko." },
  { number: 5, text: "Mas aktibo ako sa talakayan sa Matematika kapag lumalahok ako sa mga tutoring program gaya ng Aral Math." },
  { number: 6, text: "Mas kumpiyansa akong sumagot ng mga Problem Solving sa Matematika kapag sumasali ako sa mga gawaing aktibidad sa aming klase." },
  { number: 7, text: "Naaapektuhan ng mga Tutoring Program gaya ng Aral Math ang aking Marka sa Asignaturang Matematika." },
  { number: 8, text: "Nakatulong sa akin ang mga gawaing ito upang maunawaan ko ng malinaw ang Asignaturang Matematika." }
];
const openQuestions = [
  { number: 9, text: "Paano naapektuhan ng iyong pakikilahok sa mga gawaing pampaaralan sa asignaturang Matematika ang iyong pag-aaral sa Matematika?" },
  { number: 10, text: "Anong uri ng gawain sa matematika ang lubos na nakatulong sayo at bakit?" }
];
const likertLabels = {
  5: "Lubos na sumasang-ayon", 4: "Sumasang-ayon", 3: "Neutral",
  2: "Hindi sumasang-ayon", 1: "Lubos na hindi sumasang-ayon"
};
const state = {
  screen: "intro", index: 0,
  respondent: { name: "", grade_section: "", age: "" },
  multiple: {}, ratings: {}, open: {},
  lastResponses: []
};
const screen = document.getElementById("screen");
const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const sectionLabel = document.getElementById("sectionLabel");
const adminHotspot = document.getElementById("adminHotspot");
const adminDialog = document.getElementById("adminDialog");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}
function show(html) {
  screen.classList.remove("screen"); void screen.offsetWidth;
  screen.innerHTML = html; screen.classList.add("screen");
}
function setProgress(label, current, total) {
  progressWrap.hidden = false;
  sectionLabel.textContent = label.toUpperCase();
  progressText.textContent = `${current} / ${total}`;
  progressFill.style.width = `${(current / total) * 100}%`;
}
function hideProgress() { progressWrap.hidden = true; }
function renderIntro() {
  state.screen = "intro"; hideProgress(); adminHotspot.style.display = "block";
  show(`<p class="eyebrow">SARBey • MATEMATIKA</p>
    <h1>Epekto ng Pakikilahok sa mga Gawaing Pampaaralan sa Asignaturang Matematika</h1>
    <div class="intro-rule"></div>
    <p class="lead">Inaanyayahan kang sagutan ang sarbey na ito tungkol sa epekto ng pakikilahok sa mga gawaing pampaaralan sa iyong pag-aaral sa Matematika. Basahing mabuti ang bawat tanong at piliin o isulat ang sagot na naaangkop sa iyo.</p>
    <div class="intro-meta"><span class="pill">10 katanungan</span><span class="pill">3 bahagi</span><span class="pill">Tinatayang 3–5 minuto</span></div>
    <button class="primary-btn" id="introProceed">Magpatuloy <span>→</span></button>`);
  document.getElementById("introProceed").addEventListener("click", renderRespondent);
}
function renderRespondent() {
  state.screen = "respondent"; adminHotspot.style.display = "none"; hideProgress();
  show(`<p class="eyebrow">IMPORMASYON NG RESPONDENTE</p><h2>Bago tayo magsimula.</h2>
    <p class="muted">Punan ang mga sumusunod na impormasyon.</p>
    <div class="field-grid">
      <label class="field full"><span class="field-label">Pangalan:</span><input class="text-input" id="name" maxlength="120" autocomplete="name" value="${escapeHtml(state.respondent.name)}" placeholder="Ilagay ang iyong pangalan"></label>
      <label class="field"><span class="field-label">Baitang &amp; Seksyon:</span><input class="text-input" id="grade" maxlength="80" value="${escapeHtml(state.respondent.grade_section)}" placeholder="Hal. 10 - Vigan"></label>
      <label class="field"><span class="field-label">Edad:</span><input class="text-input" id="age" type="number" min="10" max="25" value="${escapeHtml(state.respondent.age)}" placeholder="Ilagay ang edad"></label>
    </div>
    <p id="formError" class="error-message" role="alert"></p>
    <div class="nav-row"><span></span><button class="primary-btn" id="respondentNext">Susunod <span>→</span></button></div>`);
  document.getElementById("respondentNext").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const grade = document.getElementById("grade").value.trim();
    const age = Number(document.getElementById("age").value);
    const err = document.getElementById("formError");
    if (!name || !grade || !Number.isInteger(age) || age < 10 || age > 25) {
      err.textContent = "Pakikumpleto ang lahat ng impormasyon. Ilagay ang wastong edad (10–25)."; return;
    }
    state.respondent = { name, grade_section: grade, age };
    renderMultiple(0);
  });
}
function navButtons(previous, nextLabel = "Susunod") {
  return `<div class="nav-row">
    <button class="secondary-btn" id="previousBtn">← Nakaraan</button>
    <button class="primary-btn" id="nextBtn">${nextLabel} <span>→</span></button>
  </div>`;
}
function renderMultiple(index) {
  state.screen = "multiple"; state.index = index; adminHotspot.style.display = "none";
  const q = multipleChoice[index]; setProgress("I. Multiple Choice", index + 1, 10);
  show(`<p class="question-number">TANONG ${q.number} · MULTIPLE CHOICE</p>
    <h2 class="question-title">${escapeHtml(q.text)}</h2>
    <div class="choice-list">${q.options.map((opt,i)=>`<button type="button" class="choice ${state.multiple[q.number]===opt?"selected":""}" data-choice="${i}">
      <span class="choice-letter">${String.fromCharCode(65+i)}</span><span class="choice-text">${escapeHtml(opt)}</span><span class="choice-check">✓</span>
    </button>`).join("")}</div>
    <p id="questionError" class="error-message" role="alert"></p>${navButtons(index===0?"respondent": "multiple")}`);
  screen.querySelectorAll("[data-choice]").forEach(btn => btn.addEventListener("click", () => {
    state.multiple[q.number] = q.options[Number(btn.dataset.choice)];
    screen.querySelectorAll(".choice").forEach(el => el.classList.toggle("selected", el===btn));
  }));
  document.getElementById("previousBtn").addEventListener("click", () => index===0 ? renderRespondent() : renderMultiple(index-1));
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!state.multiple[q.number]) { document.getElementById("questionError").textContent = "Pumili muna ng iyong sagot bago magpatuloy."; return; }
    index < multipleChoice.length-1 ? renderMultiple(index+1) : renderLikert(0);
  });
}
function renderLikert(index) {
  state.screen = "likert"; state.index = index; const q = likert[index];
  setProgress("II. Likert Scale", 3 + index + 1, 10);
  show(`<p class="question-number">TANONG ${q.number} · LIKERT SCALE</p>
    <div class="scale-instructions"><strong>Panuto:</strong><br>
      5 = Lubos na sumasang-ayon<br>4 = Sumasang-ayon<br>3 = Neutral<br>2 = Hindi sumasang-ayon<br>1 = Lubos na hindi sumasang-ayon
      </div>
    <h2 class="question-title">${escapeHtml(q.text)}</h2>
    <div class="stars" role="group" aria-label="Pumili ng rating mula 1 hanggang 5">
      ${[1,2,3,4,5].map(n=>`<button type="button" class="star-btn ${state.ratings[q.number]>=n?"active":""}" data-star="${n}" aria-label="${n} bituin" aria-pressed="${state.ratings[q.number]===n}">★</button>`).join("")}
    </div>
    <div class="rating-caption" id="ratingCaption">${state.ratings[q.number] ? `${state.ratings[q.number]} – ${likertLabels[state.ratings[q.number]]}` : "Pumili ng 1 hanggang 5 bituin"}</div>
    <p id="questionError" class="error-message" role="alert"></p>${navButtons("multiple")}`);
  screen.querySelectorAll("[data-star]").forEach(btn=>btn.addEventListener("click",()=>{
    const n=Number(btn.dataset.star);state.ratings[q.number]=n;
    screen.querySelectorAll(".star-btn").forEach(star=>{const v=Number(star.dataset.star);star.classList.toggle("active",v<=n);star.setAttribute("aria-pressed",String(v===n));});
    document.getElementById("ratingCaption").textContent=`${n} – ${likertLabels[n]}`;
  }));
  document.getElementById("previousBtn").addEventListener("click",()=>index===0?renderMultiple(2):renderLikert(index-1));
  document.getElementById("nextBtn").addEventListener("click",()=>{
    if(!state.ratings[q.number]){document.getElementById("questionError").textContent="Pumili muna ng rating bago magpatuloy.";return;}
    index<likert.length-1?renderLikert(index+1):renderOpen(0);
  });
}
function renderOpen(index) {
  state.screen="open";state.index=index;const q=openQuestions[index];
  setProgress("III. Bukas na tanong",8+index+1,10);
  show(`<p class="question-number">TANONG ${q.number} · BUKAS NA TANONG</p>
    <h2 class="question-title">${escapeHtml(q.text)}</h2>
    <label class="field"><span class="field-label">Iyong sagot:</span><textarea id="openAnswer" class="text-area" maxlength="3000" placeholder="Isulat ang iyong sagot dito...">${escapeHtml(state.open[q.number]||"")}</textarea></label>
    <p id="questionError" class="error-message" role="alert"></p>${navButtons("open",index===1?"Isumite ang sagot":"Susunod")}`);
  document.getElementById("previousBtn").addEventListener("click",()=>{
    state.open[q.number]=document.getElementById("openAnswer").value.trim();
    index===0?renderLikert(4):renderOpen(index-1);
  });
  document.getElementById("nextBtn").addEventListener("click",async()=>{
    state.open[q.number]=document.getElementById("openAnswer").value.trim();
    if(!state.open[q.number]){document.getElementById("questionError").textContent="Pakisagutan ang tanong bago magpatuloy.";return;}
    if(index===0){renderOpen(1);return;}
    await submitSurvey();
  });
}
async function submitSurvey() {
  const btn=document.getElementById("nextBtn");btn.disabled=true;btn.textContent="Ipinapasa...";
  if(!db){btn.disabled=false;btn.textContent="Isumite ang sagot →";document.getElementById("questionError").textContent="Hindi pa nakakonekta ang database. Ilagay muna ang Supabase URL at anon key sa app.js.";return;}
  const payload={
    respondent_name:state.respondent.name,grade_section:state.respondent.grade_section,age:Number(state.respondent.age),
    mc_1:state.multiple[1],mc_2:state.multiple[2],mc_3:state.multiple[3],
    likert_4:state.ratings[4],likert_5:state.ratings[5],likert_6:state.ratings[6],likert_7:state.ratings[7],likert_8:state.ratings[8],
    open_9:state.open[9],open_10:state.open[10]
  };
  const {error}=await db.from("survey_responses").insert(payload);
  if(error){btn.disabled=false;btn.textContent="Isumite ang sagot →";document.getElementById("questionError").textContent="Hindi naipasa ang iyong sagot. Pakisubukang muli. ("+error.message+")";return;}
  hideProgress();show(`<div class="success-mark">✓</div><p class="eyebrow">NAIPASA NA ANG IYONG SAGOT</p>
    <h1>Maraming salamat sa iyong pagsagot.</h1>
    <p class="lead">Matagumpay na naitala ang iyong mga tugon. Malaking tulong ang iyong pakikilahok sa sarbey na ito.</p>
    <div class="intro-rule"></div><button class="secondary-btn" id="finishBtn">Isara ang sarbey</button>`);
  document.getElementById("finishBtn").addEventListener("click",()=>{state.multiple={};state.ratings={};state.open={};state.respondent={name:"",grade_section:"",age:""};renderIntro();});
}
function openAdmin() {
  document.getElementById("adminLogin").hidden=false;document.getElementById("adminDashboard").hidden=true;
  document.getElementById("adminPasscode").value="";document.getElementById("adminError").textContent="";
  adminDialog.showModal();
}
adminHotspot.addEventListener("click",openAdmin);
document.getElementById("adminLoginBtn").addEventListener("click",loadAdmin);
document.getElementById("adminPasscode").addEventListener("keydown",e=>{if(e.key==="Enter")loadAdmin();});
async function loadAdmin(){
  const passcode=document.getElementById("adminPasscode").value;
  const errorBox=document.getElementById("adminError");
  if(!passcode){errorBox.textContent="Ilagay ang passcode.";return;}
  if(!db){errorBox.textContent="Hindi pa nakakonekta ang Supabase. I-configure muna ang app.js.";return;}
  const btn=document.getElementById("adminLoginBtn");btn.disabled=true;btn.textContent="Sinusuri...";
  const {data,error}=await db.functions.invoke("admin-responses",{body:{passcode}});
  btn.disabled=false;btn.innerHTML='Buksan ang dashboard <span>→</span>';
  if(error||!data||!data.ok){errorBox.textContent="Hindi wasto ang passcode o hindi ma-access ang dashboard.";return;}
  state.lastResponses=data.responses||[];
  document.getElementById("adminLogin").hidden=true;document.getElementById("adminDashboard").hidden=false;
  renderAdminResponses();
}
function renderAdminResponses(){
  const list=document.getElementById("responsesList"),rows=state.lastResponses;
  document.getElementById("adminCount").textContent=`Kabuuang respondent: ${rows.length}`;
  if(!rows.length){list.innerHTML='<div class="empty-state">Wala pang naisusumiteng tugon.</div>';return;}
  list.innerHTML=rows.map((r,i)=>{
    const pairs=[
      ["Pangalan",r.respondent_name],["Baitang & Seksyon",r.grade_section],["Edad",r.age],
      ...[1,2,3].map(n=>[`Multiple Choice ${n}`,r[`mc_${n}`]]),
      ...[4,5,6,7,8].map(n=>[`Likert ${n}`,`${r[`likert_${n}`]} – ${likertLabels[r[`likert_${n}`]]||""}`]),
      ["Bukas na tanong 9",r.open_9],["Bukas na tanong 10",r.open_10],["Petsa ng pagsagot",new Date(r.created_at).toLocaleString()]
    ];
    return `<details class="response-card"><summary>Respondent ${i+1} · ${escapeHtml(r.respondent_name)} <span class="muted">— ${escapeHtml(r.grade_section)}</span></summary><dl>${pairs.map(([k,v])=>`<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("")}</dl></details>`;
  }).join("");
}
document.getElementById("refreshAdmin").addEventListener("click",async()=>{
  const btn=document.getElementById("refreshAdmin");btn.disabled=true;
  const passcode=document.getElementById("adminPasscode").value;
  const {data,error}=await db.functions.invoke("admin-responses",{body:{passcode}});
  if(!error&&data?.ok){state.lastResponses=data.responses||[];renderAdminResponses();}
  btn.disabled=false;
});
document.getElementById("exportCsv").addEventListener("click",()=>{
  if(!state.lastResponses.length)return;
  const cols=["respondent_name","grade_section","age","mc_1","mc_2","mc_3","likert_4","likert_5","likert_6","likert_7","likert_8","open_9","open_10","created_at"];
  const csv=[cols.join(","),...state.lastResponses.map(row=>cols.map(k=>`"${String(row[k]??"").replace(/"/g,'""')}"`).join(","))].join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="math-survey-responses.csv";a.click();URL.revokeObjectURL(url);
});
renderIntro();
