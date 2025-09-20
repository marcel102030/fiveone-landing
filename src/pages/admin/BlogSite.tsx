import "../AdministracaoFiveOne.css";

export default function AdminBlogSite() {
  document.title = "Administração | Five One — Blog";
  return (
    <div className="adm5-wrap">
      <div className="adm5-topbar" style={{marginBottom:12}}>
        <h1 className="adm5-title">Blog do Site</h1>
        <button className="adm5-pill" onClick={()=> window.history.length ? history.back() : (location.hash = '#/admin/administracao')}>← Voltar ao hub</button>
      </div>
      <p className="adm5-sub">Área em construção. Em breve, criação e publicação de posts.</p>
    </div>
  );
}
