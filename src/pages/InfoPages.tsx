import { Card, Notice, PageHeader, SectionTitle } from '../components/ui'
import { isRemoteAvailable } from '../services/remote'

function Privacy() {
  const remote = isRemoteAvailable()
  return (
    <div>
      <PageHeader back title="Privacidade" subtitle="O que fica no seu aparelho, o que pode ser enviado e como mudar de ideia." />
      <Notice tone="alerta" title="Versão para revisão">
        Este texto resume a política de privacidade e ainda passará por revisão antes da publicação definitiva.
      </Notice>

      <SectionTitle>Fica só no seu aparelho, sempre</SectionTitle>
      <Card>
        <ul className="list-disc space-y-2 pl-5 text-ink-soft">
          <li>Diário, check-ins, anotações, práticas feitas, trilhas, favoritos, preferências e gravações de áudio.</li>
          <li>Esses registros ficam neste navegador (IndexedDB) e nunca são enviados para servidores, ferramentas de análise ou inteligência artificial.</li>
          <li>Não há cadastro nem login para usar o app. Não usamos cookies de rastreamento, gravação de tela nem captura de formulários.</li>
          <li>Se você limpar os dados do navegador ou trocar de aparelho, os registros não vão junto. Use "Exportar meus dados" em Perfil.</li>
        </ul>
      </Card>

      <SectionTitle>Pode ser enviado, somente se você escolher</SectionTitle>
      {remote ? null : <p className="mb-3 text-sm text-muted">Nesta versão, nenhum envio está ativo.</p>}
      <div className="space-y-3">
        {[
          ['Estatísticas anônimas de uso', 'Telas abertas, práticas iniciadas e concluídas, etapas do questionário inicial, trilhas e cliques nos botões de contato, com um código aleatório do aparelho. Nunca o que você escreve, responde ou sente.', 'Melhorar o app: saber o que é útil, onde as pessoas desistem e o que precisa mudar.', 'Ativar ou desativar em Perfil, a qualquer momento.'],
          ['Avaliação de uma prática', 'Se a prática foi útil (sim, um pouco, não) e, se você marcar, o comentário.', 'Melhorar as práticas. Não é usada como prova de eficácia clínica.', 'A cada avaliação. O comentário só vai se você marcar a opção.'],
          ['Respostas dos primeiros passos', 'As opções que você marcou (por exemplo, "antes de dormir"). Sem nome, sem nível de agora, sem texto.', 'Entender quais situações e necessidades aparecem mais e melhorar os conteúdos.', 'Escolha separada na tela de resultado. Retirar e apagar em Perfil.'],
          ['Mensagens em "Sua voz importa"', 'Categoria, mensagem e, se você quiser, nome e e-mail.', 'Ler sugestões, responder quando houver e-mail e corrigir problemas.', 'Ao enviar. Exclusão em Perfil ("Apagar dados enviados").'],
        ].map(([t, what, why, how]) => (
          <Card key={t}>
            <p className="font-semibold">{t}</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div>
                <dt className="inline font-medium">O quê: </dt>
                <dd className="inline text-ink-soft">{what}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Para quê: </dt>
                <dd className="inline text-ink-soft">{why}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Como escolher: </dt>
                <dd className="inline text-ink-soft">{how}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      <SectionTitle>O que a Rosa pode ver</SectionTitle>
      <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
        <li>Números agregados: quantas pessoas, sessões, práticas, trilhas, áreas e etapas do questionário. Nunca o caminho de uma pessoa específica.</li>
        <li>As mensagens de "Sua voz importa" e os comentários de práticas que foram enviados.</li>
        <li>Contagens das respostas compartilhadas dos primeiros passos.</li>
        <li>A Rosa não vê seu diário, check-ins, gravações, fotos, nem respostas que você não compartilhou.</li>
      </ul>

      <SectionTitle>Seus direitos (LGPD)</SectionTitle>
      <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
        <li><strong>Retirar o consentimento:</strong> desligue as estatísticas ou retire as respostas compartilhadas em Perfil. Vale para os próximos envios e permite apagar os anteriores.</li>
        <li><strong>Excluir:</strong> em Perfil, "Apagar dados enviados" remove do servidor tudo o que este aparelho enviou.</li>
        <li><strong>Acesso e correção:</strong> peça em "Sua voz importa", informando o código do aparelho mostrado em Perfil.</li>
        <li><strong>Base legal:</strong> consentimento (art. 7º, I, e art. 11, I, da LGPD). Nada é usado para publicidade nem vendido.</li>
        <li><strong>Guarda:</strong> estatísticas por até 13 meses. Mensagens e avaliações até você pedir a exclusão ou até deixarem de ser necessárias.</li>
        <li><strong>Onde ficam:</strong> no banco de dados do serviço Supabase, com acesso protegido e conexão criptografada.</li>
      </ul>

      <SectionTitle>Links externos</SectionTitle>
      <p className="text-ink-soft">Botões como WhatsApp, Instagram, CVV, mapa ou página de pagamento abrem serviços de terceiros, com suas próprias políticas. O app só abre esses serviços quando você toca no botão e não envia nenhum dado seu junto.</p>
    </div>
  )
}

function Limits() {
  return (
    <div>
      <PageHeader back title="Limites e cuidados" subtitle="O que este app é, e o que ele não é." />
      <Card>
        <p className="font-semibold">O INTEGRA | Ansiedade é</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft">
          <li>Conteúdo de autocuidado e psicoeducação.</li>
          <li>Práticas simples para experimentar com cuidado, no seu ritmo.</li>
          <li>Um espaço privado para registrar e observar como você está.</li>
        </ul>
      </Card>
      <Card className="mt-4">
        <p className="font-semibold">Ele não é</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft">
          <li>Diagnóstico, avaliação psicológica ou médica.</li>
          <li>Psicoterapia, nem atendimento com a Rosa.</li>
          <li>Serviço de emergência.</li>
          <li>Orientação sobre medicamentos. Nunca interrompa ou mude um remédio sem falar com quem prescreveu.</li>
        </ul>
      </Card>
      <SectionTitle>Quando procurar ajuda profissional</SectionTitle>
      <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
        <li>Quando a ansiedade atrapalha muito o trabalho, os estudos, o sono ou as relações.</li>
        <li>Quando você evita cada vez mais situações importantes.</li>
        <li>Quando surgem sintomas físicos novos, fortes ou diferentes do habitual.</li>
        <li>Quando aparecem pensamentos de se machucar. Nesse caso, ligue 188 (CVV) ou 192 (SAMU) agora.</li>
      </ul>
      <SectionTitle>Sobre as práticas</SectionTitle>
      <p className="text-ink-soft">
        Nenhuma prática funciona para todo mundo. Algumas têm mais pesquisa, outras menos. As marcadas com "Revisão profissional necessária" aguardam validação da Rosa. Você pode parar qualquer exercício a qualquer momento.
      </p>
    </div>
  )
}

export default function InfoPages({ page }: { page: 'privacidade' | 'limites' }) {
  return page === 'privacidade' ? <Privacy /> : <Limits />
}
