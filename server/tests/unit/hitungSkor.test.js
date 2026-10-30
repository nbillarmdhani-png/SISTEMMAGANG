import { describe, it, expect } from 'vitest';
import { hitungSkor } from '../../src/utils/hitungSkor.js';

// ─── Test hitungSkor (T-73) ───────────────────────────────────────────────────

const OPTS = { LEVEL_MAKS: 3, FAKTOR_WAJIB_GAGAL: 0.5 };

describe('hitungSkor', () => {
  it('returns null for empty kompetensi list', () => {
    expect(hitungSkor(new Map(), [])).toBeNull();
  });

  it('returns null when total bobot = 0', () => {
    const skills = new Map([[1, 2]]);
    const kompetensi = [{ kompetensi_id: 1, bobot: 0, wajib: 0 }];
    expect(hitungSkor(skills, kompetensi)).toBeNull();
  });

  it('skor = 100 ketika semua kompetensi mahir (level=3)', () => {
    const skills = new Map([
      [1, 3], // mahir
      [2, 3], // mahir
    ]);
    const kompetensi = [
      { kompetensi_id: 1, bobot: 1, wajib: 0 },
      { kompetensi_id: 2, bobot: 1, wajib: 0 },
    ];
    const result = hitungSkor(skills, kompetensi, OPTS);
    expect(result).not.toBeNull();
    expect(result.skor).toBe(100);
    expect(result.wajibTerpenuhi).toBe(true);
  });

  it('skor = 0 ketika tidak punya skill apapun (tanpa wajib)', () => {
    const skills = new Map();
    const kompetensi = [{ kompetensi_id: 1, bobot: 1, wajib: 0 }];
    const result = hitungSkor(skills, kompetensi, OPTS);
    expect(result.skor).toBe(0);
    expect(result.wajibTerpenuhi).toBe(true);
  });

  it('skor dikalikan FAKTOR_WAJIB_GAGAL ketika wajib tidak terpenuhi', () => {
    const skills = new Map([[2, 2]]); // hanya punya skill 2 (menengah)
    const kompetensi = [
      { kompetensi_id: 1, bobot: 1, wajib: 1 }, // wajib, tidak dimiliki
      { kompetensi_id: 2, bobot: 1, wajib: 0 }, // opsional, dimiliki menengah
    ];
    const result = hitungSkor(skills, kompetensi, OPTS);
    expect(result.wajibTerpenuhi).toBe(false);
    // skorMentah = ((0/3)*1 + (2/3)*1) / 2 * 100 = 33.33
    expect(result.skor).toBe(16.67);
  });

  it('skor = 0 ketika semua wajib tidak terpenuhi dan tidak punya skill apapun', () => {
    const skills = new Map();
    const kompetensi = [
      { kompetensi_id: 1, bobot: 2, wajib: 1 },
      { kompetensi_id: 2, bobot: 1, wajib: 1 },
    ];
    const result = hitungSkor(skills, kompetensi, OPTS);
    expect(result.skor).toBe(0);
    expect(result.wajibTerpenuhi).toBe(false);
  });

  it('bobot tidak merata: kompetensi bobot lebih besar berpengaruh lebih besar pada skor', () => {
    const skills = new Map([
      [1, 3], // mahir, bobot 3
      [2, 1], // pemula, bobot 1
    ]);
    const kompetensi = [
      { kompetensi_id: 1, bobot: 3, wajib: 0 },
      { kompetensi_id: 2, bobot: 1, wajib: 0 },
    ];
    const result = hitungSkor(skills, kompetensi, OPTS);
    // (3*1 + 1*(1/3)) / 4 * 100 = (3.333/4) * 100 = 83.33
    expect(result.skor).toBeGreaterThan(80);
    expect(result.skor).toBeLessThanOrEqual(100);
  });

  it('skor tidak pernah negatif', () => {
    const skills = new Map();
    const kompetensi = Array.from({ length: 5 }, (_, i) => ({
      kompetensi_id: i + 1, bobot: 1, wajib: 1,
    }));
    const result = hitungSkor(skills, kompetensi, OPTS);
    expect(result.skor).toBeGreaterThanOrEqual(0);
  });

  it('skor tidak pernah melebihi 100', () => {
    const skills = new Map([[1, 3]]);
    const kompetensi = [{ kompetensi_id: 1, bobot: 999, wajib: 0 }];
    const result = hitungSkor(skills, kompetensi, OPTS);
    expect(result.skor).toBeLessThanOrEqual(100);
  });

  it('kompetensi yang tidak dimiliki dan tidak wajib: tidak penalti tambahan', () => {
    const skills = new Map([[1, 3]]);
    const kompetensi = [
      { kompetensi_id: 1, bobot: 1, wajib: 0 },
      { kompetensi_id: 2, bobot: 1, wajib: 0 }, // tidak dimiliki, tidak wajib
    ];
    const result = hitungSkor(skills, kompetensi, OPTS);
    // Hanya bobot-weighted, bukan faktor penalti
    expect(result.wajibTerpenuhi).toBe(true);
    expect(result.skor).toBe(50); // 50% mahir dari 2 kompetensi sama bobot
  });
});
