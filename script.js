const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// === Progress Tracker ===
function updateProgress(step){
  const order=['checklist','risk','mt5','journal'];
  order.forEach((id,i)=>{
    const el=$('#step-'+id);
    el.classList.remove('active','done');
    if(i<order.indexOf(step)) el.classList.add('done');
    else if(id===step) el.classList.add('active');
  });
}
updateProgress('checklist');

// === Page Switcher ===
function showPage(id){
  $$('main .page').forEach(p=>p.classList.add('hidden'));
  $('#'+id).classList.remove('hidden');
}

// === Checklist ===
const checklistItems=[
  "Market bias confirmed","EMA trend aligned","Order Block valid","FVG confirmation",
  "Support/Resistance respected","No major news","Candle close confirmed","Proper RR setup",
  "Discipline maintained","Trade size within plan"
];
let checked=new Array(checklistItems.length).fill(false);
const list=$('#checklist-items');
checklistItems.forEach((text,i)=>{
  const li=document.createElement('li');
  li.innerHTML=`<label><input type="checkbox" data-i="${i}"> ${text}</label>`;
  list.appendChild(li);
});
$$('input[type="checkbox"]').forEach(cb=>{
  cb.addEventListener('change',()=>{
    checked[cb.dataset.i]=cb.checked;
    const pct=Math.round(checked.filter(Boolean).length/checklistItems.length*100);
    $('#accuracy').textContent=pct;
    $('#to-risk').disabled=pct<65;
  });
});

$('#to-risk').addEventListener('click',()=>{
  updateProgress('risk');
  showPage('risk');
});

// === Risk Management ===
function calcRisk(){
  const bal=parseFloat($('#balance').value);
  const riskPct=parseFloat($('#riskPercent').value);
  const sl=parseFloat($('#stopLoss').value);
  if(!bal||!riskPct||!sl){$('#open-mt5').disabled=true;return;}
  const riskAmt=(bal*(riskPct/100)).toFixed(2);
  const lot=(riskAmt/sl).toFixed(2);
  $('#riskAmount').textContent=`$${riskAmt}`;
  $('#lotSize').textContent=lot;
  $('#open-mt5').disabled=false;
}
['balance','riskPercent','stopLoss'].forEach(id=>$('#'+id)?.addEventListener('input',calcRisk));

$('#open-mt5').addEventListener('click',()=>{
  updateProgress('mt5');
  showPage('mt5');
});

// === Open MT5 Web Terminal ===
$('#open-mt5-tab').addEventListener('click',()=>{
  window.open('https://web.metatrader.app/terminal?mode=demo&lang=en','_blank');
  alert('🌐 MT5 Terminal opened in a new tab.\nOnce you place your trade, return here and click "Next → Journal".');
});

// === Go to Journal ===
$('#to-journal').addEventListener('click',()=>{
  updateProgress('journal');
  showPage('journal');
});

// === Journal ===
let journal = JSON.parse(localStorage.getItem('journal') || '[]');
function renderJournal(){
  const list=$('#journal-list'); list.innerHTML='';
  journal.forEach(j=>{
    const d=new Date(j.date);
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<strong>${j.symbol}</strong> ${j.direction} | Lot ${j.lot} | RR ${j.rr} | P/L ${j.plUsd}<br><span>${d.toLocaleString()}</span>`;
    list.appendChild(div);
  });
}

$('#save-journal').addEventListener('click',()=>{
  const entry={
    date:Date.now(),
    symbol:$('#j-symbol').value,
    direction:$('#j-direction').value,
    rr:$('#j-rr').value,
    lot:$('#j-lot').value,
    plUsd:$('#j-pl').value
  };
  journal.unshift(entry);
  localStorage.setItem('journal',JSON.stringify(journal));
  renderJournal();
  alert('✅ Trade saved successfully!');
});

renderJournal();

// === Reset ===
$('#reset-site').addEventListener('click',()=>{
  localStorage.clear();
  alert('✅ Reset complete! Refresh to start a new session.');
  location.reload();
});
