import { filterAddresses, normalize } from './filterAddresses';

const data = [
  { id: 1, street: 'Rua São José', cep: '38400-000', neighborhood: 'Mansour' },
  { id: 2, street: 'Rua Oscar Machado', cep: '38401-078', neighborhood: 'Presidente Roosevelt' },
  { id: 3, street: 'Avenida Brasil', cep: '38400-650', neighborhood: 'Brasil' },
];

describe('normalize', () => {
  it('remove acentos, upper e trim', () => {
    expect(normalize('  São  ')).toBe('SAO');
  });
  it('trata undefined e null', () => {
    expect(normalize(undefined)).toBe('');
    expect(normalize(null)).toBe('');
  });
});

describe('filterAddresses', () => {
  it('retorna vazio para query vazia', () => {
    expect(filterAddresses(data, '')).toEqual([]);
  });
  it('encontra por rua com e sem acento', () => {
    const r1 = filterAddresses(data, 'sao');
    const r2 = filterAddresses(data, 'são');
    expect(r1.map(x => x.id)).toEqual([1]);
    expect(r2.map(x => x.id)).toEqual([1]);
  });
  it('encontra por CEP', () => {
    const r = filterAddresses(data, '38400');
    expect(r.map(x => x.id)).toEqual([1, 3]);
  });
  it('encontra por bairro', () => {
    const r = filterAddresses(data, 'Roosevelt');
    expect(r.map(x => x.id)).toEqual([2]);
  });
});
