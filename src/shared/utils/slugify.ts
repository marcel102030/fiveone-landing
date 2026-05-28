export function slugify(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-')                      // troca espaços e símbolos por hífen
      .replace(/(^-|-$)+/g, '');                        // tira hífens nas pontas
  }