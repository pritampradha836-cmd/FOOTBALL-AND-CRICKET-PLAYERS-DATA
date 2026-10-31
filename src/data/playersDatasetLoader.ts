import Papa from 'papaparse';
import { PlayerRecord } from '../types/tableau';

let cachedPlayers: PlayerRecord[] | null = null;
let isLoading = false;

export const loadPlayersDataset = async (): Promise<PlayerRecord[]> => {
  if (cachedPlayers && cachedPlayers.length > 0) {
    return cachedPlayers;
  }

  if (isLoading) {
    // Wait briefly if another load is ongoing
    await new Promise((r) => setTimeout(r, 200));
    if (cachedPlayers) return cachedPlayers;
  }

  isLoading = true;
  try {
    const csvPath = '/assets/aistudio/players_data-2026_2027_84349e62.csv';
    const response = await fetch(csvPath);
    if (!response.ok) {
      throw new Error(`Failed to load dataset: ${response.statusText}`);
    }
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const records: PlayerRecord[] = (results.data as any[]).map((row, idx) => {
            const rk = Number(row.Rk) || idx + 1;
            const player = String(row.Player || 'Unknown Player');
            const nation = String(row.Nation || 'Unknown');
            const pos = String(row.Pos || 'MF');
            const squad = String(row.Squad || 'Unknown Squad');
            const comp = String(row.Comp || 'Top League');
            const age = Number(row.Age) || 24;
            const born = Number(row.Born) || 2000;
            const mp = Number(row.MP) || 0;
            const starts = Number(row.Starts) || 0;
            const min = Number(row.Min) || 0;
            const nineties = Number(row['90s']) || 0;
            const gls = Number(row.Gls) || 0;
            const ast = Number(row.Ast) || 0;
            const ga = Number(row['G+A']) || gls + ast;
            const sh = Number(row.Sh) || 0;
            const sot = Number(row.SoT) || 0;
            const ppm = Number(row.PPM) || 0;
            const tklw = Number(row.TklW) || 0;

            return {
              rk,
              player,
              nation,
              pos,
              squad,
              comp,
              age,
              born,
              mp,
              starts,
              min,
              nineties,
              gls,
              ast,
              ga,
              sh,
              sot,
              ppm,
              tklw,
              ...row,
            };
          });

          cachedPlayers = records;
          isLoading = false;
          resolve(records);
        },
        error: (err: any) => {
          isLoading = false;
          reject(err);
        },
      });
    });
  } catch (err) {
    isLoading = false;
    console.error('Error fetching CSV dataset:', err);
    throw err;
  }
};
