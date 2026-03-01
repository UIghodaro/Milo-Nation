export async function sGet(k) {
  try {
    const r = await window.storage.get(k);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}

export async function sSet(k, v) {
  try {
    await window.storage.set(k, JSON.stringify(v));
  } catch {}
}
