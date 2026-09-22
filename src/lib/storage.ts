/** Satu-satunya pintu ke Web Storage (RnD 27.2). Diisi penuh di Phase 5. */
export function isStorageAvailable(): boolean {
  try {
    const probe = "gr:__probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
