import { Card, PageHeader, SectionTitle } from '../components/ui'

function Privacy() {
  return (
    <div>
      <PageHeader back title="Privacidade" subtitle="Em poucas palavras: seus registros ficam só no seu aparelho." />
      <Card>
        <ul className="list-disc space-y-2 pl-5 text-ink-soft">
          <li>Não há cadastro, login ou conta.</li>
          <li>Diário, check-ins, práticas, anotações, preferências e gravações ficam salvos neste navegador, neste aparelho (IndexedDB).</li>
          <li>Nada disso é enviado para servidores, ferramentas de análise ou inteligência artificial.</li>
          <li>O app não usa cookies de rastreamento nem analytics.</li>
          <li>Se você limpar os dados do navegador ou trocar de aparelho, os registros não vão junto. Use "Exportar meus dados" para guardar uma cópia.</li>
        </ul>
      </Card>
      <SectionTitle>O que é salvo</SectionTitle>
      <Card>
        <dl className="space-y-3 text-sm">
          {[
            ['Preferências', 'Nome (opcional), forma de tratamento, respostas dos primeiros passos, favoritos e ajustes.'],
            ['Check-ins', 'Nota de 0 a 10 e, se você preencher, sentimento, sensação e gatilho.'],
            ['Diário', 'O que você escrever. Todos os campos são opcionais.'],
            ['Práticas', 'Qual prática, quando, se foi concluída e sua avaliação opcional.'],
            ['Gravações', 'Áudios de ensaio, apenas se você autorizar o microfone e gravar.'],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="font-semibold">{t}</dt>
              <dd className="text-ink-soft">{d}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <SectionTitle>Seus direitos</SectionTitle>
      <p className="text-ink-soft">
        Você pode exportar ou apagar todos os dados a qualquer momento em Perfil. Se no futuro houver sincronização entre aparelhos, ela será opcional, com consentimento separado, criptografia e adequação à LGPD.
      </p>
      <SectionTitle>Links externos</SectionTitle>
      <p className="text-ink-soft">Botões como Instagram, CVV, mapa ou página de pagamento abrem sites de terceiros, que têm suas próprias políticas. O app só abre esses sites quando você toca no botão.</p>
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
