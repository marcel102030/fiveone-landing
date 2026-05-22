import { useNavigate } from "react-router-dom";
import "./AdministracaoFiveOne.css";

export default function AdminBlogSite() {
  document.title = "Administração | Five One — Blog";
  const navigate = useNavigate();
  return (
    <div className="adm5-wrap">
      <div className="adm5-topbar" style={{marginBottom:12}}>
        <h1 className="adm5-title">Blog do Site</h1>
        <button className="adm5-pill" onClick={()=> window.history.length > 1 ? history.back() : navigate('/admin/administracao')}>← Voltar ao hub</button>
      </div>
      <p className="adm5-sub">Área em construção. Em breve, criação e publicação de posts.</p>
    </div>
  );
}
