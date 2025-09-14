const LS_KEY = "moo_diaries";

function readAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function writeAll(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

export function createDiary(data) {
  const list = readAll();
  const id = Date.now().toString();
  list.push({ id, ...data });
  writeAll(list);
  return { id };
}

export function getDiary(id) {
  const it = readAll().find(x => x.id === id);
  if (!it) throw new Error("NOT_FOUND");
  return it;
}

export function updateDiary(id, data) {
  const list = readAll();
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) throw new Error("NOT_FOUND");
  list[idx] = { ...list[idx], ...data };
  writeAll(list);
  return { id };
}