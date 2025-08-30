


export const onRequestGet = async (ctx: any) => {
  const slug = ctx.params?.slug as string;

  // SITE_URL vem da env ou do host da request
  const site = (ctx.env.SITE_URL as string) || `https://${ctx.request.headers.get('host')}`;

  // Redireciona para a rota do quiz com querystring
  const target = `${site}/#/teste-dons?churchSlug=${encodeURIComponent(slug)}`;

  return Response.redirect(target, 302);
};