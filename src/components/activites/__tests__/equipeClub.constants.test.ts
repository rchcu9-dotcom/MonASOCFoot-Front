import { describe, it, expect } from 'vitest';
import { LABEL_EQUIPE } from '../equipeClub.constants';

describe('LABEL_EQUIPE', () => {
  it('associe le libellé "A" au code "A"', () => {
    expect(LABEL_EQUIPE.A).toBe('A');
  });

  it('associe le libellé "B" au code "B"', () => {
    expect(LABEL_EQUIPE.B).toBe('B');
  });

  it('associe le libellé "Vét" au code "Vet"', () => {
    expect(LABEL_EQUIPE.Vet).toBe('Vét');
  });

  it("expose exactement les trois codes d'équipe connus", () => {
    expect(Object.keys(LABEL_EQUIPE).sort()).toEqual(['A', 'B', 'Vet']);
  });
});
