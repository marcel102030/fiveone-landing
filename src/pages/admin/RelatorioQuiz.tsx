import "../AdministracaoFiveOne.css";

export default function AdminRelatorioQuiz() {
  document.title = "Administração | Five One — Relatório Quiz";
  return (
    <div className="adm5-wrap">
      <div className="adm5-topbar" style={{marginBottom:12}}>
        <h1 className="adm5-title">Relatório do Quiz</h1>
        <button className="adm5-pill" onClick={()=> window.history.length ? history.back() : (location.hash = '#/admin/administracao')}>← Voltar ao hub</button>
      </div>
      <p className="adm5-sub">Área em construção. Em breve, relatórios consolidados, filtros e exportações.</p>
    </div>
  );
}
