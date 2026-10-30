/**
 * hitungSkor – Pure-function SAW (Simple Additive Weighting) score calculator.
 * Extracted so it can be unit-tested without Prisma.
 *
 * @param {Map<number, number>}  mhsSkillsMap   kompetensi_id → numeric level (1/2/3)
 * @param {Array<{kompetensi_id, bobot, wajib}>} kompetensiList  kompetensi lowongan
 * @returns {{ skor: number, wajibTerpenuhi: boolean, skorMentah: number } | null}
 *   Returns null if kompetensiList is empty or total bobot is 0.
 */
export function hitungSkor(mhsSkillsMap, kompetensiList, { LEVEL_MAKS = 3, FAKTOR_WAJIB_GAGAL = 0.5 } = {}) {
  if (!kompetensiList || kompetensiList.length === 0) return null;

  let sumBobotKaliNilai = 0;
  let sumBobot = 0;
  let wajibTerpenuhi = true;

  for (const lk of kompetensiList) {
    const bobot = Number(lk.bobot);
    const levelMhs = mhsSkillsMap.get(lk.kompetensi_id) ?? 0;

    sumBobot += bobot;
    sumBobotKaliNilai += bobot * (levelMhs / LEVEL_MAKS);

    if (lk.wajib && levelMhs === 0) {
      wajibTerpenuhi = false;
    }
  }

  if (sumBobot === 0) return null;

  const skorMentah = (sumBobotKaliNilai / sumBobot) * 100;
  const skor = Math.max(0, Math.min(100, Number(
    (wajibTerpenuhi ? skorMentah : skorMentah * FAKTOR_WAJIB_GAGAL).toFixed(2)
  )));

  return { skor, wajibTerpenuhi, skorMentah: Number(skorMentah.toFixed(2)) };
}
