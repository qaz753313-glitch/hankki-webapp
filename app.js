const foodCatalog = [
  { name: '닭가슴살 핫바', kcal: 145, emoji: '🌭', group: '편의점 · 간편식' },
  { name: '참치마요 삼각김밥', kcal: 185, emoji: '🍙', group: '편의점 · 간편식' },
  { name: '닭가슴살 샐러드', kcal: 265, emoji: '🥗', group: '든든한 한 끼' },
  { name: '연어 포케', kcal: 420, emoji: '🥑', group: '든든한 한 끼' },
  { name: '그릭요거트', kcal: 155, emoji: '🥣', group: '간식 · 디저트' },
  { name: '저당 프로틴 음료', kcal: 130, emoji: '🥛', group: '간식 · 디저트' },
  { name: '바나나', kcal: 105, emoji: '🍌', group: '간식 · 디저트' },
  { name: '신라면', kcal: 500, emoji: '🍜', group: '편의점 · 간편식' },
  { name: '아메리카노', kcal: 10, emoji: '☕', group: '음료' },
  { name: '아이스 라떼', kcal: 160, emoji: '🧋', group: '음료' },
  { name: '삶은 달걀', kcal: 78, emoji: '🥚', group: '간식 · 디저트' },
  { name: '김치볶음밥', kcal: 520, emoji: '🍳', group: '든든한 한 끼' }
];
const seedMeals = [
  { id: 'seed-1', name: '참치마요 삼각김밥', kcal: 185, emoji: '🍙', group: '편의점 · 간편식', time: '08:42', period: '아침' },
  { id: 'seed-2', name: '아이스 라떼', kcal: 160, emoji: '🧋', group: '음료', time: '10:15', period: '간식' }
];
const storeKey = 'hankki-meals-v1';
const goalKey = 'hankki-goal-v1';
let meals = JSON.parse(localStorage.getItem(storeKey) || 'null') || seedMeals;
let goal = Number(localStorage.getItem(goalKey)) || 2000;
const $ = (selector) => document.querySelector(selector);
const won = (number) => Math.round(number).toLocaleString('ko-KR');
function save() { localStorage.setItem(storeKey, JSON.stringify(meals)); localStorage.setItem(goalKey, String(goal)); }
function render() {
  const total = meals.reduce((sum, meal) => sum + Number(meal.kcal), 0);
  const remaining = goal - total;
  const percent = Math.min(100, Math.max(0, total / goal * 100));
  $('#eaten').textContent = won(total); $('#remaining').textContent = won(Math.abs(remaining));
  $('#goal-label').textContent = won(goal); $('#goal-label').parentElement.childNodes[0].textContent = remaining < 0 ? '목표 초과 ' : '목표 ';
  $('#remaining').nextElementSibling.textContent = remaining < 0 ? 'kcal 초과' : 'kcal 남음';
  $('#progress-fill').style.width = `${percent}%`; $('#progress-knob').style.left = `${percent}%`;
  const rice = total / 300; const walk = total / 5;
  $('#rice-eq').textContent = `${rice.toFixed(1)}공기`;
  $('#walk-eq').textContent = `${Math.round(walk)}분`;
  $('#balance-note').innerHTML = remaining < 0 ? `오늘 목표보다 <b>${won(-remaining)} kcal</b> 더 먹었어요. 괜찮아요, 내일 또 이어가요.` : `밥 약 <b>${(remaining / 300).toFixed(1)}공기</b> 만큼 더 먹을 수 있어요.`;
  $('#meal-count').textContent = meals.length;
  $('#meal-list').innerHTML = meals.length ? meals.map(meal => `<article class="meal-row"><div class="meal-emoji">${meal.emoji}</div><div class="meal-info"><div class="meal-name">${escapeHtml(meal.name)}</div><div class="meal-meta">${meal.period} · ${meal.time} · ${escapeHtml(meal.group || '직접 입력')}</div></div><div class="meal-kcal">${won(meal.kcal)} <small>kcal</small></div><button class="delete-meal" data-id="${meal.id}" title="기록 삭제" aria-label="${escapeHtml(meal.name)} 기록 삭제">×</button></article>`).join('') : '<div class="empty-state">아직 오늘의 기록이 없어요. 첫 끼를 가볍게 추가해볼까요?</div>';
  $('#meal-list').querySelectorAll('.delete-meal').forEach(button => button.addEventListener('click', () => { meals = meals.filter(meal => meal.id !== button.dataset.id); save(); render(); }));
}
function escapeHtml(text) { return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function showToast(message) { $('#toast-text').textContent = message; $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2200); }
function periodNow() { const hour = new Date().getHours(); return hour < 10 ? '아침' : hour < 15 ? '점심' : hour < 21 ? '저녁' : '간식'; }
function timeNow() { return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); }
function addFood(food) { meals.unshift({ id: crypto.randomUUID(), ...food, time: timeNow(), period: periodNow() }); save(); render(); closeModal(); showToast(`${food.name} 기록을 추가했어요`); }
function renderFoods(query = '') {
  const matches = foodCatalog.filter(food => food.name.toLowerCase().includes(query.trim().toLowerCase()) || food.group.includes(query.trim())).slice(0, 8);
  $('#food-results').innerHTML = matches.length ? matches.map((food, index) => `<button class="food-option" data-index="${index}"><span class="food-emoji">${food.emoji}</span><span><b>${escapeHtml(food.name)}</b><small>${escapeHtml(food.group)}</small></span><span class="food-kcal">${food.kcal}<small> kcal</small></span></button>`).join('') : '<div class="food-empty">검색 결과가 없어요. 직접 입력해도 괜찮아요.</div>';
  $('#food-results').querySelectorAll('.food-option').forEach(button => button.addEventListener('click', () => addFood(matches[Number(button.dataset.index)])));
}
function openModal() { $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false'); $('#food-search').value = ''; renderFoods(); setTimeout(() => $('#food-search').focus(), 50); }
function closeModal() { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); $('#manual-form').classList.remove('visible'); }
$('#add-meal').addEventListener('click', openModal);
$('#modal-close').addEventListener('click', closeModal);
$('#modal').addEventListener('click', event => { if (event.target === $('#modal')) closeModal(); });
$('#food-search').addEventListener('input', event => renderFoods(event.target.value));
$('#manual-toggle').addEventListener('click', () => $('#manual-form').classList.toggle('visible'));
$('#manual-add').addEventListener('click', () => {
  const name = $('#manual-name').value.trim(); const kcal = Number($('#manual-calories').value);
  if (!name || !Number.isFinite(kcal) || kcal <= 0) { showToast('음식 이름과 칼로리를 입력해 주세요'); return; }
  addFood({ name, kcal, emoji: '🍽️', group: '직접 입력' }); $('#manual-name').value = ''; $('#manual-calories').value = '';
});
$('#clear-day').addEventListener('click', () => { if (!meals.length) return; meals = []; save(); render(); showToast('오늘 기록을 비웠어요'); });
$('#goal-edit').addEventListener('click', () => { const value = prompt('하루 칼로리 목표를 입력해 주세요.', String(goal)); const next = Number(value); if (value !== null && Number.isFinite(next) && next >= 500 && next <= 6000) { goal = Math.round(next); save(); render(); showToast('목표를 바꿨어요'); } });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openModal(); } });
$('#today-label').textContent = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
save(); render();
