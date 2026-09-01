import { useState, type FormEvent } from "react";
import { FiBell, FiSend } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { api, obterMensagemErroApi } from "../../services/api";

import "./ComunicadosSistema.css";

export default function ComunicadosSistema() {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [categoria, setCategoria] = useState("Atualização");
  const [publicando, setPublicando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function publicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setPublicando(true);
    setErro("");
    setSucesso("");

    try {
      const response = await api.post<{ destinatarios: number }>(
        "/Notificacoes/sistema",
        { titulo: titulo.trim(), mensagem: mensagem.trim(), categoria },
      );
      setSucesso(`Comunicado enviado para ${response.data.destinatarios} usuário(s).`);
      setTitulo("");
      setMensagem("");
      setCategoria("Atualização");
    } catch (error) {
      setErro(obterMensagemErroApi(error, "Não foi possível publicar o comunicado."));
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="comunicados-layout">
      <Sidebar />
      <main className="comunicados-main">
        <Header titulo="Comunicados do sistema" />
        <section className="comunicados-conteudo">
          <div className="comunicados-intro">
            <FiBell />
            <div>
              <h1>Publicar atualização</h1>
              <p>Envie novidades, manutenções e avisos para todos os outros usuários ativos.</p>
            </div>
          </div>

          <form className="comunicados-card" onSubmit={publicar}>
            {erro && <div className="comunicados-alerta erro">{erro}</div>}
            {sucesso && <div className="comunicados-alerta sucesso">{sucesso}</div>}

            <label>
              Categoria
              <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)}>
                <option>Atualização</option>
                <option>Novidade</option>
                <option>Manutenção</option>
                <option>Aviso</option>
              </select>
            </label>

            <label>
              Título
              <input
                required
                maxLength={100}
                placeholder="Ex.: Nova atualização disponível"
                value={titulo}
                onChange={(evento) => setTitulo(evento.target.value)}
              />
              <small>{titulo.length}/100</small>
            </label>

            <label>
              Mensagem
              <textarea
                required
                maxLength={1000}
                rows={8}
                placeholder="Descreva as novidades e alterações do sistema..."
                value={mensagem}
                onChange={(evento) => setMensagem(evento.target.value)}
              />
              <small>{mensagem.length}/1000</small>
            </label>

            <div className="comunicados-acoes">
              <button type="submit" disabled={publicando || !titulo.trim() || !mensagem.trim()}>
                <FiSend />
                {publicando ? "Publicando..." : "Publicar comunicado"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
