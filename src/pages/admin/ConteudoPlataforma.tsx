import "../AdministracaoFiveOne.css";

export default function AdminConteudoPlataforma() {
  document.title = "Administração | Five One — Conteúdo";
  return (
    <div className="adm5-wrap">
      <div className="adm5-topbar" style={{marginBottom:12}}>
        <h1 className="adm5-title">Conteúdo da Plataforma</h1>
        <button className="adm5-pill" onClick={()=> window.history.length ? history.back() : (location.hash = '#/admin/administracao')}>← Voltar ao hub</button>
      </div>
      <p className="adm5-sub">Área em construção. Em breve, gerenciamento de cursos, módulos, aulas e materiais.</p>
    </div>
  );
}
